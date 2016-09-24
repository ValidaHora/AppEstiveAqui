angular.module('starter.controllers')
.controller('IndexCtrl', function($scope, $ionicHistory, $state, User){
	$scope.isLoged = User.get().id!=undefined;
	
	$ionicHistory.nextViewOptions({
		disableAnimate: false,
		disableBack: true,
		historyRoot: true,
	});
	if($scope.isLoged){
		$state.go('checkin');
	}else{
		$state.go('activation');
	}
})
