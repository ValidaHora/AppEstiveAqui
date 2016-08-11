angular.module('starter.services').factory('TodayHistory', function(LocalStorage){
	var getNow = function(){
		var date = new Date();
		return date.getTime();
	};
	
	var get = function(){
		return history;
	};
	
	var getList = function(){
		return history.list;
	};
	
	var getSyncCount = function(){
		var item;
		var list = getList();
		var count = 0;
		for(var i in list){
			item = list[i];
			if(!item.sync)
				count ++;
		}
		
		return count;
	};
	
	var create = function(place, code, sync){
		var date = new Date();
		var slice = -2;
		var pad = '00';
		var hour = (pad+date.getHours()).slice(slice);
		var minute = (pad+date.getMinutes()).slice(slice);
		var formated = hour+'h'+minute;
		return {
			place: place,
			time: date.getTime(),
			hour: formated,
			token: code,
			sync: sync,
		}
	};
	
	var add = function(place, code, sync){
		var item = create(place, code, sync);
		history.list.push(item);
		save();
	}
	
	var save = function(){
		LocalStorage.setObject(KEY_TODAY, history);
	}
	
	var KEY_TODAY = 'vh_history_today';
	var dateNow = null;
	var dateHistory = null;
	var history = {
		time: null,
		list: [],
	};
	
	
	
	if(LocalStorage.has(KEY_TODAY)){
		history = LocalStorage.getObject(KEY_TODAY);
	}else{
		history.time = getNow();
	}
	
	dateNow = new Date();
	dateHistory = new Date(history.time);
	
	if( dateNow.getDate()!=dateHistory.getDate() ){
		history.list = [];
	}
	
	return {
		add: add,
		getList: getList,
		getSyncCount: getSyncCount,
	}
})
