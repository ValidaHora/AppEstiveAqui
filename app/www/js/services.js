angular.module('starter.services')

.directive('shareApp', function($cordovaSocialSharing) {
	return {
		link: function($scope, element) {
			element.on('click', function() {
				$message = 'Compartilhar App';
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
					url = 'market://details?id=no.app.yet';
				else
					url = 'itms-apps://itunes.apple.com/app/id-no-app-yet';
				
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
