var app = require("express")()
var http = require("http").Server(app)
var io = require('socket.io')(http)
var counter = 40
var db = {
	users: [],
	bankBits: 300000
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
	socket.on('newUser', function (data) {
		db.users.push(data)
		console.log(data.name)
		banker.giveBits(30, data.name)
	})
	io.emit('countDown', counter)
})

// TODO: Make it only one second and broadcast the remaining time to the users
// DONE
setInterval(function () {
	counter--
	if (counter < 0) {
		var spin = Math.floor(Math.random() * 2) + 1;
		console.log(spin);
		io.emit('spin', spin)
		counter = 40
	}else {
		io.emit('countDown', counter)
		console.log('Time left: '+counter);
	}
},1000)

http.listen(3000, function(){
  console.log('listening on *:3000');
})
