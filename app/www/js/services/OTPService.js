angular.module('starter.services').factory('OTP', function($rootScope, $timeout){
	var dec2hex = function(s) {
		return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
	};
	
	var hex2dec = function(s){
		return parseInt(s, 16);
	};
	
	var leftpad = function(str, len, pad) {
		if (len + 1 >= str.length) {
			str = Array(len + 1 - str.length).join(pad) + str;
		}
		return str;
	};
	
	var base32tohex = function(base32){
		var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
		var bits = "";
		var hex = "";

		for (var i = 0; i < base32.length; i++) {
			var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
			bits += leftpad(val.toString(2), 5, '0');
		}

		for (var i = 0; i+4 <= bits.length; i+=4) {
			var chunk = bits.substr(i, 4);
			hex = hex + parseInt(chunk, 2).toString(16) ;
		}
		return hex;
	};
	
	var updateOtp = function(){
		var date = new Date();
		var key = secret;//base32tohex(secret);
		var epoch = Math.round(date.getTime() / 1000.0);
		var time = leftpad(dec2hex(Math.floor(date.getUTCMinutes())), 16, "0");
		//var time = leftpad(dec2hex(Math.floor(epoch / countDownSize)), 16, '0');

		// updated for jsSHA v2.0.0 - http://caligatio.github.io/jsSHA/
		var sha = new jsSHA("SHA-1", "HEX");
		sha.setHMACKey(key, "HEX");
		sha.update(time);
		var hmac = sha.getHMAC("HEX");
		
		//if (hmac == 'KEY MUST BE IN BYTE INCREMENTS') {
		//	console.log('hummm interessante...');
		//} else {
		//	var offset = hex2dec(hmac.substring(hmac.length - 1));
		//}

		var offset = hex2dec(hmac.substring(hmac.length - 1));
		otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec("7fffffff")) + "";
	    otp = (otp).substr(otp.length - 6, 6);
	};
	
	/*var updateOtp = function(){
		var date = new Date();
		var sha = new jsSHA('SHA-1', "HEX");
	    sha.setHMACKey(secret, "HEX");
	    sha.update(leftpad(dec2hex(Math.floor(date.getUTCMinutes())), 16, "0"));
	    var hmac = sha.getHMAC("HEX");

	    var offset = hex2dec(hmac.substring(hmac.length - 1));
	    var codigo = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec("7fffffff")) + "";
	    codigo = (codigo).substr(codigo.length - 6, 6);
	    otp = codigo;
	};*/
	
	var timer = function(){
		var epoch = Math.round(new Date().getTime() / 1000.0);
		var countDown = countDownSize - (epoch % countDownSize);
		//var remaining = epoch % countDownSize;
		var remaining = epoch % countDownSize;
		
		if(remaining == 0){
			updateOtp();
		}
		$rootScope.$broadcast('OTP:tick', getOtpCode(), remaining);
		
		//console.log('timer called: '+countDown);
	};
	
	var getOtpCode = function(){
		return otp;
	};
	
	var isEquals = function(code){
		return getOtpCode()==code;
	};
	
	var start = function(code){
		updateOtp();
		otpInterval = setInterval(timer, 1000);
		console.log('otp started');
	};
	
	var stop = function(code){
		if(otpInterval){
			clearInterval(otpInterval);
		}
	};
	
	var secret = 'BBC123ABC123ABC3ABC123ABC123ABC3ABC123ABC123ABC3ABC123ABC123ABC3';
	var otp = null;
	var otpInterval = null;
	var countDownSize = 60;
	
	start();
	return {
		getOtpCode: getOtpCode,
		isEquals: isEquals,
		start: start,
	}
})
