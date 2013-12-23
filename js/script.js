var polygons = [];
var tooltip = $('#esi-vis .tooltip');
var rawData = [];
/* This array describes the data fetched from Fusion Tables */
var data_desc = {
  'total': {
    'buckets': {
      0: {'min':0,'max':350000000,'color':'#78b928','opacity':0.5},
      1: {'min':350000000,'max':400000000 ,'color':'#7b7c7e','opacity':0.5},
      2: {'min':400000000,'max':700000000,'color':'#00b4c8','opacity':0.5},
      3: {'min':700000000,'max':800000000,'color':'#007882','opacity':0.5}
    }
  },
  'east': {
    'name': 'Itä-Suomi',
    'desc': '<strong>Alueeseen kuuluvat maakunnat:</strong><br />Etelä-Savo, Kainuu, Pohjois-Karjala, Pohjois-Savo'
  },
  'west': {
    'name': 'Länsi-Suomi',
    'desc': '<strong>Alueeseen kuuluvat maakunnat:</strong><br />Pohjanmaa, Etelä-Pohjanmaa, Satakunta, Pirkanmaa, Keski-Suomi'
  },
  'north': {
    'name': 'Pohjois-Suomi',
    'desc': '<strong>Alueeseen kuuluvat maakunnat:</strong><br />Pohjois-Pohjanmaa, Lappi, Keski-Pohjanmaa'
  },
  'south': {
    'name': 'Etelä-Suomi',
    'desc': '<strong>Alueeseen kuuluvat maakunnat:</strong><br />Etelä-Karjala, Kanta-Häme, Kymenlaakso, Päijät-Häme, Uusimaa, Varsinais-Suomi'
  }
}

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
    yleApp.initMap();
    //for (var i in rawData) {
      //console.log(rawData[i]["kilpailu"]);
    //}
  },
  initMap: function() {
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
    url.push('sql=');
    url.push(encodeURIComponent('SELECT * FROM ' + '12LyXGm-SXYdNuLbL-ncWbyq3JGsohOok49g14XA')); // Google FusionTable key.
    url.push('&callback=yleApp.drawNewMap');
    url.push('&key=AIzaSyBABXn6XMMXCIlQfP-6qBwoRPxjJynZZ7A'); // Google Api Key.
    script.src = url.join('');

    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);

    if (!$('html').hasClass('ie6') || !$('html').hasClass('ie7') || !$('html').hasClass('ie8')) {
      var styles = [
        {
          "featureType": "water",
          "stylers": [
            { "visibility": "on" },
            { "color": "#ffffff" }
          ]
        },{
          "featureType": "land",
          "stylers": [
            { "visibility": "on" },
            { "color": "#ffffff" }
          ]
        }
      ];
      var styledMap = new google.maps.StyledMapType(styles, {name: 'Styled Map'});
      map.mapTypes.set('map-style', styledMap);
      map.setMapTypeId('map-style');
    }

  },
  drawNewMap: function(data) {
    console.log(data);
    map_data = data;
    var rows = data['rows'];
    for (var i in rows) {
      var newCoordinates = [];
      newCoordinates = yleApp.constructNewCoordinates(rows[i][9]['geometry']);

      var polygon = new google.maps.Polygon({
        paths: newCoordinates,
        fillColor: yleApp.getFillColor(rows[i]),
        fillOpacity: 1,
        strokeColor: '#eeeeee',
        strokeOpacity: 0.7,
        strokeWeight: 1
      });
      polygon.data = rows[i];
      polygons.push(polygon);

      tooltip.fixPos = function() {
        var event = window.event;
        if (event == null) {
          event = $(window).data('event');
        }
        if (!event) {
          return;
        }
        var bodyWidth = $('body').width();
        var boxWidth = this.outerWidth();
        if (boxWidth + this.position().left > $(window).width() + $(window).scrollLeft()) {
          self.invertX = true;
        }
        if (self.invertX && this.position().left - $(window).scrollLeft() < 0) {
          self.invertX = false;
        }
        var left = 0;
        var top = event.clientY - 25 + $(window).scrollTop();
        if (self.invertX) {
          left = event.clientX - 20 - boxWidth + $(window).scrollLeft();
        }
        else {
          left = event.clientX + 20 + $(window).scrollLeft();
        }
        if (this.outerHeight() + top > $(window).scrollTop() + $(window).height()) {
          top = $(window).height() - this.outerHeight() + $(window).scrollTop();
        }
        this.offset({left: left, top:top});
      };

      google.maps.event.addListener(polygon, 'mouseover', function(e) {
        this.setOptions({
          strokeOpacity: 1,
          strokeWeight: 3
        });
        /*tooltip.html('<strong>' + data_desc[this.data[0]].name + '</strong><br />Valitsemalla näet<br />alueen hankkeita');
        tooltip.show();
        tooltip.fixPos();*/
      });

      google.maps.event.addListener(polygon, 'mouseout', function() {
        this.setOptions({
          strokeOpacity: 0.7,
          strokeWeight: 1
        });
        //tooltip.hide();
      });
      
      google.maps.event.addListener(polygon, 'mousemove', function(e,e2) {
        //tooltip.fixPos();
      }); 

      polygon.setMap(map);

      google.maps.event.addListener(polygon, 'click', function(e) {
        //$('#esi-vis .area_title').text(data_desc[this.data[0]].name);
        //$('#esi-vis .area_desc').html(data_desc[this.data[0]].desc);
      });
    }
  },
   constructNewCoordinates: function(polygon) {
    var newCoordinates = [];
    var coordinates = polygon['coordinates'][0];
    for (var i in coordinates) {
      newCoordinates.push(new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
    }
    return newCoordinates;
  },
  getFillColor: function(row) {
    var color = '#ff0000';
    var selected_type = ($('#esi-vis input[name=type_selector]:checked').val());
    $.each(data_desc['total'].buckets, function(i, bucket) {
      if (row[1] >= bucket.min && row[1] < bucket.max) {
        color = bucket.color;
      }
    });
    return color;
  }
}

$(document).ready(function() {
  yleApp.getScale();
  $(window).resize(function () {
    yleApp.getScale();
  });
  $.getJSON("case-2013/Olympiamitalistit/data/yksilourheilijat.json", function(data){
      rawData = data;
      yleApp.init();
      /*for (var i in data) {
        console.log(data[i]["urheilijat"]);
      }*/
    });
});