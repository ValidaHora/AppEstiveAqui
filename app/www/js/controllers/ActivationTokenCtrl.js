angular.module('starter.controllers')
.controller('ActivationTokenCtrl', function($scope, $state, $stateParams, $ionicHistory, ApiEstiveAqui){
	$scope.token = {number:null};
	$scope.lockCode = false;//true;
	
	if($stateParams.code){
		$scope.token.number = $stateParams.code;		
	}else{
		$scope.lockCode = false;
		//$scope.simpleAlert('Erro', 'Nenhum código de ativação informado');
	}
	
	$scope.activate = function(){
		ApiEstiveAqui.register($scope.token.number).then(function(){
			$ionicHistory.nextViewOptions({
				disableAnimate: false,
				disableBack: true,
				historyRoot: true,
			});
			$state.go('checkin');
		});
	}
})
