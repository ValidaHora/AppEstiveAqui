angular.module('starter.services')
.factory('NetworkState', function($rootScope, $cordovaNetwork) {
	var CELL = "cellular";
	var CELL_2G = "2g";
	var CELL_3G = "3g";
	var CELL_4G = "4g";
	var ETHERNET = "ethernet";
	var NONE = "none";
	var UNKNOWN = "unknown";
	var WIFI = "wifi";
	var connection = navigator.connection;
	
	
	
	var isOnline = function(){
		return !connection ? true : navigator.connection.type!=NONE;
	};
	
	var isOffline = function(){
		return !connection ? false : navigator.connection.type==NONE;
	};
	
	var isWifi = function(){
		return !connection ? true : navigator.connection.type==WIFI;
	};
	
	var stateChanged = function(event, netState){
		var type = isOnline() ? 'online' : 'offline';
		
		$rootScope.$broadcast('NetworkState:'+type, event, netState);
	};
	
	function checkNavigator(){
		if(!navigator.connection){
			//navigator.connection = {type: WIFI};
			navigator.connection = {type: NONE};
		}
		
		/*if($rootScope.isWeb){
			navigator.connection = {type:WIFI};
		}*/
	}
	//checkNavigator();
	
	$rootScope.$on('$cordovaNetwork:online', stateChanged);
	$rootScope.$on('$cordovaNetwork:offline', stateChanged);
	
	return {
		isOnline: isOnline,
		isOffline: isOffline,
		isWifi: isWifi,
	}
});
