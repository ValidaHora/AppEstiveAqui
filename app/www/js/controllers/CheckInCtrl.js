angular.module('starter.controllers')
.controller('CheckInCtrl', function($scope, $ionicModal, $ionicSideMenuDelegate){
	$scope.toggleLeft = function(){
		$ionicSideMenuDelegate.toggleLeft();
	};
	
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
	
	
	$scope.isShowMain = true;
	$scope.isSuccess = false;
	$scope.isError = false;
	
	$scope.displaySuccess = function(){
		$scope.isShowMain = false;
		$scope.isSuccess = true;
		$scope.isError = false;
	}
	
	$scope.displayError = function(){
		$scope.isShowMain = false;
		$scope.isSuccess = false;
		$scope.isError = true;
	}
	
	$scope.displayMain = function(){
		$scope.isShowMain = true;
		$scope.isSuccess = false;
		$scope.isError = false;
	}
		
	$scope.validateToken = function(){
		$scope.displaySuccess();
	}
})
