var socket = io()

var gatekeeper = {
  secretCombo: 'l + e',
  authenticating: false,
  getSecretEntrance: function () {
    swal({
      title: "The secret key, I need",
      text: "",
      type: "input",
      imageUrl: "https://monomythic.files.wordpress.com/2015/12/yoda-main-clean.jpg",
      showCancelButton: true,
      closeOnConfirm: true,
      animation: "slide-from-top",
      inputPlaceholder: "Yoda"
    },
    function(inputValue){
      if (inputValue === false) return false;

      if (inputValue === "") {
        swal.showInputError("You need to write something!");
        return false
      }

        gatekeeper.auth(inputValue)

    })
  },
  gotToken: function (token) {
    console.log('aodsasda');
    swal({
      title: 'Accepted you are \n Your token is:\n'+ token,
      text: '',
      imageUrl: 'https://monomythic.files.wordpress.com/2015/12/yoda-main-clean.jpg'
    },function () {
      window.location.replace("http://localhost:3000/stats")
    })

    setTimeout(function () {
      window.location.replace("http://localhost:3000/stats")
    }, 10000)
  },
  auth: function (key) {
    console.log(key);
    socket.emit('adminAuth', key)
  }
}

window.onload = function () {
  keyboardJS.bind(gatekeeper.secretCombo, function(e) {
    if(!gatekeeper.authenticating){
        gatekeeper.authenticating = true
        gatekeeper.getSecretEntrance()
    }
  })

  socket.on('adminToken', function (token) {
    gatekeeper.gotToken(token)
    console.log(token);
  })
}
