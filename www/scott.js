var app = angular.module('angularFactoryApp', ['firebase'])
app.controller('MainCtrl', function(Idea, $scope){
  console.log('MainCtrl');
/*  mainRef.child('categories').on('value', function(ideasSnap){
    console.log('Ideas loaded:', ideasSnap.val());
    $scope.ideas = ideasSnap.val();
    $scope.$apply();
  });*/
  $scope.idea = Idea('-JgwJo8ygTcV20ckLsQ7');
  $scope.idea.$loaded(function(ideaSnap){
      console.log('idea:', ideaSnap);
      ideaSnap.author().then(function(author){console.log(author);$scope.idea.author = author});
  })
});
var mainRef = new Firebase("https://idea0.firebaseio.com/");
app.factory("Idea", ["$FirebaseObject", "$firebase","$q", "User", function($FirebaseObject, $firebase, $q, User) {
  // create a new factory based on $FirebaseObject
  var IdeaFactory = $FirebaseObject.$extendFactory({
    $$added:function(snapshot){
      var self = snapshot.val();
      self.author = User(self.owner);
      console.log('self:', self);
      return self;
    },
    author:function(){
      return User(this.owner).$loaded();
    }
  });

  return function(id) {
    var ref = mainRef.child('ideas').child(id);

    // override the factory used by $firebase
    var sync = $firebase(ref, { objectFactory: IdeaFactory });

    return sync.$asObject(); // this will be an instance of CategoryFactory
  }
}]);
app.factory("User", ["$FirebaseObject", "$firebase", function($FirebaseObject, $firebase) {
  // create a new factory based on $FirebaseObject
  var UserFactory = $FirebaseObject.$extendFactory({
    // these methods exist on the prototype, so we can access the data using `this`
    getUsername: function() {
      return this.screenName;
    }
  });
  return function(userId) {
    var ref = mainRef.child('users').child(userId);
    // override the factory used by $firebase
    var sync = $firebase(ref, { objectFactory: UserFactory });
    return sync.$asObject(); // this will be an instance of UserFactory
  }
}]);
