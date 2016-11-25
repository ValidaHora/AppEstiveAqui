angular.module('starter.services')

.factory('ApiRequest', function($rootScope, $http, $q, $ionicLoading, $ionicPopup, $cordovaFile, NetworkState, $cordovaFileTransfer){
	var ApiRequest = function(){
		var METHOD_GET = 'GET';
		var METHOD_POST = 'POST';
		
		var self = this;
		var baseUrl = $rootScope.BASE_HOST_API;
		var action = '';
		var method = METHOD_GET;
		var silent = false;
		var serverResponse = null;
		var fatalError = false;
		var debugmode = false;
		var production = false;
		var displayError = true;
		var connectionCheck = true;
		
		var forever = false;
		var isForceFail = false;
		
		var deferred = $q.defer();
		var params = {};
		var targetFile = null;
		
		this.getErrors = function(){
			var errors = [];
			var curErrors;
			if(serverResponse.ValidadoOk==false && serverResponse.Mensagens){
				var msg;
				var err
				for( var i in serverResponse.Mensagens ){
					msg = serverResponse.Mensagens[i];
					
					if(msg.Descricao){
						errors.push(msg.Descricao);
					}else if(msg.Mensagem){
						//LancaHora, CadastraAppUsuario
						errors.push(msg.Mensagem);
					}else{
						errors.push('Impossivel determinar a descrição do erro');
					}
				}
			}
			
			return errors;
		};
		
		this.getResponse = function(){
			return serverResponse;
		};
		
		this.isFatalError = function(){
			return fatalError;
		};
		
		var errors = function(){
			return self.getErrors();
		};
		
		var addParam = function(key, value){
			if( value && typeof value!='undefined' ){
				var isArray = value ? (value.constructor == Array) : false;
				var paramvalue, paramname;
				if( !isArray ){
					params[key] = value;
				}else{
					for( var i in value ){
						paramvalue = value[i];
						paramname = key+'['+i+']';
						params[paramname] = paramvalue;
					}
					//params[key] = value;
				}
			}
			
			return this;
		};
		
		var setParams = function(object){
			params = object;
			return this;
		};
		
		var setFile = function(key, filePath){
			if( filePath )
				targetFile = {key: key, path:filePath};
			return this;
		};
		
		var getAllParams = function(){
			return params;
		};
				
		var setGetMethod = function(){
			method = METHOD_GET;
			return this;
		};
		
		var isGet = function(){
			return method == METHOD_GET;
			return this;
		};
		
		var setPostMethod = function(){
			method = METHOD_POST;
			return this;
		};
		
		var isPost = function(){
			return method == METHOD_POST;
		};
		
		var setAction = function(ac){
			action = ac;
			return this;
		};
		
		var setSilent = function(sl){
			silent = sl;
			return this;
		};
		
		var enableDebug = function(){
			debugmode = true;
			return this;
		};
		
		var isSilent = function(){
			return silent;
		};
		
		var enableAutoError = function() {
			displayError = true;
			return this;
		};
		
		var disableAutoError = function() {
			displayError = false;
			return this;
		};
		
		var isAutoError = function() {
			return displayError;
		};
		
		var isDebug = function(){
			return debugmode && !production;
		};
		
		var disableConnectionCheck = function(){
			connectionCheck = false;
			return this;
		};
		
		var enableConnectionCheck = function(){
			connectionCheck = true;
			return this;
		};
		
		var enableForever = function(){
			forever = true;
			return this;
		};
		
		var forceFail = function(){
			isForceFail = true;
			return this;
		};
		
		var needConnecttionCheck = function(){
			return connectionCheck;
		};
		
		var isConnected = function(){
			return NetworkState.isOnline();
		};
		
		var reset = function(){
			params = [];
			method = METHOD_GET;
			silent = false;
			action = '';
		};
		
		var caller = function(func, params){
			if( typeof func == 'function' ){
				func.apply(this, params);
			}
		};
		
		var transformRequest = function(obj) {
			var qs = [];
			for(var key in obj){
				if( typeof obj[key] != 'undefined' ){
					pname = key;
					if(isGet()){
						pname = key.replace(/\[\d*\]/, '');
					}
					//qs.push(encodeURIComponent(pname)+"="+encodeURIComponent(obj[key]));
					qs.push(encodeURIComponent(pname)+"="+obj[key]);
				}
			}
			
			return qs.join("&");
		}
		
		var transformResponse = function(resp){
			try {
				if( typeof resp=="string"){
					var response = JSON.parse(resp);
					return response;
				}else{
					return resp;
				}
			}
			catch(exception) {
				console.log('JSON.parse() error: '+exception);
				hideLoader();
				if(displayError)
					displayFatalError(resp);
				
				return false;
			}
		}
		
		var displayLoader = function(){
			$ionicLoading.show();
		};
		
		var hideLoader = function(){
			$ionicLoading.hide();
		};
		
		var getRequestUrl = function(){
			if(/^http:\/\//.test(action))
				return action;
			else
				return baseUrl+action;
		};
		
		var request = function(){
			var promisse = null;
			if( !targetFile )
				promisse = defaultRequest();
			else
				promisse = fileUploadRequest();
			
			if( promisse ){
				promisse.finally(function(){
					if( !isSilent() )
						hideLoader();
				});
				return promisse;
			}
		}
		
		var defaultRequest = function(){
			var header = {};
			var paramsSend = '';
			var paramsFormated = '';
			var targetUrl = getRequestUrl();
			
			if(needConnecttionCheck() && !isConnected()){
				$ionicPopup.alert({
					title: '<i class="icon ion-ios-information-outline"></i> Sem Conexão',
					template: 'Você não esta conectado a internet, por favor verifique suas configurações',
				});
				return deferred.promise;
			}
			
			if( !isSilent() )
				displayLoader();
			
			paramsFormated = transformRequest(getAllParams());
			if( isPost() ){
				header['Content-Type'] = 'application/x-www-form-urlencoded';
				paramsSend = paramsFormated;
			}else{
				targetUrl += '?'+paramsFormated;
			}
			
			displayDebug(targetUrl);
			$http({
					method: method,
					url: targetUrl,
					headers: header,
					data: paramsSend,
					transformResponse: transformResponse,
					timeout: 45000,
				}).then(successCallback, failCallback);
			
			return deferred.promise;
		};
		
		var fileUploadRequest = function(){			
			setPostMethod();
			var paramsFormated = getAllParams();
			var targetUrl = getRequestUrl();
			var options = {
				fileKey:targetFile.key,
				//fileName: '',
				httpMethod: method,
				mimeType: 'image/jpeg',
				params: paramsFormated,
			};
			if( !isSilent() )
				displayLoader();
			
			displayDebug(targetUrl);
			$cordovaFileTransfer.upload(targetUrl, targetFile.path, options, false).then(successCallback, failCallback);
			
			return deferred.promise;
		}
		
		var successCallback = function(response){
			if(isForceFail)
				response.data = false;
			
			//appendLog(response);
			
			serverResponse = extractResponse(response);
			if(response.data.ValidadoOk){
				deferred.resolve(serverResponse);
			}else{
				failCallback(response);
			}
		};
		
		var failCallback = function(response){
			//appendLog(response);
			
			if( (response.status>=500 || response.status==-1) /*|| (forever==true)*/ ){
				hideLoader();
				
				var message = 'Não houve resposta do servidor.';
				if(displayError){
					$ionicPopup.alert({
						title: '<i class="icon ion-ios-information-outline"></i> Erro',
						template: message,
					});
				}
				
				deferred.reject({message: message, no_server_response: true});
				return false;
			}
			
			if( response.body ){
				response.data = transformResponse(response.body);
			}
			
			serverResponse = extractResponse(response);
			if(response.data.ValidadoOk==false){
				if( displayError ){
					$ionicPopup.alert({
						title: '<i class="icon ion-ios-information-outline"></i> Erro',
						template: self.getErrors().join('<br>'),
					});
				}
			}else if(forever==false){
				//appendLog('FailCallback FOREVER '+(forever));
				displayFatalError(response);
			}
			
			deferred.reject(serverResponse);
		};
		
		var extractResponse = function(resp){
			var response = null;
			if( resp.response ){
				response = transformResponse(resp.response);
			
			}else if(resp.data && (resp.data!=false)){
				response = resp.data;
			}
			
			return response;
		};
		
		var displayFatalError = function(response){
			console.log('Fatal Error!');
			console.log(response);
			fatalError = true;
			alert('Ops! Algo grave aconteceu.');
		};
		
		var displayDebug = function(url){
			if( isDebug() ){
				console.log('['+method+'] '+url);
				console.log('Endpoint: '+action);
				console.log('Parameters');
				console.log(getAllParams());
				
				if(targetFile){
					if( targetFile.path.indexOf('base64')==-1){
						console.log('File path:['+targetFile.key+']'+targetFile.path );
					}else{
						console.log('File path:['+targetFile.key+']'+targetFile.path.substr(0, 50));
					}
				}
			}
		};
		
		
		
		var appendLog = function(entry){
			var log = entry;
			
			try {
				log = JSON.stringify(entry);
			}catch(e){
				log = 'Entry is not an json: '+entry;
			}
			
			$rootScope.logentries.unshift('<br><br><br><br>');
			$rootScope.logentries.unshift(log);
			$rootScope.logentries.unshift(getRequestUrl());
		};
		
		return {			
			addParam: addParam,
			setFile: setFile,
			setParams: setParams,
			setGetMethod: setGetMethod,
			setPostMethod: setPostMethod,
			endpoint: setAction,
			setSilent: setSilent,
			enableAutoError: enableAutoError,
			disableAutoError: disableAutoError,
			enableConnectionCheck: enableConnectionCheck,
			disableConnectionCheck: disableConnectionCheck,
			isAutoError: isAutoError,
			request: request,
			debug: enableDebug,
			errors: errors,
			
			displayLoader: displayLoader,
			hideLoader: hideLoader,
			
			enableForever: enableForever,
			forceFail: forceFail,
		};
	};
	
	return ApiRequest;
});
