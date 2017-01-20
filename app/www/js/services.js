angular.module('starter.services')

.directive('shareApp', function($cordovaSocialSharing) {
	return {
		link: function($scope, element) {
			element.on('click', function() {
				var $message = 'Conheça o sistema EstiveAqui de comprovação de presença em um determinado local.\n'+
							'Auxilia o ponto dos empregados de pequenas empresas e domésticos, pode ser usado como um sistema de ronda de segurança.\n'+
							'Acesse o site para maiores informações ou baixe o aplicativo de celular.\n\n'+
							'www.EstiveAqui.com.br';
				$cordovaSocialSharing.share($message/*, image, link*/).then(
					function(result){
						console.log(result);
					},
					
					function(err){
						console.log(err);
					}
				);
			});
		}
	};
})

.directive('rateApp', function($cordovaInAppBrowser) {
	return {
		link: function($scope, element) {
			element.on('click', function() {
				var url;
				if($scope.isDroid)
					url = 'market://details?id=com.estiveaqui.app';
				else
					url = 'itms-apps://itunes.apple.com/app/id1169693954';
				
				$cordovaInAppBrowser.open(url, '_system').then(function(event) {
				//$cordovaInAppBrowser.open('https://play.google.com/store/apps/details?id=com.dopaminamob.palavrasdosenhor').then(function(event) {
			        // success
			        console.log(event);
				})
				.catch(function(event) {
					// error
			        console.log(event);
				});
			});
		}
	};
})
