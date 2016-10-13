var campgroundApiKey = require('./../.env').campgroundApiKey;
var cityObj;
var campgrounds;

$(document).ready(function() {
var map;
var infowindow;
var service;
var markers = [];


$('li').click(function() {
  console.log($(this).attr("id"));
});

function initialize() {
  var latlon = new google.maps.LatLng(45.523, -122.675);
  mapCanvas = document.getElementById('map');


  map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: latlon,
    zoom: 15
  });

  infowindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);



}
function clearMarkers() {
  setMapOnAll(null);
}

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function callback(results) {
  console.log(results);
  clearMarkers();
  // if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.resultset.result.length; i++) {
      createMarker(results.resultset.result[i]);
    // }
  }
}

function checkYorN(string) {
  if(string === "Y") {
    return "Yes";
  } else {
    return "No";
  }
}
function createMarker(place) {
  var contentString =
  '<div id="content">'+
    '<div id="siteNotice">'+
    '</div>'+
    '<h1 id="firstHeading" class="firstHeading">'+place.attributes.facilityName+'</h1>'+
    '<div id="bodyContent">'+
      '<p>Availability: ' + checkYorN(place.attributes.availabilityStatus)+ '</p>'+
      '<p>Type: ' + place.attributes.contractType+ '</p>'+
      '<p>Amp Hookups: ' + checkYorN(place.attributes.sitesWithAmps) + '</p>'+
      '<p>Pets: ' + checkYorN(place.attributes.sitesWithPetsAllowed) + '</p>'+
      '<p>Sewer Hookup: ' + checkYorN(place.attributes.sitesWithSewerHookup) + '</p>'+
      '<p>Water: ' + checkYorN(place.attributes.sitesWithWaterHookup) + '</p>'+
      '<p>Waterfront Spots: ' + place.attributes.sitesWithWaterfront + '</p>'
    +'</div>'+
  '</div>';

  console.log(place.attributes.facilityName);
  var placeLoc = new google.maps.LatLng(place.attributes.latitude, place.attributes.longitude);
  var marker = new google.maps.Marker({
    map: map,
    position:  placeLoc,
    icon: image,
    animation: google.maps.Animation.DROP
  });
  markers.push(marker);

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString);
    infowindow.open(map, this);
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }

  });
}

var image = { url: '/../img/marsh.png',
size: new google.maps.Size(32, 32),
// The origin for this image is (0, 0).
origin: new google.maps.Point(0, 0),
// The anchor for this image is the base of the flagpole at (0, 32).
anchor: new google.maps.Point(0, 32)
};


function createCityMarker(lat, long) {
  // alert("createMarker function");
  var placeLoc = new google.maps.LatLng(lat, long);
  var marker = new google.maps.Marker({
    map: map,
    position:  new google.maps.LatLng(lat, long)
  });
  map.setCenter(placeLoc);

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
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
  $.get('http://api.amp.active.com/camping/campgrounds?landmarkName=true&landmarkLat='+ lat + '&landmarkLong='+ lng + '&xml=true&api_key=' + campgroundApiKey).then(function(response) {
    campgrounds = xmlToJson(response);
    callback(campgrounds);
    //serve to google function
  }).then(function() {
    listCampgrounds(campgrounds);
  });
}


function getCity (city, state, getCampground) {
  $.get('https://maps.googleapis.com/maps/api/geocode/json?address='+ city + state+'&key=AIzaSyAVgscJ8HieO8b5zNOiiog5cKMFXHhlirQ').then(function(response) {
    cityObj = response;
    createCityMarker(response.results[0].geometry.location.lat, response.results[0].geometry.location.lng);
    getCampground(response.results[0].geometry.location.lat, response.results[0].geometry.location.lng);
    }).fail(function(error) {
      $('.showWeather').text(error.responseJSON.message);
    });
}



function listCampgrounds(camps) {
  $("ol").empty()
  for (var i = 0; i < camps.resultset.result.length; i++) {
    $('#campground-results').append(
      '<li>'+
      '<button id="testing" data-lat="'+camps.resultset.result[i].attributes.latitude+'" data-lon="'+camps.resultset.result[i].attributes.longitude+'" class="campground-button" type="button">' + camps.resultset.result[i].attributes.facilityName + '</button>'
      +'</li>'
    );
  }
}

function navigateToCamp(lat, lon) {
  var latlong = new google.maps.LatLng(lat, lon)
  map.setCenter(latlong);
  return false;
}

$('body').on('click', 'button.campground-button', function() {
  var lat = $(this).attr("data-lat");
  var long = $(this).attr("data-lon");
  navigateToCamp(lat, long);

});


  $("#getCampground").click(function() {
    var city = $("#city").val();
    var state = $("#state").val();
    cityObj = getCity(city, state, getCampground);
  });

  $("#test").click(function() {
  });

});
