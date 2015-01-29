angular.module('ideas.controllers.ideas', [])

.controller('IdeasCtrl', ['$scope', 'IO', '$state', function($scope, IO, $state) {
  var ref = IO.childRef("ideas");
  IO.syncArray(ref, $scope, "ideas", "ideasArray"); //Binds the array at ref to $scope.ideas
  $scope.goIdea = function(idea) {
    $state.go('app.comments', {ideaID: idea.$id});
  };
  $scope.goToCategories = function() {
    $state.go('app.categories');
  };
  $scope.$on('destroy', function() {
    IO.release("ideasArray");
  });
}])
