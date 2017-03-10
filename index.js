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

var banker = {
	giveBits: function (amount, name) {
		db.users.forEach(function (user) {
			if (user.name == name){
				user.bits += amount
				db.bankBits -= amount
				console.log('Gave '+amount+'bits to '+user.name)
				io.emit('bitsGiven', user, amount)
				console.log(db.bankBits)
				console.log(user.bits)
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
				console.log('Removed '+amount+'bits to '+user.name)
				io.emit('bitsRemoved', user, amount)
				console.log(db.bankBits)
				console.log(user.bits)
			}
		})
	},
	resetPool: function () {
		db.headP = 0
		db.tailsP = 0
		db.pool = []
		io.emit('poolReset')
	}
}

var repayer = {
	repayMoney: function (winside) {
		db.pool.forEach(function (bet) {
			if(bet.side == winside){
				var repay = bet.amount * 2
				console.log('Repayed '+repay+' to '+bet.name);
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
  console.log('a user connected');
	io.emit('newData', db.headP, db.tailsP)

	socket.on('newUser', function (data) {
		db.users.push(data)
		console.log(data.name)
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
		io.emit('newBet', data.amount, db.headP, db.tailsP, data.user.name, data.side)
		console.log('added new bet to pool');
		console.log(data.side +' '+ data.user.name);
		db.pool.push({side:data.side, amount:data.amount, name:data.user.name})
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
