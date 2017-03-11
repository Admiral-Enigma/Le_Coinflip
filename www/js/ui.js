var ui = {
  getNameInput: function () {
    var name = ''
    swal({
      title: 'Welcome to Le Coinflip!',
      text: 'Input a name to begin betting!',
      type: 'input',
      showCancelButton: false,
      closeOnConfirm: false,
      animation: "slide-from-top",
      inputPlaceholder: "Joe"
    }, function (inputValue) {
      if (inputValue === false) return false;

      if (inputValue === "") {
        swal.showInputError("You need to write something!");
        return false
      }

      name = inputValue
      user.setupUser(name)
      swal('Welcome '+name+'!', 'You can now start betting!')
    })
  },
  wonPopup: function (amount, username) {
    swal('･｡ﾟ[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]｡ﾟ.*', 'Congrats '+username+' you\'ve won '+amount+'bits!')
  }
}
