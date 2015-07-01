// Globals
var CID = [], LAC = [], T_LAT = [], T_LNG = [], MARKER = [], FOUND = 0, MAP;
var TRIANGULATE_BTN = $("#triangulate_btn");

function get_values() {
  if ($("#tower_form")[0].checkValidity() == true) {

    // Reset TRIANGULATE_BTN color
    TRIANGULATE_BTN.removeClass("btn-danger");
    TRIANGULATE_BTN.addClass("btn-primary");

    // Remove all notfound messages and reset panel colors
    $(".notfound").remove();
    $(".inaccurate").remove();
    $(".panel").removeClass("panel-danger");
    
    // Grab tower values and query for locations
    for (var i = 1; i <= 3; i++) {
      CID[i] = $("#CID" + i).val();
      LAC[i] = $("#LAC" + i).val();
      locate_tower(CID[i], LAC[i], i);
    }

  } else {
    // Change TRIANGULATE_BTN color to red
    TRIANGULATE_BTN.removeClass("btn-primary");
    TRIANGULATE_BTN.addClass("btn-danger");
  }
}

function plot() {

  var point = [];

  // Reset markers
  if (MARKER.length > 0) {
    for (var i = 1; i < MARKER.length; i++) {
      MARKER[i].setMap(null);
    }
    centermarker.setMap(null);
  }

  // Define points
  for (var i = 1; i <= 3; i++) {
    point[i] = new google.maps.LatLng(T_LAT[i], T_LNG[i]);
  }

  // Define markers
  for (var i = 1; i <= 3; i++) {
    MARKER[i] = new google.maps.Marker({
      position: point[i],
      title: "Tower " + i
    });
  }

  // Add markers to map
  for (var i = 1; i <= 3; i++) {
    MARKER[i].setMap(MAP);
  }

  // Zoom appropriately
  var zoombounds = new google.maps.LatLngBounds();
  point.forEach(function(n) {
    zoombounds.extend(n);
  });
  MAP.setCenter(zoombounds.getCenter());
  MAP.fitBounds(zoombounds);

  // Plot center point
  var centermarker = new google.maps.Marker({
    position: zoombounds.getCenter(),
    icon: "https://google-developers.appspot.com/maps/documentation/javascript/examples/full/images/beachflag.png"
  });
  centermarker.setMap(MAP);

  FOUND = 0;

}

function locate_tower(cid, lac, id) {
  $.ajax({
    url: "http://api.opensignal.com/v2/towerinfo.json?cid=" + cid + "&lac=" + lac + "&apikey=f3e1f052fe4dc4e405b9f14a2604b6f8",
    method: "GET",
    success: function(data) {

      // Get number of keys in returned data object
      var length = Object.keys(data).length;

      // If tower is not found
      if (data.hasOwnProperty("towers") && data.towers == "No towers with these identifiers") {
        var panel = $("#panel" + id);
        panel.addClass("panel-danger");
        panel.find(".panel-heading").append("<span class=\"notfound\"> - Not found</span>");

      // If tower is found
      } else if (length == 11 && data.hasOwnProperty("tower1")) {
        var tower_data = data.tower1;
        T_LAT[id] = tower_data.est_lat;
        T_LNG[id] = tower_data.est_lng;
        FOUND++;

        if (FOUND == 3) {
          plot();
        }

      // If multiple towers with the same CID/LAC are found
      } else {
        var panel = $("#panel" + id);
        panel.addClass("panel-danger");
        panel.find(".panel-heading").append("<span class=\"inaccurate\"> - Inaccurate tower</span>");
      }

    }, 
    error: function(e) {
      console.log(e);
      alert("An unknown error has occurred, please refresh and try again.");
    }
  });
}

function initialize() {
  var startPoint = new google.maps.LatLng(1.3514563,103.8109639);
  var mapOptions = {
    center: startPoint,
    zoom: 11
  };
  MAP = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

$(document).ready(function() {

  // Init
  $.material.init();
  google.maps.event.addDomListener(window, 'load', initialize);

  TRIANGULATE_BTN.click(function() {
    // Validate and grab values
    get_values();
  });

});
