$(document).ready(function() {
  var btnreset = $("#btnreset");
  var btnsend = $("#btnsend");
  var txtcode = $("#txtcode");
  var statusmessagediv = $("#statusmessage");
  var statusdiv = $("#status");

  btnreset.on('click', function() {
    txtcode.val("");
    btnsend.prop( "disabled", false );
    statusdiv.css("display","none");
  });

  btnsend.on('click', function() {
    var plaintext = txtcode.val();

    if(plaintext == "") {
      showStatus('No code to paste :(','danger');
      return ;
    }

    // generate a random key and IV for AES-256
    var key = forge.random.getBytesSync(32);
    var iv = forge.random.getBytesSync(32);

    //Encrypt data with AES-256-CBC
    encrypted = AESEncrypt(plaintext, key, iv);

    if(encrypted == null) {
      showStatus('An error occurred during encryption', 'danger');
      return ;
    }

    btnsend.prop( "disabled", true );
    //Send data to server
    $.ajax({
      type: "POST",
      url: "/api/createpaste",
      data: { 
        data: encrypted
      }
    })
      .done(function( msg ) {

        if(msg.error != null) {
          showStatus(msg.error, 'danger');
          return ;
        }

        if(typeof msg.hash === undefined ) {
          showStatus('Failed to get paste hash', 'danger');
          return ;
        }

        var protocol = location.protocol
        var host = location.host
        var path = location.pathname

        var b64data = forge.util.encode64(key + "||" + iv + "||" + msg.hash)
        var url = protocol + host + path + "#" + b64data


        statusmessagediv.html("Paste saved! <input class='form-control' type='text' id='pasteurl' value='"+url+"'>");
        statusmessagediv.addClass("alert-success");
        statusdiv.fadeIn().css("display","block").delay(10000).fadeOut("fast", function() {
          statusmessagediv.toggleClass("alert-"+type);
        });

        $("#pasteurl").select();
        btnsend.prop( "disabled", false );
    })
      .fail(function( msg ) {
        showStatus('Unable to save the paste :(', 'danger');
        return ;
    });
  });

});

/**
  * Encrypts data with AES-CBC. Strength depends on the key, iv size.
  * @param: plaintext - Text to encrypt
  * @param: key - key in byteform
  * @param: iv - key in byteform
**/
function AESEncrypt(plaintext, key, iv) {
  try {
    var cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(plaintext));
    cipher.finish();
    return cipher.output.toHex();
  } catch(e) {
    return null;
  }
}

/**
  * Decrypts data with AES-CBC.
  * @param: encrypted - Text to decrypt
  * @param: key - key in byteform
  * @param: iv - key in byteform
**/
function AESDecrypt(encrypted, key, iv) {
  try {
    var decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encrypted)));
    decipher.finish();
    return decipher.output.toString();
  } catch(e) {
    return null;
  }
}

/**
  * Displays a message in the #statusmessage div and fadesIn/fadesOut the #status div.
  * @param: text - Text to display
  * @param: type - Boostrap css alert-[type] style
  * @param: duration - How long the message is displayed
**/
function showStatus(text,type) {
  var duration = duration || 2500;
  var statusmessagediv = $("#statusmessage");
  var statusdiv = $("#status");
  statusmessagediv.text(text);
  statusmessagediv.addClass("alert-"+type);
  statusdiv.fadeIn().css("display","block").delay(duration).fadeOut("fast", function() {
    statusmessagediv.toggleClass("alert-"+type);
  });
}