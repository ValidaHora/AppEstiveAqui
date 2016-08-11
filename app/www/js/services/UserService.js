angular.module('starter.services')
.factory('User', function(LocalStorage) {
	var KEY_USER = 'vh_user';
	var user = {nickname: null, id: null};
	
	var set = function(id, nick){
		user.id = id;
		user.nickname = nick;
		LocalStorage.setObject(KEY_USER, user);
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
	
	if(LocalStorage.has(KEY_USER)){
		user = LocalStorage.getObject(KEY_USER);
	};
	
	return {
		set: set,
		get: get,
		getId: getId,
		getNickname: getNickname,
	}
});
