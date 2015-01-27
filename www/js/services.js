angular.module("ideas.services", ['firebase'])

.factory('IO', ['$firebase', '$timeout', function($firebase, $timeout) {
  var ref = new Firebase("https://idea0.firebaseio.com/");
  var authCB = [];
  ref.onAuth(function(authData) {
    for (param in authCB) {
      authCB[param](authData);
    }
  });
  var objs = {};
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
    getRef: function() { //TODO: If an object is synced multiple times rather than creating a new synced object I could return the same one (does angularfire already do this?)
      return ref;
    },
    //Utility methods for syncing data
    syncData: function(syncRef, $scope, locBind, name) {
      var sync = $firebase(syncRef);
      var syncObj = sync.$asObject();
      syncObj.$bindTo($scope, locBind);
      objs[name] = syncObj;
      console.log("binding the data at: " + syncRef.key() + " to $scope." + locBind + " registered at " + name);
    },
    syncArray: function(syncRef, $scope, locBind, name) {
      console.log("binding the array at: " + syncRef.key() + " to $scope." + locBind + " registered at " + name);
      var sync = $firebase(syncRef);
      var syncArray = sync.$asArray();
      $scope[locBind] = syncArray;
      objs[name] = syncArray;
    },
    syncPointersToData: function(pointerRef, dataRef, $scope, locBind, name) {
      console.log("creating a pointer from " + pointerRef.key() + " to " + dataRef.key() + " where the data is bound to $scope." + locBind + " registered at " + name);
      var datas = {};
      pointerRef.on("value", function(snapshot) {
        datas = snapshot.val();
        $scope[locBind] = {};
        for (param in datas) {
          dataRef.child(param).on("value", function(snapshot) {
            $timeout(function() {
              $scope[locBind][snapshot.key()] = snapshot.val();
            });
          });
        }
      });
      objs[name] = {pointerRef: pointerRef, dataRef: dataRef};
    },
    //Converts an object into firebase form by adding an owner and a timestamp
    toFObj: function(object) {
      var data = object;
      var auth = ref.getAuth();
      var owner;
      if (auth !== null) {
        owner = auth.uid;
      } else {
        owner = null;
      }
      return {
        data: data,
        stamp: Firebase.ServerValue.TIMESTAMP,
        owner: owner
      };
    },
    //This must be called to clean up a synced pointer
    releasePointerSync: function(name) {
      objs[name].pointerRef.off();
      objs[name].dataRef.off();
      objs[name] = null;
      console.log("releasing " + name)
    },
    //This must be called on anything that is synced in order to not waste resources
    release: function(name) {
      objs[name].$destroy();
      objs[name] = null;
      console.log("releasing: " + name)
    },

    //These methods here interface with the idea-perm directive and could be used with other things if desired
    //If you change these, you will break the idea-perm directive TODO: add unit test to make sure it still works
    listenAuthChanges: function(cB) {
      var key = Date.now();
      authCB[key] = cB;
      console.log("registering auth listener");
      return key;
    },
    releaseAuth: function(cBID) {
      authCB[cBID] = null;
    },
    hasReqPerm: function(level, owner) {
      return true;
      console.log("checking if " + owner + " has " + level + " permissions");
    }
  };

  return service;
}])
