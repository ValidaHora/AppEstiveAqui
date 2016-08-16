angular.module('starter.services')
.factory('EntryManager', function(LocalStorage) {
	var KEY_ENTRIES = 'vh_pass_clocks_entries';
	var KEY_ENTRIES_SYNC = 'vh_pass_clocks_entries_sync';
	var KEY_ENTRIES_SELECTED = 'vh_pass_clocks_selected';
	var entries = [];
	var sync = [];
	var selected = null;
	
	var set = function(passclocks){
		entries = passclocks;
		save();
	};
	
	var get = function(){
		return entries;
	};
	
	var setSelection = function(selection){
		selected = selection;
		save();
	};
	
	var getSelection = function(selection){
		return selected;
	};
	
	var add = function(lancamento){
		entries.push(lancamento);
		save();
	};
	
	var getSync = function(){
		return sync;
	};
	
	var schedule = function(clock, code, typeTime, position){
		sync.push({
			clock: clock,
			code: code,
			typeTime: typeTime,
			position: position,
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
		
		if(selected)
			LocalStorage.set(KEY_ENTRIES_SELECTED, selected);
	};
	
	var load = function(){
		if(LocalStorage.has(KEY_ENTRIES)){
			entries = LocalStorage.getObject(KEY_ENTRIES);
		};
		
		if(LocalStorage.has(KEY_ENTRIES_SYNC)){
			sync = LocalStorage.getObject(KEY_ENTRIES_SYNC);
		};
		
		if(LocalStorage.has(KEY_ENTRIES_SELECTED)){
			selected = LocalStorage.get(KEY_ENTRIES_SELECTED);
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
		setSelection: setSelection,
		getSelection: getSelection,
	}
});
