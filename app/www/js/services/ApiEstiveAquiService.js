angular.module('starter.services')

.factory('ApiEstiveAqui', function($rootScope, ApiRequest, LocalStorage, PassClockManager, EntryManager, ApiValidaHora, User, TimeHelper){
	var register = function(code){
		return call('CadastraAppUsuario', {CODATIVACAO: code}).request().then(function(response){
			//var id = response.IdentificadorAppUsuario;
			var id = (response.Identificador) ? response.Identificador : response.IdentificadorAppUsuario;
			var nick = response.Apelido;
			/*
			RESPONSE
			Apelido: "UsrNibles93",
			ID: "Cadastra AppUsuario",
			IdentificadorAppUsuario: "gEik3xwJb63Vrnfcj7t4xDsCowcwJIAoCebCxm2ZnR5tL4DvYI",
			Mensagens: [],
			ValidadoOk: true,
			*/
			if( id && nick ){
				User.set(id, nick, code);
				
				return fetchUserData();
			}else{
				$rootScope.simpleAlert('Erro', 'Não foi possivel encontrar o Identificador');
			}
		});
	};
	
	var fetchUserData = function(){
		return call('LeAppUsuario', {IDAPP: User.getId()}).enableForever().disableConnectionCheck().disableAutoError().request().then(
			function(response){
				/*
				RESPONSE
				Apelido: "Apple02",
				ID: "Le Infos",
				IdentificadorAppUsuario: "YkhDkhvl9lhOLTgt5WZTnaYcCTiD8i6uLKnbF4ghkGg8Ux0o0I",
				Lancamentos: [],
				Mensagens: [],
				PassClocks: [{Status: "0", NumeroPassClock: "Apple-01", Apelido: "Escritorio"},…],
				ValidadoOk: true,
				XL: 200,
				*/
				PassClockManager.set(response.PassClocks);
				EntryManager.set(response.Lancamentos.reverse());
				
				return response;
			},
			function(error){
				for( var i in error.Mensagens ){
					if( error.Mensagens[i].Codigo==101 ){
						User.clear();
					}
				}
			}
		);
	};
	
	var launchHour = function(tokenID, code, horaDigitada, horaLancada, hashCode, position, note){
		if(!note)
			note = null;
		
		var data = {
			IDAPP: User.getId(),
			IDDISPOSITIVO: 'Teste',			
			NUMPASSCLOCK: tokenID,
			HRDG: horaDigitada,
			HREN: TimeHelper.calcDate(),
			HRLN: horaLancada,
			HC: hashCode,
			CD: code,
			LATITUDE: position.coords.latitude,
			LONGITUDE: position.coords.longitude,
			NOTA: note,
		};
		
		return call('AppUsuario/LancaHora', data);
	};
	
	var launchHourBatch = function(launches){
		var batch = [];
		var sendTime = TimeHelper.calcDate();
		var syncs = EntryManager.getSync();
		var toCalc, item, sync;
		for(var i in launches){
			item = launches[i];
			
			if(item && (item.OK==true  || item.Erro.CE==102)){
				sync = EntryManager.findSyncById(item.IL);
				
				if(sync){
					
					toCalc = {
						IL: sync._id,
						PC: sync.token.clock,
						CD: sync.token.code,
						HL: sync.launchedTime,
						NT: sync.note ? sync.note : "empty",
						HC: sync.hashCode,
						HD: sync.typedTime,
						LA: sync.position.coords.latitude,
						LO: sync.position.coords.longitude,
					};
					
					batch.push(toCalc);
				}
			}else{
				console.log('Sync ID['+item.IL+'] not found');
			}
		}
		
		console.log('LANCA_HORAS', batch);
		var data = {
			IDAPP: User.getId(),
			IDDISPOSITIVO: 'Teste',			
			HREN: sendTime,
			LANCS: JSON.stringify(batch),
		};
		
		return call('AppUsuario/LancaHoras', data);
	};
	
	var call = function(endpoint, params){
		api = new ApiRequest();
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
	
	var api;
	return {
		register: register,
		fetchUserData: fetchUserData,
		launchHour: launchHour,
		launchHourBatch: launchHourBatch,
	};
});
