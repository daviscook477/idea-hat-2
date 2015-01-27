angular.module('ideas.controllers.ideas', [])

.controller('IdeasCtrl', ['$scope', 'IO', function($scope, IO) {
  var ref = IO.childRef("ideas");
  IO.syncArray(ref, $scope, "ideas", "ideasArray"); //Binds the array at ref to $scope.ideas
  $scope.$on('destroy', function() {
    IO.release("ideasArray");
  });
}])
