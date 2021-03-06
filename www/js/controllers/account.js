angular.module('ideas.controllers.account', [])

.controller('AccountCtrl', ['$scope', 'IO', '$ionicModal', '$ionicPopup', function($scope, IO, $ionicModal, $ionicPopup) {
  var refAccount = IO.childRef('users'); //Just a base reference to the firebase
  $scope.login = { //This here takes care of determining if the user is logged in
    isLogin: false,
    auth: null
  };

  //This here is all of the users parameters like screen name
  $scope.userParams = null;
  var cB = function(authData) { //Here we listen for changes in user auth
    IO.release('paramBind'); //Release the previous param listener (now we could have a different usser)
    if (authData != null) { //When a user auths we change a parameter that determines if there is a logged in user and we register a callback for changes in that users parameters
      $scope.login.isLogin = true;
      $scope.login.auth = authData;
      console.log(authData.uid);
      IO.syncData(refAccount.child(authData.uid), $scope, 'userParams', 'paramBind'); //This binds $scope.userParams to the parameters of the user
    } else {
      $scope.login.isLogin = false;
      $scope.login.auth = null;
      userParams = null;
    }
  };
  var authID = IO.listenAuthChanges(cB); //Register the auth listener
  cB(IO.getRef().getAuth()); //Call the callback in order to obtain the current auth
  $scope.modal = {
    login: null,
    signup: null,
  };
  $ionicModal.fromTemplateUrl('templates/account/login-modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function(modal) {
    $scope.modal.login = modal;
  });
  $ionicModal.fromTemplateUrl('templates/account/signup-modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function(modal) {
    $scope.modal.signup = modal;
  });
  $scope.busy = {
    login: false,
    signup: false,
  };
  $scope.input = {
    login: {
      email: null,
      password: null
    },
    signup: {
      email: null,
      password: null
    },
    screenName: null
  };
  $scope.showLogin = function() {
    $scope.modal.login.show();
  };
  $scope.hideLogin = function() {
    $scope.modal.login.hide();
    $scope.busy.login = false;
  };
  var loginSucCB = function(authData) {
    console.log("login good");
    $ionicPopup.alert({
      title: 'Login succeeded!'
    }).then(function() {
      $scope.busy.login = false;
      $scope.modal.login.hide();
      $scope.input.login = {
        email: null,
        password: null
      };
    });
  };
  var loginFailCB = function(error) {
    console.log("login bad");
    $ionicPopup.alert({
      title: 'Login failed!'
    }).then(function() {
      $scope.busy.login = false;
      $scope.modal.login.hide();
    });
  };
  $scope.doLogin = function() {
    $scope.busy.login = true;
    console.log("doing login, email is " + $scope.input.login.email + " password is " + $scope.input.login.password);
    IO.login($scope.input.login.email, $scope.input.login.password).then(loginSucCB, loginFailCB);
  };
  $scope.showSignup = function() {
    $scope.modal.signup.show();
  };
  $scope.hideSignup = function() {
    $scope.modal.signup.hide();
    $scope.busy.signup = false;
  };
  var signupSucCB = function() {
    $ionicPopup.alert({
      title: 'Sign up succeeded!'
    }).then(function() {
      $scope.busy.signup = false;
      $scope.modal.signup.hide();
      $ionicPopup.confirm({
        title: 'Would you like to login?'
      }).then(function(resolution) {
        if (resolution) {
          IO.login($scope.input.signup.email, $scope.input.signup.password).then(loginSucCB, loginFailCB);
        }
        $scope.input.signup = {
          email: null,
          password: null
        };
      });
    });
  };
  var signupFailCB = function() {
    $ionicPopup.alert({
      title: 'Sign up failed!'
    }).then(function() {
      $scope.busy.signup = false;
      $scope.modal.signup.hide();
    });
  };
  $scope.doSignup = function() {
    $scope.busy.signup = false;
    IO.signup($scope.input.signup.email, $scope.input.signup.password).then(signupSucCB, signupFailCB);
  };
  $scope.showLogout = function() {
    $ionicPopup.confirm({
      title: 'Are you sure you want to logout?'
    }).then(function(resolution) {
      if (resolution) { //If they confirmed
        IO.logout();
      } else {
        //Do nothing because they don't want to logout
      }
    })
  };
  //Methods for editing properties
  $scope.popupScreenName = function() { //This popup edits the screen name for the user
    var myPopup = $ionicPopup.show({
    template: '<label class="input"><input type="text" ng-model="input.screenName" placeholder="{{userParams.screenName}}"></label>',
    title: 'Screen Name',
    scope: $scope,
    buttons: [
      {
        text: 'Cancel',
        type: 'button-stable'
      },
      {
        text: 'Submit',
        type: 'button-royal',
        onTap: function(e) {
          //TODO: push the screen name to the firebase
          $scope.userParams.screenName = $scope.input.screenName;
        }
      }
    ]
  });
  };

  //TODO: add new properties of the user to change or whatever

  $scope.$on('destroy', function() {
    IO.releaseAuth(authID);
    $scope.modal.signup.remove();
    $scope.modal.login.remove();
  });
}])
