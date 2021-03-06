angular.module('ideas.controllers.category', [])

.controller('CategoryCtrl', ['$scope', 'IO', '$stateParams', '$ionicModal', '$ionicPopup', '$state', function($scope, IO, $stateParams, $ionicModal, $ionicPopup, $state) {
  var refIdeas = IO.childRef('categories.' + $stateParams.catID + ".ideas");
  var refData = IO.childRef("ideas");
  var refCat = IO.childRef('categories.' + $stateParams.catID + ".data.name");
  IO.syncData(refCat, $scope, "category.data.name", "catID")
  IO.syncPointersToData(refIdeas, refData, $scope, "ideas", "ideaSync");
  $ionicModal.fromTemplateUrl('templates/category/modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.busy = false;
  $scope.input = {
    name: null,
    description: null
  };
  $scope.goIdea = function(idea) {
    $state.go('app.comments', {ideaID: idea.$id});
  }
  $scope.showIdeas = function() {
    $scope.modal.show();
  };
  $scope.hideIdeas = function() {
    $scope.modal.hide();
    $scope.busy = false;
  };
  $scope.doIdeas = function() {
    $scope.busy = true;
    var object = {
      name: $scope.input.name,
      description: $scope.input.description
    };
    var write = IO.toFObj(object);
    var key = IO.childRef("ideas").push(write).key();
    IO.curUserRef().child("ideas").child(key).set(true);
    IO.childRef("categories." + $stateParams.catID + ".ideas." + key).set(true);
    $ionicPopup.alert({title: "Idea posted!"}).then(function() {
      $scope.busy = false;
      $scope.input = {
        name: null,
        description: null
      };
      $scope.hideIdeas();
    });
  };
  $scope.$on('destroy', function() {
    IO.releasePointerSync("ideaSync");
    IO.release("catID");
    $scope.modal.remove();
  });
}]);
