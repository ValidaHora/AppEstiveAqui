angular.module('starter.controllers')
.controller('ActivationTokenCtrl', function($scope, $state, $stateParams, $ionicHistory, ApiEstiveAqui){
	$scope.token = {number:'CodNibles01'};
	$scope.lockCode = false;//true;
	
	$scope.activate = function(){
		ApiEstiveAqui.register($scope.token.number).then(
			function(){
				$ionicHistory.nextViewOptions({
					disableAnimate: false,
					disableBack: true,
					historyRoot: true,
				});
				$state.go('checkin').then(function(){
					$ionicHistory.removeBackView();
				});
			},
			function(){
				$scope.lockCode = false;
			}
		);
	}
	
	if($stateParams.code){
		$scope.token.number = $stateParams.code;
		$scope.lockCode = true;
		$scope.activate();
	}else{
		$scope.lockCode = false;
		//$scope.simpleAlert('Erro', 'Nenhum código de ativação informado');
	}
})
