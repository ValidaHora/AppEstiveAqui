angular.module('starter.services')
.factory('EntryManager', function(LocalStorage, PassClockManager, TimeHelper) {
	var KEY_ENTRIES = 'vh_pass_clocks_entries';
	var KEY_ENTRIES_SYNC = 'vh_pass_clocks_entries_sync';
	var KEY_ENTRIES_SELECTED = 'vh_pass_clocks_selected';
	var entries = [];
	var sync = [];
	var selected = {};
	
	var set = function(passclocks){
		entries = passclocks;
		save();
	};
	
	var get = function(){
		return entries;
	};
	
	var getTodayLaunches = function(){
		var launches = [];
		var entry;
		var entrydate;
		var date = new Date();
		var day = date.getDate();
		
		for(var i=0 in entries){
			entrydate = TimeHelper.resetTimezone( TimeHelper.toDate(entries[i].HL) );
			
			if( entrydate.getDate()==day ){
				launches.push(entries[i]);
			}
		}
		
		return launches;
	};
	
	var getTodayLaunchesCount = function(){
		return getTodayLaunches().length;
	};
	
	var setSelection = function(selection){
		selected = selection;
		save();
	};
	
	var getSelection = function(selection){
		return selected;
	};
	
	var add = function(lancamento){
		entries.unshift(lancamento);
		save();
	};
	
	var addFromBatch = function(sync){
		var clock = PassClockManager.find(sync.token.clock);
		var entry = {
			CD: sync.token.code,
			HL: sync.launchedTime,
			PA: clock.Apelido,
			PC: sync.token.clock,
			HC: sync.hashCode,
			HD: sync.typedTime,
			HE: sync.sendTime,
			LAT: sync.position.coords.latitude,
			LON: sync.position.coords.longitude,
		};
		entries.unshift(entry);
		save();
	};
	
	var del = function(id){
		var index = find(id, '_id', true);
		var removed = false;
		
		if(index){
			if(index){
				entries.splice(index, 1);
				removed = true;
				save();
			}
		}
		
		return removed;
	};
	
	var getSync = function(){
		return sync;
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
	};
	
	var updateSync = function(newSync){
		var index = findSyncById(newSync._id, true);
		if(index){
			sync[index] = newSync;
			save();
		}
	};
	
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
			add(convertFromRegisterData(data));
			
			sync.push(data);
		}
		
		save();
		return data._id;
	};
	
	var convertFromRegisterData = function(data){
		return {
			_id: data._id,
			not_launched: true,
			HL: '',
			PA: data.token.clock,
			CD: data.token.code,
			
		};
	};
	
	
	var hash = function(){
		/*var date = new Date();
		var sha = new jsSHA("SHA-1", "TEXT");
		var hash = null;
		sha.update(date.getTime().toString()+Math.random());
		hash = sha.getHash("HEX");*/
		var hash = null;
		hash = Math.floor(Math.random() *99999)+1;
		
		return hash;
	};
	
	
	//finds
	var find = function(term, field, returnIndex){
		var clock = null;
		var index = null;
		for(var i in entries){
			if(entries[i][field]==term){
				clock = entries[i];
				index = i;
				break;
			}
		}
		
		return (returnIndex==true) ? index : clock;
	};
	
	var findById = function(id, returnIndex){
		return find(id, 'ID', returnIndex);
	};
	
	var findByClock = function(passClockId){
		return find(passClockId, 'PC ');
	};
	
	var findSyncById = function(id, returnIndex){
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
		
		return (returnIndex==true) ? index : selected;
	};
	
	var findSyncByCode = function(code){
		var item = null;
		var selected = null;
		
		for( var i in sync){
			item = sync[i];
			if(item.token.code==code){
				selected = item;
			}
		}
		
		return selected;
	};
	
	//save & load
	var save = function(){
		LocalStorage.setObject(KEY_ENTRIES, entries);
		LocalStorage.setObject(KEY_ENTRIES_SYNC, sync);
		
		if(selected)
			LocalStorage.setObject(KEY_ENTRIES_SELECTED, selected);
	};
	
	var load = function(){
		if(LocalStorage.has(KEY_ENTRIES)){
			entries = LocalStorage.getObject(KEY_ENTRIES);
		}
		
		if(LocalStorage.has(KEY_ENTRIES_SYNC)){
			sync = LocalStorage.getObject(KEY_ENTRIES_SYNC);
		}
		
		if(LocalStorage.has(KEY_ENTRIES_SELECTED)){
			selected = LocalStorage.getObject(KEY_ENTRIES_SELECTED);
		}
	};
	
	load();
	return {
		set: set,
		get: get,
		add: add,
		del: del,
		addFromBatch: addFromBatch,
		getSync: getSync,
		schedule: schedule,
		removeSync: removeSync,
		findById: findById,
		findByClock: findByClock,
		findSyncById: findSyncById,
		findSyncByCode: findSyncByCode,
		updateSync: updateSync,
		setSelection: setSelection,
		getSelection: getSelection,
		load: load,
		getTodayLaunchesCount: getTodayLaunchesCount,
	};
});
