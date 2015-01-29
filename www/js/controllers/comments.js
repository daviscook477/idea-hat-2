angular.module('ideas.controllers.comments', [])

.controller('CommentsCtrl', ['$scope', 'IO', '$stateParams', '$ionicModal', '$ionicPopup', function($scope, IO, $stateParams, $ionicModal, $ionicPopup) {
  var refIdea = IO.childRef('ideas.' + $stateParams.ideaID + ".data");
  IO.syncData(refIdea, $scope, "idea.data", "ideaID");
  var refComments = IO.childRef('ideas.' + $stateParams.ideaID + ".comments");
  var refData = IO.childRef("comments");
  IO.syncPointersToData(refComments, refData, $scope, "comments", "commentSync");
  $ionicModal.fromTemplateUrl('templates/comments/modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.busy = false;
  $scope.input = {
    text: null
  };
  $scope.showComments = function() {
    $scope.modal.show();
  };
  $scope.hideComments = function() {
    $scope.modal.hide();
    $scope.busy = false;
  };
  $scope.doComments = function() {
    $scope.busy = true;
    var object = {
      text: $scope.input.text
    };
    var write = IO.toFObj(object);
    var key = IO.childRef("comments").push(write).key();
    IO.curUserRef().child("comments").child(key).set(true);
    IO.childRef("ideas." + $stateParams.ideaID + ".comments." + key).set(true);
    $ionicPopup.alert({title: "Comment posted!"}).then(function() {
      $scope.busy = false;
      $scope.input = {
        text: null
      };
      $scope.hideComments();
    });
  };
  $scope.$on("destroy", function() {
    IO.release("ideaID");
    IO.releasePointerSync("commentSync");
    $scope.modal.remove();
  });
}]);
