var app = require("express")()
var http = require("http").Server(app)
var io = require('socket.io')(http)
var db = {
	users: [],
	bankMoney: 300000
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
	})
})

setInterval(function () {
	var spin = Math.floor(Math.random() * 2) + 1;
	console.log(spin);
	io.emit('spin', spin)
},20000)

http.listen(3000, function(){
  console.log('listening on *:3000');
})
