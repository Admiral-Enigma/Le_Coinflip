window.onload = function () {
  var socket = io()

  // setting up the user
  var user = {
    name: '',
    bits: 0,
    setupName: function () {
      var inputname = prompt('Enter Name','Joe')
      if (inputname != ''){
        this.name = inputname
        socket.emit('newUser', this)
      }else {
       this.setupName()
      }
    },
    updateBalance: function (amount) {
      this.bits += amount
      $('#balance').html('You have: '+this.bits+' bits')
    }
  }
  user.setupName()

  $('#betH').click(function () {
    if(parseInt($('#bitValue').val()) >= user.bits && $('#bitValue').val() != ''){
      socket.emit('placeBet', {side:1, amount:parseInt($('#bitValue').val()), user:user})
    }
  })

  $('#betT').click(function () {
    if(parseInt($('#bitValue').val()) >= user.bits && $('#bitValue').val() != ''){
      socket.emit('placeBet', {side:2, amount:parseInt($('#bitValue').val()), user:user})
    }
  })

  //NET code
  socket.on('spin',function (data) {
    flipper.spin(data)
    $('#timer').html('Time to next spin: Spinning....')
  })

  //TODO: add some more checking
  socket.on('bitsGiven', function (data, amount) {
    if(data.name == user.name){
      console.log('YAY got some me coin');
      user.updateBalance(amount)
    }
  })

  socket.on('countDown', function (timeleft) {
    $('#timer').html('Time to next spin: '+timeleft+' seconds')
  })
}
