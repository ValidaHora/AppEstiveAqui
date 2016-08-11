angular.module('starter.services')
.factory('TimeHelper', function() {
	var timezone = null;
	
	var getTimeZone = function(){
		var date = new Date();
		var utcOffset = date.getTimezoneOffset();
		var gmtSign = utcOffset > 0 ? '-' : '+';
		var gmt = ('00'+utcOffset/60).slice(-2);
		
		gmt = (gmtSign+gmt+'000').slice(0, 5);
		return gmt;
	};
	
	var entryDate = function(){
		var date = new Date();		
		return date.getFullYear()+
					pad(date.getMonth()+1)+
					pad(date.getUTCDate())+
					pad(date.getUTCHours())+
					pad(date.getUTCMinutes());
	};
	
	var calcDate = function(){
		var date = new Date();					
		return date.getFullYear()+
					pad(date.getMonth()+1)+
					pad(date.getUTCDate())+
					pad(date.getUTCHours())+
					pad(date.getUTCMinutes())+
					pad(date.getUTCSeconds());
	};
	
	var pad = function(num){
		return ('00'+num).slice(-2);
	}
	
	var toDate = function(strDate){
		var year = null;
		var month = null;
		var date = null;
		var hour = null;
		var minute = null;
		var second = null;
		var milisecond = null;
		
		if(strDate.length==12){
			year = strDate.substr(0, 4);
			month = strDate.substr(4, 2);
			date = strDate.substr(6, 2);
			hour = strDate.substr(8, 2);
			minute = strDate.substr(10, 12);
			second = strDate.substr(12);
			
		}else if(strDate.length==14){
			year = strDate.substr(0, 4);
			month = strDate.substr(4, 2);
			date = strDate.substr(6, 2);
			hour = strDate.substr(8, 2);
			minute = strDate.substr(10, 12);
		}
		
		return new Date(year, month-1, date, hour, minute, second, milisecond);
	};
	
	timezone = getTimeZone();
	return {
		timezone: timezone,
		getTimeZone: getTimeZone,
		entryDate: entryDate,
		calcDate: calcDate,
		toDate: toDate,
		pad: pad,
	}
});
