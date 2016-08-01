angular.module('starter.services')
.factory('EntryManager', function(LocalStorage) {
	var KEY_ENTRIES = 'pass_clocks_entries';
	var entries = [];
	
	var set = function(passclocks){
		entries = passclocks;
		LocalStorage.setObject(KEY_ENTRIES, entries);
	};
	
	var get = function(){
		return entries;
	};
	
	var find = function(term, field){
		var clock = null;
		for(var i in entries){
			if(entries[i][field]==term){
				clock = entries[i];
				break;
			}
		}
		
		return clock;
	};
	
	var findById = function(id){
		var clock = find(id, 'ID');
	};
	
	var findByClock = function(passClockId){
		var clock = find(passClockId, 'PC ');
	};
	
	if(LocalStorage.has(KEY_ENTRIES)){
		entries = LocalStorage.getObject(KEY_ENTRIES);
	};
	
	return {
		set: set,
		get: get,
		findById: findById,
		findByClock: findByClock,
	}
});
