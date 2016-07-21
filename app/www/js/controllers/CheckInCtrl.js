angular.module('starter.controllers')
.controller('CheckInCtrl', function($rootScope, $scope, $ionicModal, $cordovaNetwork, $ionicSideMenuDelegate, OTP, TodayHistory){
	$scope.toggleLeft = function(){
		$ionicSideMenuDelegate.toggleLeft();
	};
	
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
		}, 0);
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
		if(!$scope.token.place){
			$scope.simpleAlert('Erro', 'Selecione o local');
		
		}else if(!$scope.token.number){
			$scope.simpleAlert('Erro', 'Código não pode ser vazio');
		
		}else if( !OTP.isEquals($scope.token.number) ){
			$scope.simpleAlert('Erro', 'Código inválido');
			
		}else{
			TodayHistory.add($scope.token.place, $scope.token.number, false);
			$scope.displaySuccess();
			$scope.token.number = null;
			$scope.token.place = null;
			$scope.syncCount = TodayHistory.getSyncCount();
		}
	}
	
	$rootScope.$on('$cordovaNetwork:online', $scope.toggleNetState);
	$rootScope.$on('$cordovaNetwork:offline', $scope.toggleNetState);
	
	$scope.places = ['Casa', 'Sítio', 'Praia'];
	
	$scope.token = {number: null, place:null};
	$scope.isShowMain = true;
	$scope.isSuccess = false;
	$scope.isError = false;
	$scope.hasNetwork = false;
	$scope.syncCount = TodayHistory.getSyncCount();
	
	$scope.history = TodayHistory.getList();
})
