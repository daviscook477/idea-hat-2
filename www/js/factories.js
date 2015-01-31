angular.module('ideas.factories', ['firebase'])

.factory('Category', ['$FirebaseObject', '$firebase', function($FirebaseObject, $firebase) {
  var CategoryFactory = $FirebaseObject.$extendFactory({
    something: function() { //I don't know where to put this function
      var ideas = this.ideas;
      for (param in ideas) {
        var ideaRef = new Firebase("https://idea0.firebaseio.com").child("ideas").child(param);
        ideaRef.on("value", function(snapshot) {
          var ideaData = snapshot.val();
          this.ideas[param] = ideaData;
        });
      }
    }
  });

  return function(categoryIdea) {
    var ref = new Firebase("https://idea0.firebaseio.com").child("categories").child(categoryIdea);
    var sync = $firebase(ref, { objectFactory: CategoryFactory });
    return sync.$asObject;
  }
}]);
