angular.module('ideas.controllers.comments', [])

.controller('CommentsCtrl', ['$scope', 'IO', '$stateParams', '$ionicModal', '$ionicPopup', function($scope, IO, $stateParams, $ionicModal, $ionicPopup) {
  var refIdea = IO.childRef('ideas.' + $stateParams.ideaID + ".data");
  IO.syncData(refIdea, $scope, "idea.data", "ideaID");

  $scope.$on("destroy", function() {
    IO.release("ideaID");
  });
}]);
