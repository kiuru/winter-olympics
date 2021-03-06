var polygons = [];
var tooltip = $('#esi-vis .tooltip');
var rawData = [];
var individualSportData = [];
var teamSportData = [];
var sport_type = 'individual';
var is_whole_country = true;
/* This array describes the data fetched from Fusion Tables */
var colors = {};
var colors_individual = {
  'total': {
    'buckets': {
      0: {'min':0,'max':3,'color':'#7b7c7e','opacity':0.5},
      1: {'min':4,'max':10 ,'color':'#78b928','opacity':0.5},
      2: {'min':12,'max':16,'color':'#00b4c8','opacity':0.5},
      3: {'min':17,'max':999,'color':'#007882','opacity':0.5}
    }
  }
};
var colors_team = {
  'total': {
    'buckets': {
      0: {'min':0,'max':3,'color':'#7b7c7e','opacity':0.5},
      1: {'min':4,'max':10 ,'color':'#78b928','opacity':0.5},
      2: {'min':11,'max':19,'color':'#00b4c8','opacity':0.5},
      3: {'min':20,'max':999,'color':'#007882','opacity':0.5}
    }
  }
};
var data_desc = {
  '1': {
    'name': 'Uusimaa',
    'medals': 0
  },
  '2': {
    'name': 'Varsinais-Suomi',
    'medals': 0
  },
  '4': {
    'name': 'Satakunta',
    'medals': 0
  },
  '5': {
    'name': 'Kanta-Häme',
    'medals': 0
  },
  '6': {
    'name': 'Pirkanmaa',
    'medals': 0
  },
  '7': {
    'name': 'Päijät-Häme',
    'medals': 0
  },
  '8': {
    'name': 'Kymenlaakso',
    'medals': 0
  },
  '9': {
    'name': 'Etelä-Karjala',
    'medals': 0
  },
  '10': {
    'name': 'Etelä-Savo',
    'medals': 0
  },
  '11': {
    'name': 'Pohjois-Savo',
    'medals': 0
  },
  '12': {
    'name': 'Pohjois-Karjala',
    'medals': 0
  },
  '13': {
    'name': 'Keski-Suomi',
    'medals': 0
  },
  '14': {
    'name': 'Etelä-Pohjanmaa',
    'medals': 0
  },
  '15': {
    'name': 'Pohjanmaa',
    'medals': 0
  },
  '16': {
    'name': 'Keski-Pohjanmaa',
    'medals': 0
  },
  '17': {
    'name': 'Pohjois-Pohjanmaa',
    'medals': 0
  },
  '18': {
    'name': 'Kainuu',
    'medals': 0
  },
  '19': {
    'name': 'Lappi',
    'medals': 0
  },
  '21': {
    'name': 'Ahvenanmaan maakunta',
    'medals': 0
  }
};

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
    // reset medals table
    $.each(data_desc, function(index, value){
      data_desc[index].medals = 0;
    })

    for (var i in rawData) {
      for (var a in data_desc) {
        if (data_desc[a].name == rawData[i].maakunta) {
          data_desc[a].medals++;
        }
      }
    }

    yleApp.initMap();
  },
  initMap: function() {
    var myOptions = {
      zoom: 4,
      panControl: false,
      zoomControl: false,
      disableDoubleClickZoom: true,
      scrollwheel: false,
      mapTypeControl: false,
      scaleControl: false,
      draggable: false,
      streetViewControl: false,
      overviewMapControl: false,
      center: new google.maps.LatLng(65, 25),
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
      yleApp.updateLegend();
    }

  },
  drawNewMap: function(data) {
    yleApp.mapClickAction("Uusimaa"); // default value
    tooltip.html('<strong>Uusimaa</strong>'); // Hard coded as like default value

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
        tooltip.html('<strong>' + this.data[3] + '</strong>');
      });

      google.maps.event.addListener(polygon, 'mouseout', function() {
        this.setOptions({
          trokeOpacity: 0.7,
          strokeWeight: 1
        });
      });
      
      google.maps.event.addListener(polygon, 'mousemove', function(e,e2) {

      }); 

      polygon.setMap(map);

      google.maps.event.addListener(polygon, 'click', function(e) {
        this.setOptions({
          strokeOpacity: 1,
          strokeWeight: 3
        });
        $('#only_provinces').click();
        yleApp.mapClickAction(this.data[3]);
      });
    }

  },
  clickOverGoogleMapListener: function(province) {
    $('#only_provinces').click();
    yleApp.mapClickAction(province);
  },
  mapClickAction: function(click) {
    $('#esi-vis #medals_table tbody').empty();
    $('#esi-vis #province').html(click);
    
    var medals_table = [];
    for (var i in rawData) {

      if (click == rawData[i].maakunta) {

        if (typeof medals_table[rawData[i].kotikunta] !== "undefined" && medals_table[rawData[i].kotikunta] !== null) {
          medals_table[rawData[i].kotikunta].medals += 1;
        } else {
          medals_table[rawData[i].kotikunta] = {};
          medals_table[rawData[i].kotikunta].kotikunta = rawData[i].kotikunta
          medals_table[rawData[i].kotikunta].maakunta = rawData[i].maakunta
          medals_table[rawData[i].kotikunta].medals = 1;
        }

      }

    }
    var tmp_table = [];
    var i = 0;
    for (var value in medals_table) {
      tmp_table[i] = {};
      tmp_table[i].medals = medals_table[value].medals;
      tmp_table[i].kotikunta = medals_table[value].kotikunta;
      tmp_table[i].maakunta = medals_table[value].maakunta;
      i++;
    }

    tmp_table = yleApp.bubbleSort(tmp_table, 'medals');

    var count_medals = 0;
    for (var value in tmp_table) {
      $('#esi-vis #medals_table tbody').append("<tr onclick='yleApp.getCityTable(\""+tmp_table[value].maakunta+"\", \""+tmp_table[value].kotikunta+"\");'><td><a href=\"#\">"+tmp_table[value].kotikunta+"</a></td><td>"+tmp_table[value].medals+"</td></tr>");
      count_medals += tmp_table[value].medals;
    }
    $('#esi-vis #medals_table tbody').append('<tr><td><strong>Yhteensä</strong></td><td><strong>'+count_medals+'</strong></td></tr>');

  },
  bubbleSort: function(a, par) {
    var swapped;
    do {
      swapped = false;
      for (var i = 0; i < a.length - 1; i++) {
        if (a[i][par] < a[i + 1][par]) {
          var temp = a[i];
          a[i] = a[i + 1];
          a[i + 1] = temp;
          swapped = true;
        }
      }
    } while (swapped);
    return a;
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
    var color = '#7b7c7e';
    $.each(colors['total'].buckets, function(i, bucket) {
      if (data_desc[row[2]].medals >= bucket.min && data_desc[row[2]].medals <= bucket.max) {
        color = bucket.color;
      }
    });
    return color;
  },
  updateLegend: function() {
    var legendWrapper = $('#legendWrapper');
    yleApp.legendContent(legendWrapper);
  },
  legendContent: function(legendWrapper) {
    $('#legend').empty();
    var legend = $('#legend');
    legend.id = 'legend';

    $(legend).append('<p>Maakuntien mitalit:</p>');

    $.each(colors['total'].buckets, function(i, bucket) {

      var legendItem = document.createElement('div');

      var color = document.createElement('span');
      color.setAttribute('class', 'color');
      color.style.backgroundColor = bucket.color;
      $(legend).append(color);

      $(legend).append(bucket.min);
      if (bucket.max == 999) {
        $(legend).append(' >');
      } else {
        $(legend).append(' - '+bucket.max+'<br/>');
      }
      
    });

    $(legendWrapper).append(legend);
  },
  getCityTable: function(province, city) {
    $('#esi-vis #basic-view').hide();
    $('#esi-vis #city-view').show();
    $('#esi-vis #city-view tbody').empty();
    $('#esi-vis #city-view #city-header').html(city);

    for (var i in rawData) {
      if (rawData[i].maakunta == province && rawData[i].kotikunta == city) {
        if (rawData[i].kilpailu == "NULL") {
          sport = rawData[i].laji
        } else {
          sport = rawData[i].kilpailu
        }
        $('#esi-vis #city-view tbody').append("<tr><td>"+rawData[i].kisapaikka+" - "+rawData[i].vuosi+"</td><td>"+rawData[i].mitali+"</td><td>"+sport+"</td><td>"+rawData[i].urheilija+"</td></tr>");
      }
    }
  },
  backToBasicView: function() {
    $('#esi-vis #city-view').hide();
    $('#esi-vis #basic-view').show();
  },
  active_total_stats_table: function() {
    if (is_whole_country && sport_type == 'individual') {
      $("#team_country_container").hide();
      $("#individual_country_container").show();
    } else if (is_whole_country && sport_type == 'team') {
      $("#individual_country_container").hide();
      $("#team_country_container").show();
    }
  }
}

