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
			$scope.runSync();
		}else{
			clearTimeout(syncTimeout);
		}
		
		console.log('network state has changed to: '+netState);
		$scope.hasNetwork = has;
	};
	
	$scope.toggleNet = function(){
		$scope.hasNetwork = !$scope.hasNetwork;
		navigator.connection.type = $scope.hasNetwork ? 'wifi' : 'none';
	};
	
	$scope.displaySuccess = function(){
		$scope.isShowMain = false;
		$scope.isSuccess = true;
		$scope.isError = false;
	};
	
	$scope.displayError = function(title, message){
		$scope.isShowMain = false;
		$scope.isSuccess = false;
		$scope.isError = true;
		
		$scope.errorTitle = title;
		$scope.errorMessage = message;
	};
	
	$scope.displayMain = function(){
		$scope.isShowMain = true;
		$scope.isSuccess = false;
		$scope.isError = false;
	};
	
	$scope.fetch = function(){
		ApiEstiveAqui.fetchUserData().request().then(function(){
			$scope.history = EntryManager.get();
			$scope.registerData.token.clock = EntryManager.getSelection();
		});
	};
	
	$scope.registerToken = function(){
		//$scope.displaySuccess();
		if(!$scope.registerData.token.clock){
			$scope.simpleAlert('Erro', 'Selecione o local');
		
		}else if(!$scope.registerData.token.code){
			$scope.simpleAlert('Erro', 'Código não pode ser vazio');
		
		}else if( EntryManager.findSyncByCode(padToken()) ){
			$scope.simpleAlert('Erro', 'Este código já esta na fila para ser enviado.');
			
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
					ApiValidaHora.calcHour($scope.registerData.token.clock, $scope.registerData.token.code, $scope.registerData.typedTime, $scope.registerData.position).request().then(function(calculated){
						$scope.registerData.launchTime = calculated.HoraLancada;
						$scope.registerData.hashCode = calculated.HashCode;
						$scope.displaySuccess();
					});
				}else{
					$ionicLoading.hide();
					$scope.displaySuccess();
				}
			}, function(){
				$ionicLoading.hide();
				$scope.simpleAlert('Não foi possivel obter a sua localização.');
			});			
		}
	};
	
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
			).request().then(function(launched){
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
		}
	};
	
	$scope.runSync = function(){
		if($scope.syncCount>0){
			console.log('sync runing');
			var data = $scope.sync[0];
			//var removed = EntryManager.removeSync(data._id);
			//return false;
			ApiEstiveAqui.syncToken(data.token.clock, data.token.code, data.typedTime, data.position).then(function(r){
				var removed = EntryManager.removeSync(data._id);
				$scope.syncCount --;
				console.log('sync end');
				console.log('removed', removed);
				syncTimeout = setTimeout($scope.runSync, $scope.syncDelay);
			});
		}
	};
	
	var padToken = function(){
		return (('000000'+$scope.registerData.token.code).slice(-6));
	};
	
	var tokenValidation = function(){
		var token = padToken();
		var date = new Date();
		//var validToken = TimeHelper.pad(date.getUTCDate())+TimeHelper.pad(date.getUTCHours())+TimeHelper.pad(date.getUTCMinutes());
		var validToken = OTP.getOtpCode();
		
		return validToken == token;
	};
	
	var resetRegister = function(){
		$scope.registerData = { token:{code: null, clock:selected}, note: null, position:{coords:{latitude:0,longitude:0}}, typedTime:null, launchTime:null, hashCode:null };
	};
	
	var selected 		= EntryManager.getSelection();
	var syncTimeout		= -1;
	$scope.clocks 		= [];
	$scope.readyToLaunch= false;
	$scope.isShowMain 	= true;
	$scope.isSuccess 	= false;
	$scope.isError 		= false;
	$scope.errorTitle 	= null;
	$scope.errorMessage = null;
	$scope.hasNetwork 	= false;
	$scope.sync 		= EntryManager.getSync();
	$scope.syncCount 	= $scope.sync.length;
	$scope.syncDelay 	= 60000;
	$scope.history 		= [];
	$scope.isLoged 		= User.get().id!=undefined;
	$scope.registerData = {};
	$scope.otpcode = 'not started';
	$scope.timer = 0;
	$scope.success = {button:null, title:null, message: null};
	$scope.fail = {button:null, title:null, message: null};
	
	resetRegister();
	if(!$scope.isWeb){
		$scope.hasNetwork = NetworkState.isOnline();
		
		/*if($scope.hasNetwork && $scope.isLoged)
			$scope.fetch();*/
	}else{
		$scope.hasNetwork = true;
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
		console.log(EntryManager.getSync());
	});
	
	
	var isZeroStart = false;
	$scope.$watch('registerData.token.code', function(newValue, oldValue) {
		newValue = newValue+'';
		if(newValue=='0'){
			isZeroStart = true;
		}else if(newValue=='null'){
			isZeroStart = false;
		}
		
		if(isZeroStart)
			newValue = '0'+newValue;
		
		$scope.readyToLaunch = newValue && newValue.length>=6;
		if($scope.readyToLaunch){
			$scope.registerData.token.code = parseInt(newValue.substr(0, 6));
		}
	});
	
	$rootScope.$on('NetworkState:online', $scope.toggleNetState);
	$rootScope.$on('NetworkState:offline', $scope.toggleNetState);
	$rootScope.$on('OTP:tick', function(event, otpcode, remaining){
		$scope.otpcode = otpcode;
		$scope.timer = remaining;
		$scope.$apply();
	});
})
