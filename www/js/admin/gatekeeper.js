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

      swal("Nice!", "You wrote: " + inputValue, "success");
    })
  },
  auth: function (key) {

  }
}

window.onload = function () {
  var socket = io()

  keyboardJS.bind(gatekeeper.secretCombo, function(e) {
    if(!gatekeeper.authenticating){
        gatekeeper.authenticating = true
        gatekeeper.getSecretEntrance()
    }
  });
}
