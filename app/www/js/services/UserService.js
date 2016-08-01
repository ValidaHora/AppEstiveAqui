angular.module('starter.services')
.factory('User', function(LocalStorage) {
	var KEY_USER = 'user';
	var user = {nickname: null, id: null};
	
	var set = function(nick, id){
		user.nickname = nick;
		user.id = id;
		LocalStorage.setObject(KEY_USER, user);
	};
	
	var get = function(){
		return user;
	};
	
	if(LocalStorage.has(KEY_USER)){
		user = LocalStorage.getObject(KEY_USER);
	};
	
	return {
		set: set,
		get: get,
	}
});
