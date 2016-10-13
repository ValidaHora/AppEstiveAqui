angular.module('starter.controllers').controller('CheckInCtrl', function($rootScope, $scope, $ionicModal, $cordovaNetwork, $ionicSideMenuDelegate, $ionicHistory, $state, $timeout, $ionicLoading, $cordovaGeolocation, NetworkState, OTP, EntryManager, PassClockManager, ApiValidaHora, ApiEstiveAqui, TimeHelper, User){
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
		var has = NetworkState.isOnline();
		if(has){
			$scope.fetch();
			$scope.runSync();
		}else{
			clearTimeout(syncTimeout);
		}
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
	
	$scope.displayError = function(button, title, message){
		$scope.isShowMain = false;
		$scope.isSuccess = false;
		$scope.isError = true;
		
		$scope.fail.button = button;
		$scope.fail.title = title;
		$scope.fail.message = message;
	};
	
	$scope.displayMain = function(){
		$scope.isShowMain = true;
		$scope.isSuccess = false;
		$scope.isError = false;
	};
	
	$scope.fetch = function(){
		if($scope.isLoged){
			ApiEstiveAqui.fetchUserData().then(function(){
				$scope.history = EntryManager.get();
			});
		}
	};
	
	$scope.registerToken = function(){
		if(!$scope.registerData.token.clock){
			$scope.simpleAlert('Erro', 'Selecione o local');
		
		}else if(!$scope.registerData.token.code){
			$scope.simpleAlert('Erro', 'Código não pode ser vazio');
		
		}else if( EntryManager.findSyncByCode($scope.registerData.token.code) ){
			$scope.simpleAlert('Erro', 'Este código já esta na fila para ser enviado.');
			
		}else if( !tokenValidation() ){
			$scope.displayError('Tentar novamente', 'Código inválido. Verifique se o passclock é o correto.', '');
			
		}else{
			$scope.registerData.typedTime = TimeHelper.calcDate();
			$ionicLoading.show();
			
			function hasLocationCallback(available){
				
				if(available){
					$cordovaGeolocation.getCurrentPosition({timeout:3000, enableHighAccuracy:false}).then(function(pos){
						$scope.registerData.position.coords.latitude = pos.coords.latitude;
						$scope.registerData.position.coords.longitude = pos.coords.longitude;
						$scope.calcHour();
						
					}, function(err){
						console.log('get possition error', err);
						var posError;
						if(err.code==3)
							posError = 3000;
						else
							posError = 4000;
						
						$scope.registerData.position.coords.latitude = posError;
						$scope.registerData.position.coords.longitude = posError;
						$scope.calcHour();
					});
				}else{
					$scope.registerData.position.coords.latitude = 2000;
					$scope.registerData.position.coords.longitude = 2000;
					$scope.calcHour();
				}
			}
			
			function noLocationCallback(error){
				$scope.registerData.position.coords.latitude = 1000;
				$scope.registerData.position.coords.longitude = 1000;
				$scope.calcHour();
			}
			
			cordova.plugins.diagnostic.isLocationAvailable(hasLocationCallback, noLocationCallback);
		}
	};
	
	$scope.calcHour = function(){
		if($scope.hasNetwork){
			ApiValidaHora.calcHour($scope.registerData.token.clock, $scope.registerData.token.code, $scope.registerData.typedTime, $scope.registerData.position).request().then(function(calculated){
				$scope.registerData.launchTime = calculated.HoraLancada;
				$scope.registerData.hashCode = calculated.HashCode;
				$scope.displaySuccess();
				//$ionicLoading.hide();
			});
		}else{
			$ionicLoading.hide();
			$scope.displaySuccess();
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
			).request().then(function(launched){
				//$scope.history.push(launched.Lancamento);
				EntryManager.add(launched.Lancamento);
				EntryManager.setSelection($scope.registerData.token.clock);
				selected = $scope.registerData.token.clock;
				
				$scope.history = EntryManager.get();
				$scope.displayMain();
				$scope.simpleAlert(title, msg);
				resetRegister();
			});
		}else{
			$scope.displayError('Ok, entendi', 'Você não possui uma conexão com a internet.', 'Sua hora foi salva e sera lançada quando você estiver conectado.');
			EntryManager.schedule($scope.registerData);
			$scope.syncCount ++;
			resetRegister();
		}
	};
	
	$scope.runSync = function(){
		if($scope.syncCount>0){
			var data = $scope.sync[0];
			//var removed = EntryManager.removeSync(data._id);
			//return false;
			ApiEstiveAqui.syncToken(data.token.clock, data.token.code, data.typedTime, data.position).then(function(launched){
				var removed = EntryManager.removeSync(data._id);
				$scope.syncCount --;
				EntryManager.add(launched.Lancamento);
				syncTimeout = setTimeout($scope.runSync, $scope.syncDelay);
			});
		}
	};
	
	var padToken = function(){
		var tk = $scope.fakeToken.code;
		var padded = ('000000'+(tk+''));
		var sliced = padded.slice(-6);
		
		return sliced;
	};
	
	var tokenValidation = function(){
		var token = $scope.registerData.token.code;
		return validateOTP(token) || validateTest(token);
	};
	
	var validateOTP = function(token){
		var passes = false;
		var past = 20;
		var future = 20;
		var date = new Date();
		var currentTest = OTP.getOtpCodeFromDate(date);
		var dateTest;
		var otp;
		if(currentTest==token){
			passes = true;
		}else{
			date.setMinutes(date.getUTCMinutes()-past);
			
			for(var i=0; i<(past+future); i++){
				otp = OTP.getOtpCodeFromDate(date);
				passes = token==otp;
				
				/*console.log(token+" == "+otp, passes);
				console.log(date);
				console.log(i+' | -----------------------------------------------------'+(passes?'-------------------->':''));*/
				if(passes){
					break;
				}
				date.setMinutes(date.getUTCMinutes()+1);
			}
		}
		
		return passes;
	}
	
	var validateTest = function(token){
		var date = new Date();
		var passes = false;
		var past = 20;
		var future = 20;
		var currentTest = TimeHelper.pad(date.getUTCDate())+TimeHelper.pad(date.getUTCHours())+TimeHelper.pad(date.getUTCMinutes());
		
		if(currentTest==token){
			passes = true;
		}else{
			date.setMinutes(date.getUTCMinutes()-past);
			for(var i=0; i<(past+future); i++){
				currentTest = TimeHelper.pad(date.getUTCDate())+TimeHelper.pad(date.getUTCHours())+TimeHelper.pad(date.getUTCMinutes());
				passes = token==currentTest;
				
				if(passes){
					break;
				}
				date.setMinutes(date.getUTCMinutes()+1);
			}
		}
		
		return passes;
	}
	
	var resetRegister = function(){
		$scope.fakeToken.code = null;
		$scope.registerData = { token:{code: null, clock:selected}, note: null, position:{coords:{latitude:0,longitude:0}}, typedTime:null};
	};
	
	var selected 		= EntryManager.getSelection();
	var syncTimeout		= -1;
	$scope.clocks 		= PassClockManager.get();
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
	$scope.fakeToken = {code:null};
	$scope.otpcode = 'xxxxxx';
	$scope.timer = 0;
	$scope.fail = {button:null, title:null, message: null};
	
	resetRegister();
	if(!$scope.isWeb){
		$scope.hasNetwork = NetworkState.isOnline();
		if($scope.hasNetwork && $scope.isLoged)
			$scope.fetch();
	}else{
		$scope.hasNetwork = true;
	}
	
	$scope.$on("$ionicView.beforeEnter", function(event, data){
		$scope.isLoged = User.get().id!=undefined;
		if(!$scope.isLoged){
			$ionicHistory.nextViewOptions({
				disableAnimate: false,
				disableBack: true,
				historyRoot: true,
			});
			$state.go('activation');
		}else{
			$scope.clocks = PassClockManager.get();
		}
	});
	
	
	/*var isZeroStart = false;
	$scope.$watch('fakeToken.code', function(newValue, oldValue) {
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
			$scope.registerData.token.code = padToken();
			$scope.fakeToken.code = parseInt(newValue.substr(0, 6));
		}else{
			return false;
		}
	});*/
	
	$rootScope.$on('NetworkState:online', $scope.toggleNetState);
	$rootScope.$on('NetworkState:offline', $scope.toggleNetState);
	$rootScope.$on('OTP:tick', function(event, otpcode, remaining){
		$scope.otpcode = otpcode;
		$scope.timer = remaining;
		$scope.$apply();
	});
});

angular.module('starter.controllers').directive('tokenlimit', function(){
	var limit = 6;
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs) {
            $element.on('keypress', function(e) {
				if (this.value.length == limit){
					e.preventDefault();
				}
				$scope.$apply();
            });
            
            $element.on("keyup", function(e) {
				$scope.readyToLaunch = this.value.length == limit;
				if ($scope.readyToLaunch){
					$scope.registerData.token.code = this.value;//padToken();
				}
				$scope.$apply();
			});
        }
    }
});
