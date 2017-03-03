var flipper = {
  //animation900 tails or animation1080 heads
  spin: function (side) {
    var animation = ''
    console.log(side);
    if (side == 1) {
      animation = 'animation1080'
    }else if (side == 2) {
      animation = 'animation900'
    }
    console.log(animation);
    $('#coin').removeClass();

    setTimeout(function(){
      $('#coin').addClass(animation);
    }, 100);
  }
}
