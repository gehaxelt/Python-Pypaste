$(document).ready(function() {
  var btnreset = $("#btnreset");
  var btnsend = $("#btnsend");
  var txtcode = $("#txtcode");

  btnreset.on('click', function() {
    txtcode.val("");
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

    //Send data to server
    $.ajax({
      type: "POST",
      url: "/api/createpaste",
      data: { 
        data: encrypted
      }
    })
      .done(function( msg ) {
        try {
          var data = JSON.parse(msg);
        } catch(e) {
          showStatus('Unable to parse response :(', 'danger');
          return;
        }

        showStatus('Paste saved! ID is + ' + msg.hash, 'success');
        //TODO: Build URL with key + iv
        key = forge.util.encode64(key);
        iv = forge.util.encode64(iv);

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
  statusdiv.fadeIn().css("display","block").delay(duration).fadeOut();
}