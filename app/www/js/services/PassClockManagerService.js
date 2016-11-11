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
	
	var find = function(id, returnIndex){
		var clock = null;
		var index = null;
		for(var i in list){
			if(list[i].NumeroPassClock==id){
				clock = list[i];
				index = i;
				break;
			}
		}
		
		return returnIndex ? index : clock;
	};
	
	var mergeWithSeeds = function(seeds){
		var clock;
		var seed;
		var index;
		for(var i in seeds){
			seed = seeds[i];
			index = find(seed.TOK, true);
			
			if(index){
				list[index].seed = seed;
			}
		}
	}
	
	if(LocalStorage.has(KEY_PASS_CLOCKS)){
		list = LocalStorage.getObject(KEY_PASS_CLOCKS);
	};
	
	return {
		KEY_PASS_CLOCKS: KEY_PASS_CLOCKS,
		set: set,
		get: get,
		find: find,
		mergeWithSeeds: mergeWithSeeds,
	}
});
