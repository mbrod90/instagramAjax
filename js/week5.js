if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function() {};

console.log("script loaded");
var map;
var marker;
var pos;
var photo;
var photoLat;
var photoLng;
var infowindow;
var Instagram = {};
var photoLoc;

// IG Stuffs

Instagram.Template = {};

Instagram.Config = {
  clientID: "dfd7c401ba9d447eaeea5e14263823aa",
  apiHost: "https://api.instagram.com"
};

(function(){

  function toScreen(photos){
    $('div#photos').empty();

    $.each(photos.data, function(index, photo){

      console.log(photo);

      var newPhotoDiv = "<div class='photo'>" +
      "<a href='"+ photo.link +"' target='_blank'>"+
      "<img class='main' src='" + photo.images.low_resolution.url + "' width='250' height='250' />" +
      "</a>" +
      "<img class='avatar' width='40' height='40' src='" + photo.user.profile_picture + "' />" +
      "<span class='heart'><strong>"
      + photo.likes.count +
      "</strong></span>";

      if (photo.location) {
        console.log('adding marker');
        createMarker(photo);
      }

      newPhotoDiv += "</div>";

      $('div#photos').append(newPhotoDiv);
    });

  }

  function generateUrl(tag){
    var config = Instagram.Config;
    return config.apiHost + "/v1/tags/" + tag + "/media/recent?callback=?&amp;client_id=" + config.clientID;
    console.log(tag);
  }

  function search(tag){
    $.getJSON(generateUrl(tag), toScreen);

  }


  Instagram.Template.generate = function(template, photo){

    var re;

    for(var attribute in photo){

      re = new RegExp("{"+attribute+"}","g");

      template = template.replace(re , photo[attribute]);

    }

    return template;

  };
  // Success func.
  $(function(){
    var tag;

    $('form#search button').click(function(event){
      event.preventDefault();

      tag = $('input.search-field').val();
      console.log(tag);

      Instagram.search(tag);

    });
  });
  Instagram.search = search;




  // Map Stuffs
  function initialize() {
    console.log(photoLoc);

    var shared = {},
    options = options || {},
    API_BASE = window.location.href.replace(/\/[^\/]+.html\??(.*)/, '/')


    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(33.813046, -84.36177599999996);
    var mapOptions = {
      zoom: 5,
      center: latlng,
    }
    console.log('Map Created');
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    console.log(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        pos = new google.maps.LatLng(position.coords.latitude,
          position.coords.longitude);

        infowindow = new google.maps.InfoWindow({
          map: map,
          position: pos,
          content: 'You are here!'
        });

        map.setCenter(pos);

        var request = {
          location:pos,
          radius:500
        };

        infowindow = new google.maps.InfoWindow();
      }, function() {
        handleNoGeolocation(true);
      });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
    }
  }

  function createMarker(photo) {
    var marker;
    if (photo.location) {
      photoLat = photo.location.latitude;
      photoLng = photo.location.longitude;

      console.log(photoLat + "," + photoLng);
        marker = new google.maps.Marker({
              position: new google.maps.LatLng(photoLat, photoLng),
              map: map,
              draggable: false,
              animation: google.maps.Animation.DROP,
              icon: {
                 url: photo.images.low_resolution.url,
                 size: new google.maps.Size(32, 32),
                 origin: new google.maps.Point(0, 0),
                 anchor: new google.maps.Point(16, 16),
                 scaledSize: new google.maps.Size(32, 32)
              }
          });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(photo.name);
        infowindow.open(map, this);
        window.location.href = photo.link;
        console.log(photo.link);
      });
    };
  }

  function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
      var content = 'Error: The Geolocation service failed.';
    } else {
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
      map: map,
      position: new google.maps.LatLng(60, 105),
      content: content
    };

    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }

  google.maps.event.addDomListener(window, 'load', initialize);


})();