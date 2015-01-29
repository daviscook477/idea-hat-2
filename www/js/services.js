angular.module("ideas.services", ['firebase'])

.factory('IO', ['$firebase', '$timeout', '$q', function($firebase, $timeout, $q) {
  var ref = new Firebase("https://idea0.firebaseio.com/");
  var authCB = [];
  ref.onAuth(function(authData) {
    for (param in authCB) {
      authCB[param](authData);
    }
  });
  var objs = {}; //The different things registered in the service
  var userParams = {};
  ref.onAuth(function(authData) { //this mess of code might work -- TODO:test this clusterfuck of code
    //Register the callback for storing the user params
    if (userParams !== null) {
      //userParams.$destroy();
    }
    if (authData !== null) {
      var paramCB = function(snapshot) {
        userParams = snapshot.val();
      };
      ref.child("users").off("value", paramCB);
      ref.child("users").child(authData.uid).on("value", paramCB); //Set up a callback for the params
    } else {
      userParams = null;
    }
  });
  var service = {

    //TODO: add a sync object for checking the current user and seeing if they are things like admin such that permissions can be checked

    curUserRef: function() {
      var curAuth = ref.getAuth();
      console.log(curAuth.uid);
      if (curAuth !== null) {
        return ref.child("users").child(curAuth.uid);
      }
      return null;
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

    getAuthUID: function() {
      var curAuth = ref.getAuth();
      if (curAuth === null) {
        return null;
      }
      return curAuth.uid;
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
      console.log("logging in " + email + " " + password);
      var promise = $q.defer(); //Promises. Woot! We have to return a promise because we don't know when the firebase will finish authenticating the user.
      ref.authWithPassword(user, function(error, authData) { //Login to the firebase
        if (error) { //They couldn't login
          console.log("error at fbase");
          promise.reject(error);
        } else { //They logged in sucessfully
          console.log("succ at fbase");
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
    //Returns -1 if the thing doesn't exist
    release: function(name) {
      console.log("called to realse " + name)
      if (objs[name] == null) { //User == so undefined = null
        return -1;
      }
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
    hasReqPerm: function(perm, owner) { //And test this mess too
      if (perm === "owner") {
        if (owner === service.getAuthUID()) {
          return true;
        }
      }
      if (perm === "admin") {
        if (userParams !== null) {
          if (userParams.admin === true) {
            return true;
          }
        }
        //HM: I should set user properties in the service rather than in account XD
      }
      return false;
      //TODO: here what we want to do is sync an object for listening to changes in user auth
      //Then we can check against that stuff
      console.log("checking if " + owner + " has " + level + " permissions");
    }
  };
  return service;
}])
