angular.module('starter.services')
.factory('LocalStorage', ['$window', function($window) {
	return {
		set: function(key, value) {
			$window.localStorage[key] = value;
		},
		
		get: function(key, defaultValue) {
			return $window.localStorage[key] || defaultValue;
		},
		
		has: function(key) {
			var value = $window.localStorage[key];
			return value!=undefined;
		},
		
		setObject: function(key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		},
		
		getObject: function(key) {
			return JSON.parse($window.localStorage[key] || '{}');
		},
		
		remove: function(key) {
			return $window.localStorage.removeItem(key);
		},
		
		clear: function(){
			$window.localStorage.clear();
		}
	}
}]);
