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
		if($scope.isLoged && !$scope.hasFetchedUser){
			$scope.hasFetchedUser = true;
			ApiEstiveAqui.fetchUserData().then(function(){
				$scope.history = EntryManager.get();
				$scope.runSync();
				
				ApiValidaHora.getSeeds(PassClockManager.get(), false).request().then(function(seeds){
					PassClockManager.mergeWithSeeds(seeds.Tokens);
					PassClockManager.set(PassClockManager.get());
				});
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
			
			if(typeof cordova!='undefined'){
				cordova.plugins.diagnostic.isLocationAvailable(hasLocationCallback, noLocationCallback);
			}else{
				hasLocationCallback(true);
			}
		}
	};
	
	$scope.calcHour = function(){
		if($scope.hasNetwork){
			ApiValidaHora.calcHour($scope.registerData.token.clock, $scope.registerData.token.code, $scope.registerData.typedTime, $scope.registerData.position).disableAutoError().request().then(function(calculated){
				$scope.registerData.launchTime = calculated.HoraLancada;
				$scope.registerData.hashCode = calculated.HashCode;
				$scope.displaySuccess();
				//$ionicLoading.hide();
			}, function(err){
				if(err.no_server_response==true){
					$ionicLoading.hide();
					$scope.displaySuccess();
				}
			});
		}else{
			$ionicLoading.hide();
			$scope.displaySuccess();
		}
	};
	
	$scope.launchHour = function(){
		var title = 'Sucesso';
		var msg = 'Hora lançada com sucesso!';
		
		selected = $scope.registerData.token;
		EntryManager.setSelection(selected);
		
		//if(!$scope.hasNetwork)
			ApiEstiveAqui.launchHour(
				$scope.registerData.token.clock,
				$scope.registerData.token.code,
				$scope.registerData.typedTime,
				$scope.registerData.launchTime,
				$scope.registerData.hashCode,
				$scope.registerData.position,
				$scope.registerData.note
			).disableConnectionCheck().disableAutoError().request().then(
				function(launched){
					//$scope.history.push(launched.Lancamento);
					EntryManager.add(launched.Lancamento);
					
					//selected = $scope.registerData.token.clock;
					
					$scope.history = EntryManager.get();
					$scope.displayMain();
					$scope.simpleAlert(title, msg);
					resetRegister();
				},
				function(err){
					var errorScreenConfig = {
						button: null,
						title: null,
						message: null,
					}
					var needSchedule = false;
					
					if(!$scope.hasNetwork){
						errorScreenConfig.title = 'Você não possui uma conexão com a internet.';
						errorScreenConfig.message = 'Sua hora foi salva e sera lançada quando você estiver conectado.';
						errorScreenConfig.button = 'Ok, entendi';
						needSchedule = true;
						
					}else if(err.no_server_response==true){
						errorScreenConfig.title = 'Não foi possível se comunicar com o servidor.';
						errorScreenConfig.message = 'Sua hora foi salva e sera lançada quando for possível se comunicar com o servidor novamente.';
						errorScreenConfig.button = 'Ok, entendi';
						needSchedule = true;
						
					}else if(err.Mensagens){
						errorScreenConfig.title = 'Não foi possivel lançar a hora';
						errorScreenConfig.message = err.Mensagens[0].Mensagem;
						errorScreenConfig.button = 'Tentar novamente';
					
					}else{
						errorScreenConfig.title = 'Ops!';
						errorScreenConfig.message = err;
						errorScreenConfig.button = 'Tentar novamente';
					}
					
					if(needSchedule){
						EntryManager.schedule($scope.registerData);
						$scope.history = EntryManager.get();
						$scope.syncCount ++;
					}
					
					resetRegister();
					$scope.displayError(errorScreenConfig.button, errorScreenConfig.title, errorScreenConfig.message);
				}
			);
		/*}else{
			$scope.displayError(, , );
			EntryManager.schedule($scope.registerData);
			$scope.history = EntryManager.get();
			
			$scope.syncCount ++;
			resetRegister();
		}*/
	};
	
	$scope.runSync = function(){
		if($scope.syncCount>0){
			var syncErrors = [];
			var decSyncBy = 0;
			
			ApiValidaHora.calcHourBatch().setSilent(true).disableAutoError().request().then(function(responseHours){
				var item, sync;
				for(var i=0 in responseHours.Lancamentos){
					item = responseHours.Lancamentos[i];
					sync = EntryManager.findSyncById(item.IL);
					
					if(item.OK==true){
						if(sync){
							sync.hashCode = item.HC;
							sync.launchedTime = item.HL;
							sync.sendTime = TimeHelper.calcDate(true);
							EntryManager.updateSync(sync);
						}else{
							$scope.removeFromSync(item.IL);
						}
					}else{
						if(item.Erro.CE!=102){
							syncErrors.push('['+sync.token.code+'] '+item.Erro.ER);
							$scope.removeFromSync(item.IL);
						}
					}
				}
				
				ApiEstiveAqui.launchHourBatch(responseHours.Lancamentos).setSilent(true).request().then(function(responseLaunch){
					var launched, sync;
					for(var i=0 in responseLaunch.LNS){
						launched = responseLaunch.LNS[i];
						sync = EntryManager.findSyncById(launched.IL);
						if(launched && (launched.OK==true) ){
							if(sync){
								EntryManager.addFromBatch(sync);
								$scope.history = EntryManager.get();
								
								$scope.removeFromSync(launched.IL);
							}else{
								console.log('Sync ID['+launched.IL+'] not found in sync pool');
							}
						}else{
							console.log('LANCA_HORAS_ITEM_ERRO', launched);
							syncErrors.push('['+sync.token.code+'] '+launched.ER.ME);
							
							//if(launched.ER.CE==102){
								$scope.removeFromSync(launched.IL);
							//}
						}
					}
					
					if(syncErrors.length>0)
						$scope.simpleAlert('Erro', syncErrors.join('<br />'));
				});
			})
		}
	};
	
	$scope.removeFromSync = function(id){
		var removed = EntryManager.removeSync(id);
		$scope.syncCount --;
	};
	
	$scope.clockChange = function(){
		
		var clock = PassClockManager.find($scope.registerData.token.clock);
		
		if($scope.registerData.token.clock && (clock.seed && clock.seed.SMNT!="0")){
			OTP.setSecret(clock.seed.SMNT);
			OTP.start();
		}else{
			OTP.stop();
			$scope.otpcode = 'xxxxxx';
			$scope.timer = 0;
		}
	}
	
	var padToken = function(){
		var tk = $scope.fakeToken.code;
		var padded = ('000000'+(tk+''));
		var sliced = padded.slice(-6);
		
		return sliced;
	};
	
	var tokenValidation = function(){
		var token = $scope.registerData.token.code;
		return (validateOTP(token) || validateTest(token)) || (User.getId()==$rootScope.APPLE_ID && token==$rootScope.APPLE_CODE);
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
		$scope.registerData = { token:{code: null, clock:selected.clock, name:selected.name}, note: null, position:{coords:{latitude:0,longitude:0}}, typedTime:null};
		$scope.clockChange();
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
	$scope.history 		= EntryManager.get();
	$scope.isLoged 		= User.get().id!=undefined;
	$scope.registerData = {};
	$scope.fakeToken = {code:null};
	$scope.otpcode = 'xxxxxx';
	$scope.timer = 0;
	$scope.fail = {button:null, title:null, message: null};
	$scope.hasFetchedUser = false;
	
	resetRegister();
	if(!$scope.isWeb){
		$scope.hasNetwork = false;//NetworkState.isOnline();
		if($scope.hasNetwork && $scope.isLoged)
			$scope.fetch();
	}else{
		$scope.hasNetwork = true;
	}
	
	$scope.$on("$ionicView.beforeEnter", function(event, data){
		var user = User.get();
		
		$scope.isLoged = user.id!=undefined;
		if(!$scope.isLoged){
			$scope.hasFetchedUser = false;
			$ionicHistory.nextViewOptions({
				disableAnimate: false,
				disableBack: true,
				historyRoot: true,
			});
			$state.go('activation').then(function(){
				$ionicHistory.removeBackView();
			});
		}else{
			$scope.fetch();
			$scope.clocks = PassClockManager.get();
			if($scope.clocks.length==1){
				$scope.registerData.token.clock = $scope.clocks[0].NumeroPassClock;
				$scope.registerData.token.name = $scope.clocks[0].Apelido;
			}
		}
	});
	
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
