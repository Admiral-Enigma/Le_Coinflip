var app = require("express")()
var http = require("http").Server(app)
var io = require('socket.io')(http)
var fs = require('fs')

var logFilePath = './logs/logs.json'
var port = Number(process.env.PORT || 3000)
var counter = 26
var spinning = false
var spin;
var db = {
	headP: 0,
	tailsP: 0,
	pool:[],
	users: [],
	bankBits: 300000,
	usersOnline: 0
}
var log = {
	spinRes: [],
	betsPlaced: [],
	transActions: [],
	events:[]
}
var util = {
	getUnixTime: function () {
		return Math.round(new Date() / 1000);
	},
	saveLogs: function () {
		var logJson = JSON.stringify(log);
		fs.writeFileSync(logFilePath, logJson)
		console.log(util.getUnixTime() + ' Saved log file! (hopefuly)');
	}
}
var banker = {
	giveBits: function (amount, name, bet) {
		var user = banker.findUser(name)
		user.bits += amount
		db.bankBits -= amount
		var transaction = {time:util.getUnixTime(), reciver:user, amount:amount, pout:util.getUnixTime()+' '+'Gave '+amount+'bits to '+user.name}
		log.transActions.push(transaction)
		console.log(transaction.pout)
		io.emit('bitsGiven', user, amount, bet)
	},
	findUser: function (username) {
		var tempUser = null;
		db.users.forEach(function (user) {
			if(user.name == username){
				tempUser = user
			}
		})
		return tempUser
	},
	exitsUser: function (username) {
		exits = false;
		db.users.forEach(function (user) {
			if(user.name == username){
				exits = true
			}
		})
		return exits
	},
	removeBits: function (amount, name) {
		var user = banker.findUser(name)
		user.bits -= amount
		db.bankBits += amount
		var transaction = {time:util.getUnixTime(), reciver:user, amount:amount, pout:util.getUnixTime()+' '+'Removed '+amount+'bits from '+user.name}
		log.transActions.push(transaction)
		console.log(transaction.pout)
		io.emit('bitsRemoved', user, amount)
	},
	resetPool: function () {
		db.headP = 0
		db.tailsP = 0
		db.pool = []
		var poolEvent = {time:util.getUnixTime(), pout:util.getUnixTime()+' '+'Pool got reset'}
		log.events.push(poolEvent)
		io.emit('poolReset')
	},
	repayMoney: function (winside) {
		db.pool.forEach(function (bet) {
			if(bet.side == winside){
				var repay = bet.amount * 2
				var repayEvent = {time:util.getUnixTime(), side:winside, amount:repay, user:bet.name, pout:util.getUnixTime()+' '+'Repayed '+repay+'bits to '+bet.name+' on '+winside+' side'}
				log.transActions.push(repayEvent)
				console.log(repayEvent.pou);
				banker.giveBits(repay, bet.name, true)
			}
		})
	}
}

io.on('connection', function(socket){
	io.emit('newData', db.headP, db.tailsP)

	socket.on('newUser', function (data) {
		if(banker.exitsUser(data.name)){
			var existingUser = banker.findUser(data.name)
			var existingUserLogon = {time:util.getUnixTime(), name:data.name, pout:util.getUnixTime()+' '+data.name+' has loged in'}
			log.events.push(existingUserLogon)
			console.log(existingUserLogon.pout)
			io.emit('existingUserData', existingUser)
			db.usersOnline += 1
			io.emit('onlineStat', db.usersOnline)
		}else if (!banker.exitsUser(data.name)) {
			db.users.push(data)
			var newuser = {time:util.getUnixTime(), name:data.name, pout:util.getUnixTime()+' '+data.name+' has connected'}
			log.events.push(newuser)
			console.log(newuser.pout)
			banker.giveBits(300, data.name, false)
			db.usersOnline += 1
			io.emit('onlineStat', db.usersOnline)
		}
	})
	socket.on('placeBet', function (data) {
		banker.removeBits(data.amount, data.user.name)
		if (data.side == 1) {
			db.headP += data.amount
		}else if (data.side == 2) {
			db.tailsP += data.amount
		}
		var newbet = {time:util.getUnixTime(), name:data.user.name, amount:data.amount, side:data.side, pout:util.getUnixTime()+' '+data.user.name+' placed a bet worth '+data.amount+'bits on the side '+data.side}
		log.betsPlaced.push(newbet)
		console.log(newbet.pout);
		io.emit('newBet', data.amount, db.headP, db.tailsP, data.user.name, data.side)
		db.pool.push({time:util.getUnixTime(), side:data.side, amount:data.amount, name:data.user.name})
	})
	socket.on('disconnect', function () {
		if(db.usersOnline > 0){
			db.usersOnline -= 1
		}else {
			db.usersOnline = 0
		}
		io.emit('onlineStat', db.usersOnline)
	})
	io.emit('countDown', counter)
})

setInterval(function () {
	if(counter > 0){
		counter--
		io.emit('countDown', counter)
	}else if (counter == 0) {
		if (spinning == false) {
			spin = Math.floor(Math.random() * 2) + 1
			console.log(spin);
			io.emit('spin', spin)
			spinning = true
			setTimeout(function () {
				counter = 26
				var spinres = {time:util.getUnixTime(), side:spin}
				log.spinRes.push(spinres)
				banker.repayMoney(spin)
				banker.resetPool()
				spinning = false
			}, 4000)
		}
	}
},1000)

setInterval(function () {
	util.saveLogs()
}, 60000)

app.get("/", function(req, res) {
	res.sendFile(__dirname + '/www/index.html')
})

app.get('/admin', function (req, res) {
	res.sendFile(__dirname + '/www/hax0r.html')
})

app.get(/^(.+)$/, function(req, res){
    //console.log('static file request : ' + req.params[0]);
    res.sendfile( __dirname + req.params[0])
})

http.listen(port, function(){
  console.log('listening on *:'+port)
})
