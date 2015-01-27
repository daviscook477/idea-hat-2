angular.module('ideas.controllers.categories', ['ionic'])

.controller("CategoriesCtrl", ['$scope', 'IO', '$ionicModal', '$ionicPopup', '$state', function($scope, IO, $ionicModal, $ionicPopup, $state) {
  var ref = IO.childRef("categories");
  IO.syncArray(ref, $scope, "categories", "catArray"); //Binds the array at ref to $Scope.categories
  $ionicModal.fromTemplateUrl('templates/categories/modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.busy = false;
  $scope.input = {
    name: null
  };
  $scope.goCategory = function(category) {
    $state.go('app.category', {catID: category.$id});
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
      name: $scope.input.name
    };
    var write = IO.toFObj(object);
    $scope.categories.$add(write);
    $ionicPopup.alert({title: "Category created!"}).then(function() {
      $scope.busy = false;
      $scope.input = {
        name: null
      }
      $scope.hideCategories();
    });
  };
  $scope.$on('$destroy', function() {
    IO.release("catArray");
    $scope.modal.remove();
  });
}]);
