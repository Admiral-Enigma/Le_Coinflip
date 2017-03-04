window.onload = function () {
  var socket = io()

  // setting up the user
  var name = prompt('Enter Name','Joe')
  var user = {
    name: '',
    bits: 0
  }

  if (name != '') {
    user.name = name
    socket.emit('newUser', user)
  }else {
    name = prompt('Enter Name','Joe')
  }
  socket.on('spin',function (data) {
    flipper.spin(data)
  })

  socket.on('countDown', function (timeleft) {
    $('#timer').html('Time to next spin: '+timeleft+' seconds')
  })
}
