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
	
	var findSyncById = function(id, retunrIndex){
		var item = null;
		var selected = null;
		var index = null;
		
		for( var i in sync){
			item = sync[i];
			if(item._id==id){
				selected = item;
				index = i;
			}
		}
		
		return (retunrIndex==true) ? index : selected;
	};
	
	var removeSync = function(id){
		var removed = false;
		var index = findSyncById(id, true);
		if(index){
			sync.splice(index, 1);
			removed = true;
			save();
		}
		
		return removed;
	}
	
	var schedule = function(data){
		var index = sync.length-1;
		var last = sync[index];
		if(
			(index > -1 && data._id) && (
				last._id==data._id ||
				last.token.code==data.token.code ||
				last.typedTime==data.typedTime
			)
		){
			sync[index] = data;
		}else{
			data._id = hash();
			sync.push(data);
		}
		
		save();
		return data._id;
	};
	
	var hash = function(){
		var date = new Date();
		var sha = new jsSHA("SHA-1", "TEXT");
		var hash = null;
		sha.update(date.getTime().toString()+Math.random());
		hash = sha.getHash("HEX");
		
		return hash;
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
		removeSync: removeSync,
		findById: findById,
		findByClock: findByClock,
		findSyncById: findSyncById,
		setSelection: setSelection,
		getSelection: getSelection,
	}
});
