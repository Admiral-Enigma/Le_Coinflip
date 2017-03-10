var app = require("express")()
var http = require("http").Server(app)
var io = require('socket.io')(http)
var port = Number(process.env.PORT || 3000)
var counter = 60
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
	getUnixTime:function () {
		return Math.round(new Date() / 1000);
	}
}
var banker = {
	giveBits: function (amount, name) {
		db.users.forEach(function (user) {
			if (user.name == name){
				user.bits += amount
				db.bankBits -= amount
				var transaction = {time:util.getUnixTime(), reciver:user, amount:amount, pout:util.getUnixTime()+' '+'Gave '+amount+'bits to '+user.name}
				log.transActions.push(transaction)
				console.log(transaction.pout)
				io.emit('bitsGiven', user, amount)
			}
		})
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
	removeBits: function (amount, name) {
		db.users.forEach(function (user) {
			if (user.name == name){
				user.bits -= amount
				//db.bankBits -= amount
				var transaction = {time:util.getUnixTime(), reciver:user, amount:amount, pout:util.getUnixTime()+' '+'Removed '+amount+'bits from '+user.name}
				log.transActions.push(transaction)
				console.log(transaction.pout)
				io.emit('bitsRemoved', user, amount)
			}
		})
	},
	resetPool: function () {
		db.headP = 0
		db.tailsP = 0
		db.pool = []
		var poolEvent = {time:util.getUnixTime(), pout:util.getUnixTime()+' '+'Pool got reset'}
		log.events.push(poolEvent)
		io.emit('poolReset')
	}
}

var repayer = {
	repayMoney: function (winside) {
		db.pool.forEach(function (bet) {
			if(bet.side == winside){
				var repay = bet.amount * 2
				var repayEvent = {time:util.getUnixTime(), side:winside, amount:repay, user:bet.name, pout:util.getUnixTime()+' '+'Repayed '+repay+'bits to '+bet.name+' on '+winside+' side'}
				log.transActions.push(repayEvent)
				console.log(repayEvent.pou);
				banker.giveBits(repay, bet.name)
			}
		})
	}
}

app.get("/", function(req, res) {
	res.sendFile(__dirname + '/www/index.html')
})

app.get(/^(.+)$/, function(req, res){
    console.log('static file request : ' + req.params);
    res.sendfile( __dirname + req.params[0])
})

io.on('connection', function(socket){
	io.emit('newData', db.headP, db.tailsP)

	socket.on('newUser', function (data) {
		db.users.push(data)
		var newuser = {time:util.getUnixTime(), name:data.name, pout:util.getUnixTime()+' '+data.name+' has connected'}
		log.events.push(newuser)
		console.log(newuser.pout)
		banker.giveBits(300, data.name)
		db.usersOnline += 1
		io.emit('onlineStat', db.usersOnline)
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
		db.usersOnline -= 1
		io.emit('onlineStat', db.usersOnline)
	})
	io.emit('countDown', counter)
})

// TODO: Make it only one second and broadcast the remaining time to the users
// DONE
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
				counter = 60
				var spinres = {time:util.getUnixTime(), side:spin}
				log.spinRes.push(spinres)
				repayer.repayMoney(spin)
				banker.resetPool()
				spinning = false
			}, 4000)
		}
	}
},1000)

http.listen(port, function(){
  console.log('listening on *:'+port)
})
