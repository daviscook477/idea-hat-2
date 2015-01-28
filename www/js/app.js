angular.module('ideas', ['ionic', 'ideas.controllers', 'ideas.services', 'ideas.directives'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  //View for browsing the different categories
  .state('app.categories', {
    url: "/categories",
    views: {
      'menuContent': {
        templateUrl: "templates/categories/categories.html"
      }
    }
  })

  .state('app.comments', {
    url: "/comments:ideaID",
    views: {
      "menuContent": {
        templateUrl: "templates/comments/comments.html"
      }
    }
  })

  .state('app.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: "templates/account/account.html"
      }
    }
  })

  .state('app.category', {
    url: "/category:catID",
    views: {
      'menuContent': {
        templateUrl: "templates/category/category.html"
      }
    }
  })

  .state('app.ideas', {
    url: "/ideas",
    views: {
      'menuContent': {
        templateUrl: "templates/ideas.html"
      }
    }
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/categories');
});
