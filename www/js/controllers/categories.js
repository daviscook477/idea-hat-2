angular.module('ideas.controllers.categories', ['ionic'])

.controller("CategoriesCtrl", ['$scope', 'IO', '$ionicModal', '$ionicPopup', function($scope, IO, $ionicModal, $ionicPopup) {
  var ref = IO.childRef("categories");
  IO.syncArray(ref, $scope, "categories"); //Binds the array at ref to $Scope.categories
  $ionicModal.fromTemplateUrl('templates/categories/modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.busy = false;
  $scope.input = {
    text: null
  };
  $scope.goCategory = function(category) {

  }
  $scope.showCategories = function() {
    $scope.modal.show();
  };
  $scope.hideCategories = function() {
    $scope.modal.hide();
    $scope.busy = false;
  };
  $scope.doCategories = function() {
    $scope.busy = true;
    var object = {
      name: $scope.input.text
    };
    var write = IO.toFObj(object);
    $scope.categories.$add(write);
    $ionicPopup.alert({title: "Category created!"}).then(function() {
      $scope.busy = false;
      $scope.hideCategories();
    });
  };
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
}])
