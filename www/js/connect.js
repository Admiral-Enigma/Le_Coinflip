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
    console.log('JOE');
  }else {
    name = prompt('Enter Name','Joe')
  }


}
