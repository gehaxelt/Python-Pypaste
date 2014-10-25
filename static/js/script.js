$(document).ready(function() {
  var btnreset = $("#btnreset");
  var btnsend = $("#btnsend");
  var txtcode = $("#txtcode");

  btnreset.on('click', function() {
    txtcode.val("");
  });
  
});