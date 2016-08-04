angular.module('starter.controllers')
.controller('CheckInCtrl', function($rootScope, $scope, $ionicModal, $cordovaNetwork, $ionicSideMenuDelegate, $ionicHistory, $state, OTP, EntryManager, PassClockManager, ApiValidaHora, TimeHelper, User){
	/*$scope.toggleLeft = function(){
		$ionicSideMenuDelegate.toggleLeft();
	};*/
	
	$ionicModal.fromTemplateUrl('templates/history.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	
	$scope.displayHistory = function() {
		$scope.modal.show();
	};
	$scope.hideHistory = function() {
		$scope.modal.hide();
	};
	
	// Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});
	
	if(!$scope.isWeb){
		//BUG objeto Connection so fica disponivel depois do settimeout
		setTimeout(function(){
			var bug = Connection.UNKNOW;
			$scope.hasNetwork = $cordovaNetwork.isOnline();//$cordovaNetwork.getNetwork()!=Connection.NONE;
		}, 1);
	}
	
	$scope.toggleNetState = function(event, networkState){
		console.log('network state changed to:', networkState);
		var has = $cordovaNetwork.isOnline();//networkState != 'none';//navigator.connection.type.NONE;
		$scope.hasNetwork = has;
	}
	
	$scope.displaySuccess = function(){
		$scope.isShowMain = false;
		$scope.isSuccess = true;
		$scope.isError = false;
	}
	
	$scope.displayError = function(){
		$scope.isShowMain = false;
		$scope.isSuccess = false;
		$scope.isError = true;
	}
	
	$scope.displayMain = function(){
		$scope.isShowMain = true;
		$scope.isSuccess = false;
		$scope.isError = false;
	}
	
	$scope.registerToken = function(){
		if(!$scope.token.clock){
			$scope.simpleAlert('Erro', 'Selecione o local');
		
		}else if(!$scope.token.number){
			$scope.simpleAlert('Erro', 'Código não pode ser vazio');
		
		/*}else if( !OTP.isEquals($scope.token.number) ){
			$scope.simpleAlert('Erro', 'Código inválido');
			
		*/}else{
			/*TodayHistory.add($scope.token.clock, $scope.token.number, false);
			$scope.displaySuccess();
			$scope.token.number = null;
			$scope.token.clock = null;
			$scope.syncCount = TodayHistory.getSyncCount();*/
			
			$scope.displaySuccess();
			/*ApiValidaHora.calcHour($scope.token.clock, (('000000'+$scope.token.number).slice(-6)), TimeHelper.calcDate()).then(function(response){
			});*/
		}
	}
	
	$rootScope.$on('$cordovaNetwork:online', $scope.toggleNetState);
	$rootScope.$on('$cordovaNetwork:offline', $scope.toggleNetState);
	
	$scope.clocks = [];
	$scope.token = {number: null, clock:null};
	$scope.isShowMain = true;
	$scope.isSuccess = false;
	$scope.isError = false;
	$scope.hasNetwork = false;
	$scope.syncCount = 0;
	
	$scope.history = EntryManager.get();
	
	$scope.$on("$ionicView.beforeEnter", function(event, data){
	   if(!User.get().id){
			$ionicHistory.nextViewOptions({
					disableAnimate: false,
					disableBack: true,
					historyRoot: true,
				});
				$state.go('activation');
		}
		
		$scope.clocks = PassClockManager.get();
	});
	
	
})
