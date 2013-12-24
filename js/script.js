var polygons = [];
var tooltip = $('#esi-vis .tooltip');
var rawData = [];
/* This array describes the data fetched from Fusion Tables */
var data_desc = {
  'total': {
    'buckets': {
      0: {'min':0,'max':1,'color':'#78b928','opacity':0.5},
      1: {'min':2,'max':10 ,'color':'#7b7c7e','opacity':0.5},
      2: {'min':11,'max':14,'color':'#00b4c8','opacity':0.5},
      3: {'min':15,'max':19,'color':'#007882','opacity':0.5},
      4: {'min':20,'max':999,'color':'#007882','opacity':0.5}
    }
  },
  '1': {
    'name': 'Uusimaa',
    'medals': 15
  },
  '2': {
    'name': 'Varsinais-Suomi',
    'medals': 3
  },
  '4': {
    'name': 'Satakunta',
    'medals': 7
  },
  '5': {
    'name': 'Kanta-Häme',
    'medals': 2
  },
  '6': {
    'name': 'Pirkanmaa',
    'medals': 5
  },
  '7': {
    'name': 'Päijät-Häme',
    'medals': 3
  },
  '8': {
    'name': 'Kymenlaakso',
    'medals': 1
  },
  '9': {
    'name': 'Etelä-Karjala',
    'medals': 1
  },
  '10': {
    'name': 'Etelä-Savo',
    'medals': 1
  },
  '11': {
    'name': 'Pohjois-Savo',
    'medals': 1
  },
  '12': {
    'name': 'Pohjois-Karjala',
    'medals': 1
  },
  '13': {
    'name': 'Keski-Suomi',
    'medals': 11
  },
  '14': {
    'name': 'Etelä-Pohjanmaa',
    'medals': 1
  },
  '15': {
    'name': 'Pohjanmaa',
    'medals': 1
  },
  '16': {
    'name': 'Keski-Pohjanmaa',
    'medals': 1
  },
  '17': {
    'name': 'Pohjois-Pohjanmaa',
    'medals': 15
  },
  '18': {
    'name': 'Kainuu',
    'medals': 1
  },
  '19': {
    'name': 'Lappi',
    'medals': 1
  },
  '21': {
    'name': 'Ahvenanmaan maakunta',
    'medals': 20
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

      google.maps.event.addListener(polygon, 'mouseover', function(e) {
        this.setOptions({
          strokeOpacity: 1,
          strokeWeight: 3
        });
        tooltip.html('<strong>' + this.data[3] + ", mitalit: " + data_desc[this.data[2]].medals + '</strong>');
        tooltip.show();
      });

      google.maps.event.addListener(polygon, 'mouseout', function() {
        this.setOptions({
          strokeOpacity: 0.7,
          strokeWeight: 1
        });
        tooltip.hide();
      });
      
      google.maps.event.addListener(polygon, 'mousemove', function(e,e2) {
        
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