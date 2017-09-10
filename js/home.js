var map;
var myMarkers = [];
var largeInfowindow = null;
var filtered = ko.observableArray();

// function to initial map
function initMap() {
  var largeInfowindow = new google.maps.InfoWindow();
  ko.applyBindings(new myViewModel());
}

// check whether the letters written in the serch box matches any of the saved list or not
function exists(sub_str, str) {
  // change both the saved and the entered strings to lowercase to be matched
  if (str.toLowerCase().indexOf(sub_str.toLowerCase()) !== -1) return true;
  return false;
}

var myViewModel = function() {
  // define a map with specific center and style
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 30.78839, lng: 31.000214},
    zoom: 14,
    mapTypeControl: false,
    styles: [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}],
      },
    ],
  });

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  search = ko.observable();
  // function to search the entered text of the search box
  // define a new array to hold filtered search results
  searchMarkers = function() {
    var markers = [];
    // if search input is not empty
    if (search()) {
      largeInfowindow.close();
      // loop through each item/location in the list
      for (var i = 0; i < locations.length; i++) {
        // if the value of text input exists in any item of the list
        if (exists(search(), locations[i].title))
          // add this item to markers array
          markers.push(locations[i]);
      }
      // hide every marker
      for (var j = 0; j < locations.length; j++) {
        locations[j].marker.setVisible(false);
      }
      // but the ones we return
      for (var k = 0; k < markers.length; k++) {
        markers[k].marker.setVisible(true);
      }
      return markers;
    }
    // show every marker
    // use forEach
    locations.forEach(function(location) {
      location.marker.setVisible(true);
    });
    // or we can use for
    // for (var i = 0; i < locations.length; i++) {
    //   locations[i].marker.setVisible(true);
    // }

    // if search input is empty view the whole list of locations
    return locations;
  };

  filtered = locations;
  // loop the results to display their markers
  for (var i = 0; i < filtered.length; i++) {
    var location = filtered[i].location;
    var title = filtered[i].title;
    //specify a marker with the saved properties
    var marker = new google.maps.Marker({
      position: location,
      title: title,
      map: map,
      animation: google.maps.Animation.DROP,
      id: i,
    });
    // add the marker to  the markers[i]
    myMarkers.push(marker);
    // ADDED: Store the marker as a property
    // of the location
    filtered[i].marker = marker;
    // extend the marker bounds
    bounds.extend(myMarkers[i].position);
    
  } // end for

  // add infowindow for each marker when clicked
  myMarkers.forEach(function(m){
    m.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    itemClicked = function(clicked){
      clicked = myMarkers[this.id-1];
      google.maps.event.trigger(clicked, 'click');
      map.setZoom(15);
    };
  },this);

  // let the map to fit the defined bounds
  google.maps.event.addDomListener(window, 'resize', function() {
    map.fitBounds(bounds);
  });
};


// function to add the desired data in the infowindo
function populateInfoWindow(marker, infowindow) {
  // third party API
  // used the weather API
  $.ajax({
    url:
      'http://api.openweathermap.org/data/2.5/weather?lat=' +
      marker.getPosition().lat() +'&lon=' + marker.getPosition().lng() +
      '&appid=bfe0f9d10620d98c66ce98b9cb6dc0c8&units=metric',
    success: function(result) {
      renderInfowindow = '<p>' + marker.title + '</br>' + marker.position +
      '</br>Weather : </br> min :  ' + result.main.temp_min + ' °C '+
      '</br> max : ' + result.main.temp_max +' °C </p> ';
      infowindow.setContent(window.renderInfowindow);
    },
    // in case of error in loading the API info
    // call this fun
    // that ignores displaying the API info
    // and only displays the title and the position of the plac
    error: function(xhr, status, error) {
      renderInfowindow = marker.title + '/br' + marker.position +
        '<h4>Weather<h4><p>Error : Unable to view weather status, please try again later.</p>';
      infowindow.setContent(window.renderInfowindow);
    }
  });
   // Check to make sure the infowindow is not already opened on this marker.
   if (infowindow.marker != myMarkers) {
    infowindow.marker = marker;
      // set the content of the info window
      infowindow.open(map, marker);
      map.setZoom(15);
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
        marker.setAnimation(null);
      });
    }
    // set animation to the clicked marker
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {marker.setAnimation(null); }, 1400);
}

// alert for loading map error
function errorHandling() {
  alert("Can't Load Map, Please Check Your Internet Connection and try again.");
}