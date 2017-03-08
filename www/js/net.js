window.onload = function () {
  var socket = io()
  var first = true;
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
    addBalance: function (amount) {
      this.bits += amount
      $('#balance').html('You have: '+this.bits+' bits')
    },
    removeBalance: function (amount) {
      this.bits -= amount
      $('#balance').html('You have: '+this.bits+' bits')
    }
  }
  user.setupName()

  $('#betH').click(function () {
    console.log(parseInt($('#bitValue').val()));
    if(parseInt($('#bitValue').val()) <= user.bits && $('#bitValue').val() != ''){
      console.log('e');
      socket.emit('placeBet', {side:1, amount:parseInt($('#bitValue').val()), user:user})
    }
  })

  $('#betT').click(function () {
    if(parseInt($('#bitValue').val()) <= user.bits && $('#bitValue').val() != ''){
      socket.emit('placeBet', {side:2, amount:parseInt($('#bitValue').val()), user:user})
    }
  })

  //NET code
  socket.on('spin', function (data) {
    flipper.spin(data)
    $('#timer').html('Time to next spin: Spinning....')
    $('#personal-pledgeH').html('0')
    $('#personal-pledgeT').html('0')
  })

  //TODO: add some more checking
  socket.on('bitsGiven', function (data, amount) {
    if(data.name == user.name){
      console.log('YAY got some me coin');
      user.addBalance(amount)
    }
  })

  socket.on('bitsRemoved', function (data, amount) {
    if(data.name == user.name){
      user.removeBalance(amount)
    }
  })

  socket.on('newData', function (headP, tailsP) {
    if (first) {
      $('#bettedH').html('Total bits pledged: '+headP)
      $('#bettedT').html('Total bits pledged: '+tailsP)
      first = false
    }
  })
  socket.on('poolReset', function () {
    $('#bettedH').html('Total bits pledged: 0')
    $('#bettedT').html('Total bits pledged: 0')
  })
  socket.on('newBet', function (amount, headP, tailsP, username, side) {
    if(username == user.name){
      if(side == 1){
        $('#personal-pledgeH').html(''+amount)
      }else if (side == 2) {
        $('#personal-pledgeT').html(''+amount)
      }
      $('#bettedH').html('Total bits pledged: '+headP)
      $('#bettedT').html('Total bits pledged: '+tailsP)
    }else {
      if(side == 1){
        $('#bettedH').html('Total bits pledged: '+headP)
      }else if (side == 2) {
        $('#bettedT').html('Total bits pledged: '+tailsP)
      }
    }
  })

  socket.on('countDown', function (timeleft) {
    $('#timer').html('Time to next spin: '+timeleft+' seconds')
  })
}
