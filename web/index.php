<?php
$code = null;
$appUrl = null;
//aqui é so um exmplo, o formato e nome dos parametros voce pode fazer como achar melhor

//pega o codigo que veio na url com a parametro 'code'
if( isset($_GET['code']) ){
	$code = $_GET['code'];
	//valida se o codigo existe de verdade no banco
	
	$appUrl = "validahora://?code=$code";
}
?>
<htm>
<head>
<meta charset="utf-8">
<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">

</head>
<body>

<?php if($code): ?>
	<a href="<?php echo $appUrl ?>" id="bt-validahora">
		<h2>Ativar Código</h2>
	</a>
	
	<br><br>
	<a href="https://play.google.com/store/apps/details?id=com.whatsapp" id="bt-playstore"><img src="img/google-play-badge.png" alt="Baixar para Android" width="135" /></a>
	
	<br><br>
	
	
	<a href="https://itunes.apple.com/br/app/whatsapp-messenger/id310633997?mt=8" id="bt-appstore"><img src="img/app-store-badge.png" alt="Baixar para IOS" width="135" /></a>
<?php else: ?>
	<!-- Codigo nao foi informado ou não passou na validacao, pode separar as mensagens tambem, aqui é so para simplificar -->
	<p>O codigo não foi informado ou não existe.</p>
<?php endif; ?>

<script type="text/javascript">
	//a partir daqui é só para detectar o navegador e exibir o botao de acordo para baixar o app
	document.addEventListener('DOMContentLoaded', function(){
		//aqui é um redirect para o url_scheme do app, tem que ser via JS, se não nao funciona
		var btValidaHora = document.getElementById('bt-validahora');
		var btPlayStore = document.getElementById('bt-playstore');
		var btAppStore = document.getElementById('bt-appstore');
		
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      	var isWindows = /windows phone/i.test(userAgent);
	    var isDroid = /android/i.test(userAgent);
	    var isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
	    
		var isMobile = isWindows || isDroid || isIOS;
		
		/*if(url){
			//window.location = url;
			//window.open(url);
			
			var fakeMouseEvent = document.createEvent('MouseEvents');
			fakeMouseEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 20, 10, false, false, false, false, 0, null);
			btValidaHora.dispatchEvent(fakeMouseEvent);
		}*/
		
		
	    
		if(isMobile){
			btPlayStore.href = 'market://details?id=com.whatsapp';			
			btAppStore.href = 'itms-apps://itunes.apple.com/app/whatsapp-messenger/id310633997';
			
			if(isDroid){
				btAppStore.style.display = 'none';
			}else if(isIOS){
				btPlayStore.style.display = 'none';
			}
		}else{
			btValidaHora.style.display = 'none';
		}
	}, false);
	
	
</script>
</body>
</html
