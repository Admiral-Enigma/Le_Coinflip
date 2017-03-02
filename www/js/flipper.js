jQuery(document).ready(function($){
var flipper = {
  //animation900 tails or animation1080 heads
  spinArray: [],
  getSpin: function () {
    var spin = this.spinArray[Math.floor(Math.random()*this.spinArray.length)];
    return spin;
  },
  spin: function (side) {
    if (side == 0) {
      this.spinArray = ['animation1080']
    }else if (side == 1) {
      this.spinArray = ['animation900']
    }
    $('#coin').removeClass();

    setTimeout(function(){
      $('#coin').addClass(this.getSpin());
    }, 100);
  }
}
})
