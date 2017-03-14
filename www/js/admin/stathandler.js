var socket = io()

var statHandler = {
  getToken: function () {
    swal({
      title: "The token i gave you, I need",
      text: "",
      type: "input",
      imageUrl: "https://monomythic.files.wordpress.com/2015/12/yoda-main-clean.jpg",
      showCancelButton: false,
      closeOnConfirm: false,
      animation: "slide-from-top",
      inputPlaceholder: "Yoda"
    },
    function(inputValue){
      if (inputValue === false) return false;

      if (inputValue === "") {
        swal.showInputError("You need to write something!");
        return false
      }

        var myToken = statHandler.validateToken(inputValue)
        socket.on('validToken', function (token) {
          if(token == myToken){
            swal.close()
          }else {
            window.location.replace("http://localhost:3000/")
          }
        })
    })
  },
  validateToken: function (token) {
    var tokenChecked = token
    socket.emit('checkToken', token)
    return tokenChecked
  }
}

window.onload = function () {
  statHandler.getToken()
}
