var campgroundApiKey = require('./../.env').campgroundApiKey;
var cityObj;
var campgrounds;
// response.resultset.result[i].@attributes.latitude
// response.resultset.result[i].@attributes.longitude

$(document).ready(function() {
var map;
var infowindow;
var service;


function initialize() {
  var latlon = new google.maps.LatLng(45.5231, -122.6765);
  mapCanvas = document.getElementById('map');


  map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: latlon,
    zoom: 15
  });

  var currentMarker = new google.maps.Marker({
	    map: map,
	    position: latlon,
	    title:'Current Location'
	  });

  var request = {
    location: latlon,
    radius: 5000,
    types: ['food']
  };

  var request2 = {
    location: latlon,
    radius: 5000,
    types: ['atm']
  };

  infowindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);



}

function callback(results) {
  // if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.resultset.result.length; i++) {
      createMarker(results.resultset.result[i]);
    // }
  }
}

function createMarker(place) {
  var placeLoc = new google.maps.LatLng(place.attributes.latitude, place.attributes.longitude);;
  console.log(placeLoc);
  var marker = new google.maps.Marker({
    map: map,
    position:  placeLoc
  });

  google.maps.event.addListener(marker, 'click', function() {
    // infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);

function xmlToJson(xml) {
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

function getCampground (lat, lng) {
  $.get('http://api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat='+ lat + '&landmarkLong='+ lng + '&xml=true&api_key=' + campgroundApiKey, function(response) {
    campgrounds = xmlToJson(response);
    callback(campgrounds);
    //serve to google function
  });
}


function getCity (city, state, getCampground) {
  $.get('https://maps.googleapis.com/maps/api/geocode/json?address='+ city + state+'&key=AIzaSyAVgscJ8HieO8b5zNOiiog5cKMFXHhlirQ').then(function(response) {
    cityObj = response;
    getCampground(response.results[0].geometry.location.lat, response.results[0].geometry.location.lng);
    }).fail(function(error) {
      $('.showWeather').text(error.responseJSON.message);
    });
}




  $("#test").click(function() {
    var city = $("#city").val();
    var state = $("#state").val();
    cityObj = getCity(city, state, getCampground);
  });

  $("#getCampground").click(function() {
  });

});
