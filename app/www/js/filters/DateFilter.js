angular.module('starter.filters').
filter('historyFormat', function(TimeHelper) {
	return function(input) {
		var date = TimeHelper.resetTimezone( TimeHelper.toDate(input) );
		var hour = ('00'+date.getHours()).slice(-2);
		var minute = ('00'+date.getMinutes()).slice(-2);
		
		return hour+'h'+minute;
	};
});
