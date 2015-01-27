angular.module('ideas.controllers.ideas', [])

.controller('IdeasCtrl', ['$scope', 'IO', function($scope, IO) {
  var ref = IO.childRef("ideas");
  IO.syncArray(ref, $scope, "ideas"); //Binds the array at ref to $scope.ideas
}])
