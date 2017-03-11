var socket = io()

var user = {
  name: '',
  bits: 0,
  setupUser: function (name) {
   this.name = name
   socket.emit('newUser', this)
  },
  addBalance: function (amount) {
    this.bits += amount
    $('#balance').html('You have: '+this.bits+' bits')
  },
  removeBalance: function (amount) {
    this.bits -= amount
    $('#balance').html('You have: '+this.bits+' bits')
  },
  updateBalance: function () {
    $('#balance').html('You have: '+this.bits+' bits')
  }
}

window.onload = function () {
  var first = true;
  var pHead = 0;
  var pTails = 0;

  ui.getNameInput()

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

  })

  //TODO: add some more checking
  socket.on('bitsGiven', function (data, amount, bet) {
    if(data.name == user.name){
      if(bet === true){
        ui.wonPopup(amount, data.name)
        user.addBalance(amount)
      }else {
        user.addBalance(amount)
      }
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

  socket.on('existingUserData', function (data) {
    if(data.name === user.name){
      user.bits = data.bits
      user.updateBalance()
    }
  })

  socket.on('poolReset', function () {
    pHead = 0
    pTails = 0
    $('#personal-pledgeH').html('0')
    $('#personal-pledgeT').html('0')
    $('#bettedH').html('Total bits pledged: 0')
    $('#bettedT').html('Total bits pledged: 0')
  })
  socket.on('newBet', function (amount, headP, tailsP, username, side) {
    if(username == user.name){
      if(side == 1){
        pHead += amount
        $('#personal-pledgeH').html(''+pHead)
      }else if (side == 2) {
        pTails += amount
        $('#personal-pledgeT').html(''+pTails)
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

  socket.on('onlineStat', function (count) {
    $('#online-counter').html(count + ' users online')
  })

}
