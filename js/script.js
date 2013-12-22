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
  init: function() {
    var myOptions = {
      zoom: 5,
      panControl: false,
      zoomControl: false,
      scrollwheel: false,
      mapTypeControl: false,
      scaleControl: false,
      draggable: false,
      streetViewControl: false,
      overviewMapControl: false,
      center: new google.maps.LatLng(65.5, 24),
      mapTypeId: google.maps.MapTypeId.ROAD
    };
    map = new google.maps.Map($('#esi-vis .map')[0], myOptions);

    // Initialize JSONP request
    var script = document.createElement('script');
    var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
    var table_id = '1kvJN1yuQscrwW-cXECRzIOCRuBHGL3kSVeD2DV0';
    var encodedQuery = encodeURIComponent('SELECT * FROM ' + table_id);
    url.push('sql=');
    url.push(encodedQuery);
    url.push('&callback=methods.drawMap');
    url.push('&key=AIzaSyBABXn6XMMXCIlQfP-6qBwoRPxjJynZZ7A'); // Google Api Key.
    script.src = url.join('');

    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);
    if ($('html').hasClass('ie6') || $('html').hasClass('ie7') || $('html').hasClass('ie8')) {
      var styles = [];
    }
    else {
      var styles = [
        {
          "featureType": "water",
          "stylers": [
            { "visibility": "on" },
            { "color": "#159ac8" }
          ]
        },{
          "featureType": "landscape",
          "stylers": [
            { "visibility": "on" },
            { "color": "#ffffff" }
          ]
        },{
          "featureType": "poi",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "featureType": "road.highway",
          "stylers": [
            { "color": "#808080" },
            { "visibility": "on" },
            { "lightness": 55 }
          ]
        },{
          "featureType": "road",
          "elementType": "labels",
          "stylers": [
            { "visibility": "off" }
          ]
        }
      ];
      var styledMap = new google.maps.StyledMapType(styles, {name: 'Styled Map'});
      map.mapTypes.set('map-style', styledMap);
      map.setMapTypeId('map-style');
    }
  }
}

$(document).ready(function() {
  yleApp.getScale();
  $(window).resize(function () {
    yleApp.getScale();
  });
  yleApp.init();
});