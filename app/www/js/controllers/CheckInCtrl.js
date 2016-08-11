angular.module('starter.controllers')
.controller('CheckInCtrl', function($rootScope, $scope, $ionicModal, $cordovaNetwork, $ionicSideMenuDelegate, $ionicHistory, $state, $timeout, NetworkState, OTP, EntryManager, PassClockManager, ApiValidaHora, ApiEstiveAqui, TimeHelper, User){
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
		});
	}
	
	$scope.registerToken = function(){
		//$scope.displaySuccess();
		if(!$scope.token.clock){
			$scope.simpleAlert('Erro', 'Selecione o local');
		
		}else if(!$scope.token.number){
			$scope.simpleAlert('Erro', 'Código não pode ser vazio');
		
		}else if( !tokenValidation() ){
			$scope.displayError('Código inválido. Verifique se o passclock é o correto.', 'Clique no botão abaixo para lançar sua hora.');
			//$scope.simpleAlert('Erro', 'Código inválido');
			
		}else{
			var horaDigitada = TimeHelper.calcDate();
			var token = padToken();
			
			if($scope.hasNetwork){
				ApiEstiveAqui.registerToken($scope.token.clock, token, horaDigitada).then(function(response){
					EntryManager.add(response.Lancamento);
					$scope.displaySuccess();
				});
			}else{
				$scope.displayError('Sem conexão. Você não tem nenhuma conexão ativa.', 'Não se preocupe, essa hora foi registrada e você pode envia-la assim que tiver conexão clicando no icone de relógio no canto superior');
				EntryManager.schedule($scope.token.clock, token, horaDigitada);
				$scope.syncCount ++;
			}
			
			$scope.token.number = null;
			$scope.token.clock = null;
		}
	}
	
	$scope.sync = function(){};
	
	var padToken = function(){
		return (('000000'+$scope.token.number).slice(-6));
	}
	
	var tokenValidation = function(){
		var date = new Date();
		var validToken = TimeHelper.pad(date.getUTCDate())+TimeHelper.pad(date.getUTCHours())+TimeHelper.pad(date.getUTCMinutes());
		var token = padToken();
		
		return validToken == token;
	};
	
	$scope.clocks = [];
	$scope.token = {number: null, clock:null};
	$scope.isShowMain = true;
	$scope.isSuccess = false;
	$scope.isError = false;
	$scope.errorTitle = null;
	$scope.errorMessage = null;
	$scope.hasNetwork = false;
	$scope.syncCount = EntryManager.getSync().length;
	$scope.history = [];//EntryManager.get();
	$scope.isLoged = User.get().id!=undefined;
	
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
	
	if(!$scope.isWeb){
		$scope.hasNetwork = NetworkState.isOnline();
		
		if($scope.hasNetwork && $scope.isLoged)
			$scope.fetch();
	}
	
	$rootScope.$on('NetworkState:online', $scope.toggleNetState);
	$rootScope.$on('NetworkState:offline', $scope.toggleNetState);
})
