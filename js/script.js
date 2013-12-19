var yleApp = {
  formatNr: function (x) {
    x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    x = x.replace('.', ',');
    return (x == '') ? 0 : x;
  },
  roundNr: function (x, d) {
    return parseFloat(x.toFixed(d));
  },
  getScale: function () {
    var width = $('#esi-vis').width();
    if (width >= 580) {
      $('#esi-vis').addClass('wide');
      return true;
    }
    if (width < 580) {
      $('#esi-vis').removeClass('wide');
      return false;
    }
  },
  hello: function() {
      alert("Hello YleApp!");
  },
  init: function () {
    yleApp.getScale();
    $(window).resize(function () {
      yleApp.getScale();
    });
    yleApp.hello();
  }
}

$(document).ready(function() {
  yleApp.init();
});