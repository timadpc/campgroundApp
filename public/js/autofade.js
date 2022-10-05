window.setTimeout(function () {
  $("#info,#success").remove();
}, 1990);


window.setTimeout(function () {
  $("#error").fadeTo(400, 0).slideUp(300, function () {
    $(this).remove();
  });

}, 6000);