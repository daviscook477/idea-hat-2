angular.module("ideas.services", ['firebase'])

.factory('IO', ['$firebase', function($firebase) {
  var ref = new Firebase("https://idea0.firebaseio.com/");
  var authCB = [];
  ref.onAuth(function(authData) {
    for (var i = 0; i < authCB.length; i++) {
      authCB[i](authData);
    }
  });
  var service = {
    //Utility method for converting a string to a child reference of the firebase
    childRef: function(loc) {
      var childs = loc.split(".");
      var curRef = ref;
      for (var i = 0; i < childs.length; i++) {
        curRef = curRef.child(childs[i]);
      }
      return curRef;
    },
    getRef: function() {
      return ref;
    },
    //Utility methods for syncing data
    syncData: function(syncRef, $scope, locBind) {
      var sync = $firebase(syncRef);
      var syncObj = sync.$asObject();
      syncObj.$bindTo($scope, locBind);
    },
    syncArray: function(syncRef, $scope, locBind) {
      var sync = $firebase(syncRef);
      $scope[locBind] = sync.$asArray();
    },
    syncPointersToData: function(pointerRef, dataRef, $scope, locBind) {

    },
    toFObj: function(object) {
      var data = object;
      return {
        data: data,
        stamp: Firebase.ServerValue.TIMESTAMP,
        owner: ref.getAuth()
      };
    },

    //These methods here interface with the idea-perm directive and could be used with other things if desired
    //If you change these, you will break the idea-perm directive TODO: add unit test to make sure it still works
    listenAuthChanges: function(cB) {
      authCB.push(cB);
    },
    hasReqPerm: function(level, owner) {
      return true;
    }
  };

  return service;
}])

.factory('Permission', function() {
  return {};
});
