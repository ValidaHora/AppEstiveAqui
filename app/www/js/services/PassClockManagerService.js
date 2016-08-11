angular.module('starter.services')
.factory('PassClockManager', function(LocalStorage) {
	var KEY_PASS_CLOCKS = 'vh_pass_clocks';
	var list = [];
	
	var set = function(passclocks){
		list = passclocks;
		LocalStorage.setObject(KEY_PASS_CLOCKS, list);
	};
	
	var get = function(){
		return list;
	};
	
	var find = function(id){
		var clock = null;
		for(var i in list){
			if(list[i].NumeroPassClock==id){
				clock = list[i];
				break;
			}
		}
		
		return clock;
	};
	
	if(LocalStorage.has(KEY_PASS_CLOCKS)){
		list = LocalStorage.getObject(KEY_PASS_CLOCKS);
	};
	
	return {
		KEY_PASS_CLOCKS: KEY_PASS_CLOCKS,
		set: set,
		get: get,
		find: find,
	}
});
