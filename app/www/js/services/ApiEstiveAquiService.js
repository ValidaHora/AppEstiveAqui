angular.module('starter.services')

.factory('ApiEstiveAqui', function($rootScope, ApiRequest, LocalStorage, PassClockManager, EntryManager, User, TimeHelper){
	var register = function(code){
		var KEY_ESTIVE_AQUI = 'estive_aqui';
		var api = call('CadastraAppUsuario', {CODATIVACAO: code});
		return api.request().then(function(response){
			PassClockManager.set(response.PassClocks);
			EntryManager.set(response.Lancamentos);
			User.set(response.Apelido, response.Identificador);
			
			return response;
		});
	};
	
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
	};
});
