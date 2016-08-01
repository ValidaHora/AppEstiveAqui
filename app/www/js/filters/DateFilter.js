angular.module('starter.filters').
filter('historyFormat', function(TimeHelper) {
	return function(input) {
		var date = TimeHelper.toDate(input);
		return date.getHours()+'h'+date.getMinutes();
	};
});
