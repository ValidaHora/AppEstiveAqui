angular.module('starter.services')

.factory('ApiEstiveAqui', function($rootScope, ApiRequest, LocalStorage, PassClockManager, EntryManager, ApiValidaHora, User, TimeHelper){
	var register = function(code){
		return call('CadastraAppUsuario', {CODATIVACAO: code}).request().then(function(response){
			var id = response.IdentificadorAppUsuario;
			var nick = response.Apelido;
			if( id && nick ){
				User.set(id, nick);
				
				return fetchUserData();
			}else{
				$rootScope.simpleAlert('Erro', 'Não foi possivel encontrar o Identificador');
			}
		});
	};
	
	var fetchUserData = function(){
		return call('LeAppUsuario', {IDAPP: User.getId()}).request().then(function(response){
			PassClockManager.set(response.PassClocks);
			EntryManager.set(response.Lancamentos);
			
			return response;
		});
	};
	
	var launchHour = function(tokenID, code, horaDigitada, horaLancada, hashCode){
		var data = {
			IDAPP: User.getId(),
			IDDISPOSITIVO: 'Teste',			
			NUMPASSCLOCK: tokenID,
			HRDG: horaDigitada,
			HREN: TimeHelper.calcDate(),
			HRLN: horaLancada+(horaLancada.length<14?'00':''),
			HC: hashCode,
			CD: code,
			LAT: 89,
			LON: 10,			
		};
		
		return call('LancaHora', data).request().then(function(response){
			
			
			return response;
		});
	};
	
	var registerToken = function(tokenID, code, horaDigitada){
		return ApiValidaHora.calcHour(tokenID, code, horaDigitada).then(function(response){
			return launchHour(tokenID, code, horaDigitada, response.HoraLancada, response.HashCode);					
		});
	}
	
	var call = function(endpoint, params){
		var api = new ApiRequest();
		api.isAutoError(true);
		api.debug(true);
		api.endpoint($rootScope.EA_BASE_URL+endpoint);
		api.addParam('V', '1.0.0');
		api.addParam('TZ', TimeHelper.timezone);
		for( var key in params){
			api.addParam(key, params[key]);
		}
		return api;
	};
	
	return {
		register: register,
		fetchUserData: fetchUserData,
		registerToken: registerToken,
	};
});
