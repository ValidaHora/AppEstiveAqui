angular.module('starter.services')

.factory('ApiValidaHora', function($rootScope, ApiRequest, TimeHelper, User, EntryManager){
	
	var calcHour = function(tokenID, code, hdg, position, isSilent){
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
		});
	};
	
	var calcHourBatch = function(){
		var batch = [];
		var syncs = EntryManager.getSync();
		var sync, item;
		for(var i in syncs){
			sync = syncs[i];
			
			item = {
				IL: sync._id,
				TK: sync.token.clock,
				CD: sync.token.code,
				HD: sync.typedTime,
				LA: sync.position.coords.latitude,
				LO: sync.position.coords.longitude,
			};
			
			batch.push(item);
		}
		
		console.log('CALCULA_HORAS', batch);
		var api = call('CalculaHoras', {
			CLI: 'EstiveAqui',
			SEN: 'Teste',
			HEN: TimeHelper.calcDate(),
			IDDISPOSITIVO: 'Teste',
			//AP: User.getNickname(),
			LANCS: JSON.stringify(batch),
		});
		return api;
	};
	
	var getSeeds = function(clocks, silent){
		var seeds = [];
		if( typeof silent=='undefined')
			silent= true;
		
		for(var i in clocks){
			seeds.push(clocks[i].NumeroPassClock);
		}
		//seeds.push(clocks[96].NumeroPassClock);
		var data = {TOKS: seeds};
		return call('GetSementes', data).setSilent(silent);
	};
	
    var call = function(endpoint, params){
		var api = new ApiRequest();
		api.isAutoError(true);
		api.debug(true);
		api.endpoint($rootScope.VH_BASE_URL+endpoint);
		api.addParam('V', '1.0.0');
		api.addParam('TZ', TimeHelper.timezone);
		api.addParam('CLI', 'EstiveAqui');
		api.addParam('SEN', 'Teste');
		
		for( var key in params){
			api.addParam(key, params[key]);
		}
		return api;
	};
	
    return {
    	calcHour: calcHour,
    	calcHourBatch: calcHourBatch,
    	getSeeds: getSeeds,
    };
});
