angular.module("ideas.directives", ['ideas.services'])

/*
 * This directive adds a variable perms.hasPerm to the $scope
 * The parameter perm must be assigned
 * This parameter determines what to look for to see if the user has the requirement permission
 * Whenever the user changes the permissions are updated
 * This should be used in conjunction with ng-show="perms.hasPerm" in order to show/hide something based on permission
 */
.directive('ideaPerm', ['IO', function(IO) {
  var link = function($scope, element, attrs) {
    var typePerm;
    var permLevel = null;
    var reqPermLevel = [{name: "category", level: "admin"}, {name: "owner", level: "owner"}];
    var hasReqPerm = false;
    var owner;
    $scope.perms = {
      hasPerm: null
    }
    var cB = function(authData) {
      if (IO.hasReqPerm(permLevel, owner)) {
        $scope.perms.hasPerm = true;
      } else {
        $scope.perms.hasPerm = false;
      }
    };
    attrs.$observe("owner", function(value) {
      owner = value;
      cB();
    });
    attrs.$observe("perm", function(value) {
      typePerm = value;
      for (var i = 0; i < reqPermLevel.length; i++) {
        if (reqPermLevel[i].name === typePerm) {
          permLevel = reqPermLevel[i].level;
        }
      }
      cB();
      IO.listenAuthChanges(cB);
    });
  };
  return {
    link: link
  };
}]);
