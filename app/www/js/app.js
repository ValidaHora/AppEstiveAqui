// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova']);
angular.module('starter.controllers', []);
angular.module('starter.services', [])
.run(function($ionicPlatform, $rootScope, $ionicPopup, $cordovaDevice) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);

		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
		
		var platform = 'web';//$cordovaDevice.getPlatform().toLowerCase();
		$rootScope.isDroid = platform=='android';
		$rootScope.isApple = platform=='ios';
		$rootScope.isWeb = !$rootScope.isDroid && !$rootScope.isApple;
		
		$rootScope.simpleAlert = function(title, message){
			var popup = $ionicPopup.alert({
			    title: '<i class="icon ion-ios-information-outline"></i> '+title,
			    template: message,
		  	});
		  	
		  	return popup;
		};		
	});
})

.config(function($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider

	// setup an abstract state for the tabs directive
	.state('index', {
		url: '/index',
		templateUrl: 'templates/index.html',
		controller: 'IndexCtrl',
	})
	
	.state('checkin', {
		url: '/checkin',
		templateUrl: 'templates/checkin.html',
		controller: 'CheckInCtrl',
	})
	
	.state('howwork', {
		url: '/howwork',
		templateUrl: 'templates/howwork.html',
		controller: 'HowWorkCtrl',
	})
	
	.state('about', {
		url: '/about',
		templateUrl: 'templates/about.html',
		controller: 'AboutCtrl',
	})
	
	;

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/checkin');
});
