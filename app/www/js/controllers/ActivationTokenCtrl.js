angular.module('starter.controllers')
.controller('ActivationTokenCtrl', function($scope, $state, $stateParams, $ionicHistory, ApiEstiveAqui){
	$scope.token = {number:null};
	
	if($stateParams.code){
		$scope.token.number = $stateParams.code;		
	}else{
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
