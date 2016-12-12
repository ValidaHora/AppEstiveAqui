angular.module('starter.services')

.directive('shareApp', function($cordovaSocialSharing) {
	return {
		link: function($scope, element) {
			element.on('click', function() {
				$message = 'Baixe agora o estive aqui, o sistema de lançamento de horas prático, seguro, e na nuvem.\n\nhttp://www.validahora.com.br';
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
