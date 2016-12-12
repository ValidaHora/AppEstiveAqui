angular.module('starter.services')
.factory('User', function(LocalStorage) {
	var KEY_USER = 'vh_user';
	var user = {nickname: null, id: null, activationCode: null, limit:{max:0, total:0}};
	
	var set = function(id, nick, code){
		user.id = id;
		user.nickname = nick;
		user.activationCode = code;
		
		
		LocalStorage.setObject(KEY_USER, user);
	};
	
	var setLimit = function(max){
		user.limit.max = max;
		
		LocalStorage.setObject(KEY_USER, user);
	};
	
	var getLimit = function(){
		if(!user.limit){
			user.limit = {max:0};
		}
		
		return user.limit;
	};
	
	var get = function(){
		return user;
	};
	
	var getId = function(){
		return user.id;
	};
	
	var getNickname = function(){
		return user.nickname;
	};
	
	var clear = function(){
		LocalStorage.clear();
	}
	
	if(LocalStorage.has(KEY_USER)){
		user = LocalStorage.getObject(KEY_USER);
	};
	
	return {
		set: set,
		get: get,
		getId: getId,
		getNickname: getNickname,
		setLimit: setLimit,
		getLimit: getLimit,
		clear: clear,
	}
});
