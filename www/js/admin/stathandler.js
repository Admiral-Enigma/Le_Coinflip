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
  },
  sortUserser: function (users) {
    var swapped;
    do {
        swapped = false;
        for (var i=0; i < users.length-1; i++) {
            if (users[i] > users[i+1]) {
                var temp = users[i];
                users[i] = users[i+1];
                users[i+1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
    return users
  }
}

window.onload = function () {
  statHandler.getToken()
}
