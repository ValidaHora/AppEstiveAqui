//============================================================================
//
//
//    TOTP - Implementa a geração de código usando o algoritmo TOTP.
//
//
//============================================================================


function dec2hex(s)
{
  return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
}

function hex2dec(s)
{
  return parseInt(s, 16);
}

function leftPad(s, l, p)
{
  if (l + 1 >= s.length)
  {
    s = Array(l + 1 - s.length).join(p) + s;
  }
  return s;
}

/**
 * Retorna o código do TOTP a partir da sua semenete e minutos.
 * 
 * @param semente
 * @param minutos
 * @returns {String}
 */
function getCodigo(semente, minutos)
{
  try
  {
    var sha = new jsSHA('SHA-1', "HEX");
    sha.setHMACKey(semente, "HEX");
    sha.update(leftPad(dec2hex(Math.floor(minutos)), 16, "0"));
    var hmac = sha.getHMAC("HEX");

    var offset = hex2dec(hmac.substring(hmac.length - 1));
    var codigo = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec("7fffffff")) + "";
    codigo = (codigo).substr(codigo.length - 6, 6);
  }
  catch (error)
  {
    throw error;
  }
  return codigo;
}

