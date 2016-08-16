angular.module('starter.controllers')
.controller('CheckInCtrl', function($rootScope, $scope, $ionicModal, $cordovaNetwork, $ionicSideMenuDelegate, $ionicHistory, $state, $ionicLoading, $cordovaGeolocation, NetworkState, OTP, EntryManager, PassClockManager, ApiValidaHora, ApiEstiveAqui, TimeHelper, User){
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
		
	$scope.toggleNetState = function(event, netState){
		var has = NetworkState.isOnline();//networkState != 'none';//navigator.connection.type.NONE;
		if(has){
			$scope.fetch();
		}
		
		$scope.hasNetwork = has;
	}
	
	$scope.displaySuccess = function(){
		$scope.isShowMain = false;
		$scope.isSuccess = true;
		$scope.isError = false;
	}
	
	$scope.displayError = function(title, message){
		$scope.isShowMain = false;
		$scope.isSuccess = false;
		$scope.isError = true;
		
		$scope.errorTitle = title;
		$scope.errorMessage = message;
	}
	
	$scope.displayMain = function(){
		$scope.isShowMain = true;
		$scope.isSuccess = false;
		$scope.isError = false;
	}
	
	$scope.fetch = function(){
		ApiEstiveAqui.fetchUserData().then(function(){
			$scope.history = EntryManager.get();
			$scope.registerData.token.clock = EntryManager.getSelection();
		});
	}
	
	$scope.registerToken = function(){
		//$scope.displaySuccess();
		if(!$scope.registerData.token.clock){
			$scope.simpleAlert('Erro', 'Selecione o local');
		
		}else if(!$scope.registerData.token.code){
			$scope.simpleAlert('Erro', 'Código não pode ser vazio');
		
		}else if( !tokenValidation() ){
			$scope.displayError('Código inválido. Verifique se o passclock é o correto.', 'Clique no botão abaixo para lançar sua hora.');
			//$scope.simpleAlert('Erro', 'Código inválido');
			
		}else{
			$scope.registerData.typedTime = TimeHelper.calcDate();
			$scope.registerData.token.code = padToken();
			
			$ionicLoading.show();
			$cordovaGeolocation.getCurrentPosition({enableHighAccuracy:false}).then(function(pos){
				$scope.registerData.position.coords.latitude = pos.coords.latitude;
				$scope.registerData.position.coords.longitude = pos.coords.longitude;
				
				if($scope.hasNetwork){
					ApiValidaHora.calcHour($scope.registerData.token.clock, $scope.registerData.token.code, $scope.registerData.typedTime, $scope.registerData.position).then(function(calculated){
						$scope.registerData.launchTime = calculated.HoraLancada;
						$scope.registerData.hashCode = calculated.HashCode;
						$scope.displaySuccess();
					});
				}else{
					//EntryManager.schedule($scope.registerData);
					$ionicLoading.hide();
					$scope.displaySuccess();
				}
			}, function(){
				$ionicLoading.hide();
				$scope.simpleAlert('Não foi possivel obter a sua localização.');
			});			
		}
	}
	
	$scope.launchHour = function(){
		var title = 'Sucesso';
		var msg = 'Hora lançada com sucesso!';
		
		if($scope.hasNetwork){
			ApiEstiveAqui.launchHour(
				$scope.registerData.token.clock,
				$scope.registerData.token.code,
				$scope.registerData.typedTime,
				$scope.registerData.launchTime,
				$scope.registerData.hashCode,
				$scope.registerData.position,
				$scope.registerData.note
			).then(function(launched){
				EntryManager.add(launched.Lancamento);
				EntryManager.setSelection($scope.registerData.token.clock);
				$scope.history.push(launched.Lancamento);
				
				$scope.displayMain();
				resetRegister();
				$scope.simpleAlert(title, msg);
			});
		}else{
			$scope.displayError('Sem conexão. Você não tem nenhuma conexão ativa.', 'Não se preocupe, essa hora foi registrada e você pode envia-la assim que tiver conexão clicando no icone de relógio no canto superior');
			EntryManager.schedule($scope.registerData);
			$scope.syncCount ++;
			resetRegister();
			$scope.simpleAlert(title, msg);
		}
	}
	
	$scope.sync = function(){};
	
	var padToken = function(){
		return (('000000'+$scope.registerData.token.code).slice(-6));
	}
	
	var tokenValidation = function(){
		var date = new Date();
		var validToken = TimeHelper.pad(date.getUTCDate())+TimeHelper.pad(date.getUTCHours())+TimeHelper.pad(date.getUTCMinutes());
		var token = padToken();
		
		return validToken == token;
	};
	
	var resetRegister = function(){
		$scope.registerData = { token:{code: null, clock:selected}, note: null, position:{coords:{latitude:0,longitude:0}}, typedTime:null, launchTime:null, hashCode:null };
	};
	
	var selected = EntryManager.getSelection();
	$scope.clocks 		= [];
	$scope.readyToLaunch= false;
	$scope.isShowMain 	= true;
	$scope.isSuccess 	= false;
	$scope.isError 		= false;
	$scope.errorTitle 	= null;
	$scope.errorMessage = null;
	$scope.hasNetwork 	= false;
	$scope.syncCount 	= EntryManager.getSync().length;
	$scope.history 		= [];
	$scope.isLoged 		= User.get().id!=undefined;
	$scope.registerData = {};
	
	resetRegister();
	if(!$scope.isWeb){
		$scope.hasNetwork = NetworkState.isOnline();
		
		/*if($scope.hasNetwork && $scope.isLoged)
			$scope.fetch();*/
	}else{
		$scope.hasNetwork = false;
	}
		
	$scope.$on("$ionicView.beforeEnter", function(event, data){
	   if(!$scope.isLoged){
	   		$ionicHistory.nextViewOptions({
				disableAnimate: false,
				disableBack: true,
				historyRoot: true,
			});
			$state.go('activation');
		}
		
		$scope.clocks = PassClockManager.get();
	});
	
	
	
	$scope.$watch('registerData.token.code', function(newValue, oldValue) {
		newValue = newValue+'';
		$scope.readyToLaunch = newValue && newValue.length>=6;
		if($scope.readyToLaunch){
			$scope.registerData.token.code = parseInt(newValue.substr(0, 6));
		}
	});
	
	$rootScope.$on('NetworkState:online', $scope.toggleNetState);
	$rootScope.$on('NetworkState:offline', $scope.toggleNetState);
})