$(document).ready(function() {
  $('#esi-vis #city-view').hide();
  $("#team_country_container").hide();
  $("#province_container").hide();
  $("#country_container").show();
  yleApp.getScale();

  $(window).resize(function () {
    yleApp.getScale();
  });

  $.getJSON("case-2013/Olympiamitalistit/data/joukkueurheilijat.json", function(data){
    teamSportData = data;
    $.getJSON("case-2013/Olympiamitalistit/data/yksilourheilijat.json", function(data){
        individualSportData = data;
        colors = colors_individual;
        rawData = individualSportData;
        yleApp.init();
      });
  });

  $('#sport_type').click(function(){
    yleApp.init();
  });

  $('#sport_individual').click(function(){
    sport_type = 'individual';
    colors = colors_individual;
    rawData = individualSportData;
    $("#sport_individual").addClass("selected_button");
    $("#sport_team").removeClass("selected_button");
    
    yleApp.active_total_stats_table();
  });

  $('#sport_team').click(function(){
    sport_type = 'team';
    colors = colors_team;
    rawData = teamSportData;
    $("#sport_team").addClass("selected_button");
    $("#sport_individual").removeClass("selected_button");

    yleApp.active_total_stats_table();
  });

  $('#whole_country').click(function(){
    is_whole_country = true;
    $("#province_container").hide();
    $("#whole_country").addClass("selected_button");
    $("#only_provinces").removeClass("selected_button");

    yleApp.active_total_stats_table();
  });

  $('#only_provinces').click(function(){
    is_whole_country = false;
    $("#individual_country_container").hide();
    $("#team_country_container").hide();
    $("#province_container").show();
    $("#only_provinces").addClass("selected_button");
    $("#whole_country").removeClass("selected_button");

    yleApp.active_total_stats_table();
  });

});