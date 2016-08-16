angular.module('starter.services')

.factory('ApiValidaHora', function($rootScope, ApiRequest, TimeHelper, User){
	
	var calcHour = function(tokenID, code, hdg, position){
		/*
		HDG – Hora digitada, momento da digitação da hora
		HEN – Hora enviada, momento do envio da hora
		Formato: AAAAMMDDHHmmSS
		*/
		return call('CalculaHora', {
			CLI: 'EstiveAqui',
			SEN: 'Teste',
			AP: User.getNickname(),
			TOK: tokenID,
			COD: code,
			HDG: hdg,
			HEN: TimeHelper.calcDate(),
			LATITUDE: position.coords.latitude,
			LONGITUDE: position.coords.longitude,
		}).request();
	}
	
    var call = function(endpoint, params){
		var api = new ApiRequest();
		api.isAutoError(true);
		api.debug(true);
		api.endpoint($rootScope.VH_BASE_URL+endpoint);
		api.addParam('V', '1.0.0');
		api.addParam('TZ', TimeHelper.timezone);
		for( var key in params){
			api.addParam(key, params[key]);
		}
		return api;
	};
	
    return {
    	calcHour: calcHour,
    };
});
