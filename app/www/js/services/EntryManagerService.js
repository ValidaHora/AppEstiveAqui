angular.module('starter.services')
.factory('EntryManager', function(LocalStorage) {
	var KEY_ENTRIES = 'vh_pass_clocks_entries';
	var KEY_ENTRIES_SYNC = 'vh_pass_clocks_entries_sync';
	var entries = [];
	var sync = [];
	
	var set = function(passclocks){
		entries = passclocks;
		save();
	};
	
	var get = function(){
		return entries;
	};
	
	var add = function(lancamento){
		entries.push(lancamento);
		save();
	};
	
	var getSync = function(){
		return sync;
	};
	
	var schedule = function(clock, code, typeTime){
		sync.push({
			clock: clock,
			code: code,
			typeTime: typeTime,
		});
		save();
	}
	
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
	
	var save = function(){
		LocalStorage.setObject(KEY_ENTRIES, entries);
		LocalStorage.setObject(KEY_ENTRIES_SYNC, sync);
	};
	
	var load = function(){
		if(LocalStorage.has(KEY_ENTRIES)){
			entries = LocalStorage.getObject(KEY_ENTRIES);
		};
		
		if(LocalStorage.has(KEY_ENTRIES_SYNC)){
			sync = LocalStorage.getObject(KEY_ENTRIES_SYNC);
		};
	}
	
	load();
	return {
		set: set,
		get: get,
		add: add,
		getSync: getSync,
		schedule: schedule,
		findById: findById,
		findByClock: findByClock,
	}
});
