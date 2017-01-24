angular.module('starter.controllers')
.controller('ActivationTokenCtrl', function($scope, $state, $stateParams, $ionicHistory, $cordovaInAppBrowser, ApiEstiveAqui){
	$scope.token = {number:null};
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
	};
	
	$scope.downloadGestor = function(){
		var url;
		
		if($scope.isDroid)
			url = 'market://details?id=br.com.estiveaqui.app.gestor';
		else
			url = 'itms-apps://itunes.apple.com/app/id1180773138';
		
		$cordovaInAppBrowser.open(url, '_system').then(function(event) {
		//$cordovaInAppBrowser.open('https://play.google.com/store/apps/details?id=com.dopaminamob.palavrasdosenhor').then(function(event) {
	        //success
	        console.log(event);
		})
		.catch(function(event) {
			//error
	        console.log(event);
		});
	};
	
	$scope.$on('$ionicView.afterEnter', function(){
		if($stateParams.code){
			console.log('$stateParams');
			console.log($stateParams);
			$scope.token.number = $stateParams.code;
			$scope.lockCode = true;
			$scope.activate();
		}else{
			$scope.lockCode = false;
			//$scope.simpleAlert('Erro', 'Nenhum código de ativação informado');
		}
	});
});
