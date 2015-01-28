angular.module("ideas.services", ['firebase'])

.factory('IO', ['$firebase', '$timeout', '$q', function($firebase, $timeout, $q) {
  var ref = new Firebase("https://idea0.firebaseio.com/");
  var authCB = [];
  ref.onAuth(function(authData) {
    for (param in authCB) {
      authCB[param](authData);
    }
  });
  var objs = {};
  var params = { //Set params to default
    screenName: null
  };
  //The callback for setting user parameters
  var userParams = function(authData) {
    if (authData !== null) {
      var userID = authData.uid;
      ref.child("users").child(userID).on("value", function(snapshot) { //Method for settings all user parameters
        var theObj = snapshot.val();
        if (theObj !== null) {
          if (theObj.screenName !== null) { //Here we check for the screen name
            params.screenName = theObj.screenName;
          } else {
            params.screenName = null; //set to default
          }
          //TODO: obtain parameters
        } else {
          params = { //Change params to defaults
            screenName: null
          };
        }
      });
    } else {
      params = { //back to default
        screenName: null
      };
    }
  };
  var service = {
    //It allows you to obtain values of and set values of parameters
    queryParam: function(param) {
      return params[param];
    },

    changeParam: function(param, value) {
      params[param] = value;
    },

    //Utility method for converting a string to a child reference of the firebase
    childRef: function(loc) {
      var childs = loc.split(".");
      var curRef = ref;
      for (var i = 0; i < childs.length; i++) {
        curRef = curRef.child(childs[i]);
      }
      return curRef;
    },
    //Obtains a reference to the firebase
    getRef: function() { //TODO: If an object is synced multiple times rather than creating a new synced object I could return the same one (does angularfire already do this?)
      return ref;
    },

    //User manipulation methods
    logout: function() {
      ref.unauth();
    },

    login: function(email, password) {
      var user = {
        email: email,
        password: password
      };
      var promise = $q.defer(); //Promises. Woot! We have to return a promise because we don't know when the firebase will finish authenticating the user.
      ref.authWithPassword(user, function(error, authData) { //Login to the firebase
        if (error) { //They couldn't login
          promise.reject(error);
        } else { //They logged in sucessfully
          promise.resolve(authData);
        }
      });
      return promise.promise;
    },

    //Signs a user into the firebase. Returns a promise that tells when it completes and if it was sucessful or not
    signup: function(email, password) {
      var user = {
        email: email,
        password: password
      };
      var promise = $q.defer(); //Create a promise that will be returned to the user when we know if the firebase created the user
      ref.createUser(user, function(error) { //Create the user
        if (error === null) { //The user was successfully created
          promise.resolve(); //Resolve the promise
        } else { //They did not sucessfully signup
          promise.reject(error); //Reject the promise with an error
        }
      });
      return promise.promise;
    },

    //Methods for syncing data
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
              var obj = snapshot.val();
              obj.$id = snapshot.key();
              $scope[locBind][snapshot.key()] = obj;
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

    //Cleanup methods
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

    //TODO: this stuff is actually redundant. I can use the angularfire $firebaseAuth to put a reference to the authentication in the root scope

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
  service.listenAuthChanges(userParams); //Listen for changes such that user params can be updated
  return service;
}])
