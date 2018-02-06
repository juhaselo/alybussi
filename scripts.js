// KELLO
var clock = document.getElementById('klo');

setInterval(function () {
  var time = moment().format('HH:mm');
  clock.textContent = time;
}, 500);

moment.locale('fi');
var weekday = moment().format('dddd');
var fullDate = moment().format('LL');

$('#weekday').text(weekday + ',');
$('#fulldate').text(fullDate);



// NÄYTÖNSÄÄSTÄJÄ, MODAL TIMEOUTIT

$("#naytons").click(function () {
  $("#naytons").fadeOut(800);
});

var idleTime = 0;
$(document).ready(function () {
  var idleInterval = setInterval(timerIncrement, 60000);
  $(this).keypress(function (e) {
    idleTime = 0;
  });
});

function timerIncrement() {
  idleTime = idleTime + 1;
  if (idleTime > 4) {
    $("#naytons").fadeIn(800); // Jos näyttö ollut inaktiivisena 5 min, näytönsäästäjä palautuu
  }
};

$('#nappi1').click(function () {
  setTimeout(function () {
    $('#hsl1').modal('hide');
  }, 3 * 60 * 1000);
});

$('#nappi2').click(function () {
  setTimeout(function () {
    $('#palv').modal('hide');
  }, 3 * 60 * 1000);
});

$('#nappi3').click(function () {
  setTimeout(function () {
    $('#info1').modal('hide');
  }, 3 * 60 * 1000);
});




// UUTISVIRTA JA KIELIASETUS

function uutisVirta() {
  $('.uvirta').marquee({
    duration: 15000,
    gap: 30,
    delayBeforeStart: 0,
    direction: 'left',
    duplicated: true
  });
};

var fiUrl = "http://users.metropolia.fi/~ollial/web/proxy2.php?url=https://www.hsl.fi/newsApi/3";
var enUrl = "http://users.metropolia.fi/~ollial/web/proxy2.php?url=https://www.hsl.fi/en/newsApi/3";
var svUrl = "http://users.metropolia.fi/~ollial/web/proxy2.php?url=https://www.hsl.fi/sv/newsApi/3";
var urlSetting = "";

function chooseUrl(languageSetting) {
  if (languageSetting === 1) {
    urlSetting = fiUrl;
  } else if (languageSetting === 2) {
    urlSetting = enUrl;
  } else if (languageSetting === 3) {
    urlSetting = svUrl;
  }
  getNewsFeed(urlSetting);
}

function getNewsFeed(urlSetting) {
  document.getElementById("uvirta").innerHTML = '';

  $.post(
    urlSetting,
    function (data) {
      var fragment = document.createDocumentFragment();
      var results = data.contents.nodes.slice(0, 4);

      results.forEach(function (edge) {
        var news = edge.node.title.replace(/&quot;/g, '\"');
        var text = document.createTextNode(news);
        fragment.appendChild(text);
        fragment.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"));
      });

      document.getElementById("uvirta").appendChild(fragment);
      uutisVirta();
    }
  );
};




// KIELEN VAIHTO

var langbtn = document.getElementById("langbtn");

$(document).ready(function () {

  var kieli = "";

  $.post(
    "lang.json",
    function (kieli) {
      function changeFin() {
        document.getElementById("busHead").innerHTML = kieli.fi.busHead;
        document.getElementById("palvelut").innerHTML = kieli.fi.palvelut;
        document.getElementById("servicesHead").innerHTML = kieli.fi.servicesHead;
        document.getElementById("info").innerHTML = kieli.fi.info;
        document.getElementById("sohjoa1").innerHTML = kieli.fi.sohjoa1;
        document.getElementById("sohjoa2").innerHTML = kieli.fi.sohjoa2;
        document.getElementById("lang").innerHTML = kieli.fi.lang;
        document.getElementById("langlogo").src = "images/suomi.png";
      };

      function changeEng() {
        document.getElementById("busHead").innerHTML = kieli.en.busHead;
        document.getElementById("palvelut").innerHTML = kieli.en.palvelut;
        document.getElementById("servicesHead").innerHTML = kieli.en.servicesHead;
        document.getElementById("info").innerHTML = kieli.fi.info;
        document.getElementById("sohjoa1").innerHTML = kieli.en.sohjoa1;
        document.getElementById("sohjoa2").innerHTML = kieli.en.sohjoa2;
        document.getElementById("lang").innerHTML = kieli.en.lang;
        document.getElementById("langlogo").src = "images/english.png";
      };

      function changeSv() {
        document.getElementById("busHead").innerHTML = kieli.sv.busHead;
        document.getElementById("palvelut").innerHTML = kieli.sv.palvelut;
        document.getElementById("servicesHead").innerHTML = kieli.sv.servicesHead;
        document.getElementById("info").innerHTML = kieli.fi.info;
        document.getElementById("sohjoa1").innerHTML = kieli.sv.sohjoa1;
        document.getElementById("sohjoa2").innerHTML = kieli.sv.sohjoa2;
        document.getElementById("lang").innerHTML = kieli.sv.lang;
        document.getElementById("langlogo").src = "images/svenska.png";
      };

      var language = 1;
      changeFin();
      chooseUrl(1);
      console.log("\nKieli on " + language + " eli suomi");

      langbtn.onclick = function changeLang() {
        if (language === 1) {
          changeEng();
          chooseUrl(2);

          language = language + 1;
          console.log("\nLanguage is now " + language + " which is English");
        } else if (language === 2) {
          changeSv();
          chooseUrl(3);

          language = language + 1;
          console.log("\nSpråket är " + language + " som är svenska");
        } else if (language === 3) {
          changeFin();
          chooseUrl(1);

          language = language - 2;
          console.log("\nKieli on " + language + " eli suomi");
        }

      };
    }
  );

});



// GOOGLE SHEETS
// sijainti (lat & lon), locations (name, lat & lon), polyline markkerit (lat & lon)

function getJson(response) {
  return response.json();
}

function handleError(error) {
  console.error(error);
}




// GOOGLE MAPS -funktiot

var map;
var infowindow;
let generatedMarkerPath = [];

function createMap(sheetData) {
  sheetData = sheetData.values.filter(value => Object.keys(value).length !== 0).map((array) => {
    if (array.length === 1) {
      return array[0];
    }

    return array;
  });

  var sijainti = sheetData.slice(sheetData.indexOf('1. OMA SIJAINTI (kartan keskipiste)') + 2, sheetData.indexOf('2. ÄLYBUSSIN PYSÄKIT (markerit kartalla)'));

  sijainti = {
    lat: parseFloat(sijainti[0][0]),
    lng: parseFloat(sijainti[0][1])
  };

  var locations = sheetData.slice(sheetData.indexOf('2. ÄLYBUSSIN PYSÄKIT (markerit kartalla)') + 2, sheetData.indexOf('3. ÄLYBUSSIN REITIN KOORDINAATIT'));

  var polylines = sheetData.slice(sheetData.indexOf('3. ÄLYBUSSIN REITIN KOORDINAATIT') + 2);
  var path = polylines.map(item => ({
    lat: parseFloat(item[0]),
    lng: parseFloat(item[1]),
  }));

  /*
  var sijainti = {
    lat: 60.1815,
    lng: 24.83
  }
  */
  console.log(sheetData);



  let generatedMarkerPath = [];
  let map;
  const icon = {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Green_mark_dot.svg/2000px-Green_mark_dot.svg.png',
    scaledSize: new google.maps.Size(20, 20), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(5, 5) // anchor
  };

  function drawArc(fromPoint, toPoint) {
    let pointsNo = 30;
    let latDelta = (toPoint.lat() - fromPoint.lat()) / pointsNo;
    let lngDelta = (toPoint.lng() - fromPoint.lng()) / pointsNo;
    let positions = [];
    for (let i = 0; i < pointsNo; i++) {
      let curLat = fromPoint.lat() + i * latDelta;
      let curLng = fromPoint.lng() + i * lngDelta;
      positions.push(new google.maps.LatLng(curLat, curLng));

      let curMarker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(curLat, curLng),
        visible: false,
        icon: icon
      });
      generatedMarkerPath.push(curMarker);
    }
  }

  function drawPath(busPath) {
    for (i = 0; i < busPath.length - 1; i++) {
      let c1 = busPath[i];
      let c2 = busPath[i + 1];
      //console.log('c1: '+c1);
      //console.log('c2: '+c2);
      let startPos = new google.maps.LatLng(c1[0], c1[1]);
      let endPos = new google.maps.LatLng(c2[0], c2[1]);
      drawArc(startPos, endPos);
    }
  }

  function showMovingVehicle(markers, index, delay) {
    if (index > 0)
      markers[index - 1].setVisible(false);
    else {
      markers[markers.length - 1].setVisible(false);
    }

    markers[index].setVisible(true);
    if (index < markers.length - 1) {
      setTimeout(function () {
        showMovingVehicle(markers, index + 1, delay);
      }, delay);
    } else {
      showMovingVehicle(markers, 0, delay);
    }
  }

  // duplicate coordinates so that bus will come back the same route
  function createRoundTrip(coordinateArray) {
    return coordinateArray.concat(coordinateArray.slice().reverse());

  }

  $('input[type=button]').click(function () {
    console.log('click');
    let delay = 40;
    showMovingVehicle(generatedMarkerPath, 0, delay);
  });


  // coming now from file otaniemi.js
  // 1. give an array of lat-lon pairs to drawPath-function, then call showMovingVehicle (line 73)
  let otaniemi = [
    [
       60.183341,
       24.828418
    ],
    [
       60.183233,
       24.828193
    ],
    [
       60.182937,
       24.828823
    ],
    [
       60.182502,
       24.829644
    ],
    [
       60.182190,
       24.830331
    ],
    [
       60.182009,
       24.830701
    ],
    [
       60.181492,
       24.831087
    ],
    [
       60.181151,
       24.831280
    ],
    [
       60.180983,
       24.830845
    ],
    [
       60.180930,
       24.830856
    ],
    [
       60.180650,
       24.831092
    ],
    [
       60.180705,
       24.831433
    ]
 ]

  initializeMap();
  const otaniemiBackAndForth = createRoundTrip(otaniemi);
  drawPath(otaniemiBackAndForth);


  function initializeMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: sijainti,
      zoom: 17,
      zoomControl: false,
      streetViewControl: false,
      scrollwheel: false,
      draggable: false,
      mapTypeControl: false,
      fullscreenControl: false
    });
  }







  var request = {
    location: sijainti,
    types: ['airport', 'amusement_park', 'aquarium', 'art-gallery', 'atm', 'bakery', 'bank', 'bar', 'beauty-salon', 'book_store', 'bowling_alley', 'cafe', 'cemetery', 'church', 'city_hall', 'clothing_store', 'convenience_store', 'dentist', 'department_store', 'doctor', 'electronics_store', 'florist', 'furniture-store', 'gas_station', 'gym', 'hair_care', 'hardware_store', 'home_goods_store', 'hospital', 'jewelry_store', 'laundry', 'library', 'liquor_store', 'lodging', 'meal_delivery', 'meal-takeaway', 'movie_rental', 'movie_theater', 'museum', 'night-club', 'park', 'pet_store', 'pharmacy', 'police', 'post_office', 'restaurant', 'school', 'shoe_store', 'shopping_mall', 'spa', 'stadium', 'store', 'university', 'zoo'],
    radius: '600'
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, getServices);

  // Tiedot kartan palveluille
  function getPlaceDetails(place, status, title) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      var fragment = document.createDocumentFragment();
      var br = document.createElement('br');
      var container = document.createElement('div');
      container.classList.add('services-info');

      // Hakee palveluiden nimet
      var title = document.createElement('h3');
      title.classList.add('service-title');
      title.textContent = place.name;
      container.appendChild(title);

      // Hakee palveluiden osoitteet
      var address = document.createElement('p');
      address.classList.add('service-address');
      address.textContent = place.formatted_address;

      // Generoi QR-koodin
      var qrcode = document.createElement('img');
      qrcode.classList.add("qrcode");
      qrcode.setAttribute("id", place.id);
      var placeUrl = "https://www.google.com/maps/place/" + place.name.replace(/ /g, '+') + "/@" + place.geometry.location.lat() + "," + place.geometry.location.lng();
      // https://www.google.com/maps/place/Radisson+Blu+Espoo/@60.183647,24.8341114,17z
      qrcode.src = "http://api.qrserver.com/v1/create-qr-code/?data=" + placeUrl + "!&size=100x100";
      container.appendChild(qrcode);

      var open = place.opening_hours;
      var list = document.createElement('ul');
      list.classList.add('opening-hours-list');

      var isOpen = document.createElement('p');
      isOpen.classList.add('is-open');

      function checkOpeningHours() {
        list.innerHTML = "";
        isOpen.innerHTML = "";

        if (!open) {
          console.warn("No opening hours are available for " + place.name);
          isOpen.style.color = "#d12323";
          isOpen.textContent = "No details available";
          container.appendChild(address);
          container.appendChild(isOpen);
        } else {
          var date = new Date();
          var weekday = new Array(7);
          weekday[0] = "sunnuntai";
          weekday[1] = "maanantai";
          weekday[2] = "tiistai";
          weekday[3] = "keskiviikko";
          weekday[4] = "torstai";
          weekday[5] = "perjantai";
          weekday[6] = "lauantai";

          var currentDate = weekday[date.getDay()];

          if (open.open_now === true) {

            var openingHours = open.weekday_text.forEach(
              function (data) {
                var includes = JSON.stringify(data).includes(currentDate);

                if (includes === true) {
                  var closingTime = data.slice(-5);
                  isOpen.style.color = "#A0FF46";
                  isOpen.textContent = "open until " + closingTime;
                }
              }
            );

            if (/avoinna ympäri vuorokauden/i.test(open.weekday_text)) {
              isOpen.textContent = "always open!";
              list.innerHTML = "";
            }
          } else if (open.open_now === false) {
            isOpen.style.color = "#d12323";
            isOpen.textContent = "closed";
          }

          container.appendChild(address);
          container.appendChild(isOpen);
        };

      };

      checkOpeningHours();
      setInterval(checkOpeningHours, 15 * 60 * 1000);
      container.appendChild(list);
      fragment.appendChild(container);

      document.getElementById("servicesText").appendChild(fragment);

    } else {
      console.warn("No details are available for " + serviceRequest.name);
    }
  }

  function getServices(places, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      places.slice(0, 7).forEach(function (place) {
        var data = {
          name: place.name,
          placeId: place.place_id
        };
        service.getDetails(data, getPlaceDetails);
      });
    }
  }

  var marker, i;

  // Polyline markerit
  for (i = 0; i < locations.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 13,
        fillColor: '#7470BC',
        fillOpacity: 0.8,
        strokeWeight: 5,
        strokeColor: '#7470BC'
      }
    });

    // InfoWindow content
    var content = locations[i][0];

    var infowindow = new google.maps.InfoWindow({
      content: content,
      maxWidth: 160,
      pixelOffset: new google.maps.Size(20, 20)
    });

    google.maps.event.addListener(infowindow, 'domready', function () {
      $(".gm-style-iw").next("div").hide();

      // Reference to the DIV that wraps the bottom of infowindow
      var iwOuter = $('.gm-style-iw');

      // Removes the tail from the info window
      google.maps.event.addListenerOnce(map, 'idle', function () {
        jQuery('.gm-style-iw').prev('div').remove();
      });
    });

    infowindow.open(map, marker);



  }(marker, i);

  var lineSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    strokeOpacity: 1,
    strokeColor: 'rgba(218, 5, 5, 0.568)',
    scale: 4
  };

  var line = new google.maps.Polyline({

    /*
    path: [{
        lat: 60.183341,
        lng: 24.828418
      },
        ...
      {
        lat: ...,
        lng: ...
      }
    }],      
     */

    path: path,
    strokeOpacity: 0,
    icons: [{
      icon: lineSymbol,
      offset: '0',
      repeat: '20px'
          }],
    map: map
  });

  // BUSSIPYSÄKKIEN HAKU

  function getStops() {
    document.getElementById("busText").innerHTML = '';
    var query = JSON.stringify({
      query: '{ stopsByRadius(lat: ' + sijainti.lat + ', lon: ' + sijainti.lng + ', radius: 500) { edges { node { stop { name, lat, lon, stoptimesForPatterns(numberOfDepartures: 1) { pattern { name } stoptimes { scheduledDeparture } } } } } } }'
    });

    $.ajax({
      type: "POST",
      url: "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql",
      data: query,
      contentType: 'application/json; charset=utf-8',
      success: function (pysakit) {
        console.log('Refreshing stop times');
        document.getElementById("busText").innerHTML = '';
        var fragment = document.createDocumentFragment();
        var results = pysakit.data.stopsByRadius.edges.forEach(
          function (edge) {
            var start_lat = sijainti.lat;
            var start_lon = sijainti.lng;
            var lat = edge.node.stop.lat;
            var lon = edge.node.stop.lon;

            // Laskee etäisyyden nykyisestä sijainnista bussipysäkille
            function distance(lat1, lon1, lat2, lon2) {
              var p = 0.017453292519943295;
              var c = Math.cos;
              var a = 0.5 - c((lat2 - lat1) * p) / 2 +
                c(lat1 * p) * c(lat2 * p) *
                (1 - c((lon2 - lon1) * p)) / 2;

              var result = 12742 * Math.asin(Math.sqrt(a));
              result = result.toFixed(3) * 1000;
              return result;
            }

            var container = document.createElement('div');
            container.classList.add('stop');
            var br = document.createElement('br');

            // Hakee pysäkkien nimet
            var title = document.createElement('h3');
            title.classList.add('stop-title')
            title.textContent = edge.node.stop.name + " (" + distance(start_lat, start_lon, lat, lon) + "m)";

            var list = document.createElement('ul');
            list.classList.add('stop-list');

            // Filteröi tulokset ja hakee vain bussilinjat, jotka kulkevat seuraavan 15 minuutin sisään
            edge.node.stop.stoptimesForPatterns.filter(function (item) {
              var today = new Date();
              var currentSeconds = today.getSeconds() + (60 * today.getMinutes()) + (60 * 60 * today.getHours());
              var diff = Math.abs(item.stoptimes[0].scheduledDeparture - currentSeconds);

              return diff <= 900;
            }).map(function (item) {
              var time = moment.utc(item.stoptimes[0].scheduledDeparture * 1000).format('HH:mm');
              var name = item.pattern.name.slice(0, -13).replace(' to ', ' ');
              return {
                time: time,
                name: name,
              };
            }).sort(function (a, b) {
              if (a.time < b.time) {
                return -1;
              }

              if (a.time > b.time) {
                return 1;
              }

              return 0;
            }).splice(0, 3).forEach(function (item) {
              var listItem = document.createElement('li');
              listItem.classList.add('stop-list-item');
              listItem.textContent = (item.time + '  |  ' + item.name);
              list.appendChild(listItem);
            });

            if (list.textContent != "") {
              container.appendChild(title);
              container.appendChild(list);
            }

            if (container.textContent === "") {
              container.textContent = "No stop times available for " + edge.node.stop.name;
              console.warn("No stop times available for " + edge.node.stop.name);
            }


            container.appendChild(br);
            fragment.appendChild(container);

            document.getElementById("busText").appendChild(fragment);

          });
      }
    })
  };

  getStops();
  setInterval(getStops, 60000);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}


// Google Sheets -tietokantahaku
fetch("https://sheets.googleapis.com/v4/spreadsheets/1oOiSqkOp_WEj7f21opfQzqpozwEHTb-K9YES7p-Ib8g/values/A1%3AC1000?fields=values&key=AIzaSyAsKit0QXl6tApOMluYh8do3jaKrwfyUxs")
  .then(getJson)
  .then(createMap)
  .catch(handleError);


// FOOTER VIDEO


function getBannerVideo(videoData) {
  videoData = videoData.values.filter(value => Object.keys(value).length !== 0).map((array) => {
    if (array.length === 1) {
      return array[0];
    }
    return array;
  });

  console.log(videoData);
  $('.ytvideo').css('margin-top', videoData[1]);

  var defaultVideoId = videoData[3].slice(32);
  var defaultVideo = videoData[3].replace("watch?v=", "embed/") + "?autoplay=1&loop=1&rel=0&amp;controls=0&amp;showinfo=0&disablekb=1&modestbranding=1&mute=1&playlist=" + defaultVideoId;

  if (!videoData[5]) {
    document.getElementById("video").src = defaultVideo;
  } else {
    var customVideoId = videoData[5].slice(32);
    var customVideo = videoData[5].replace("watch?v=", "embed/") + "?autoplay=1&loop=1&rel=0&amp;controls=0&amp;showinfo=0&disablekb=1&modestbranding=1&mute=1&playlist=" + customVideoId;
    document.getElementById("video").src = customVideo;
  }

  // var videoData = videoData.slice(videoData.indexOf('DEFAULT VIDEO (Sohjoa -projektin mainosvideo)') + 1, videoData.indexOf('OMA VIDEO'));
}

fetch("https://sheets.googleapis.com/v4/spreadsheets/1oOiSqkOp_WEj7f21opfQzqpozwEHTb-K9YES7p-Ib8g/values/BANNERIVIDEO!A1%3AC1000?fields=values&key=AIzaSyAsKit0QXl6tApOMluYh8do3jaKrwfyUxs")
  .then(getJson)
  .then(getBannerVideo)
  .catch(handleError);



// ARDUINO -FUNKTIOT

document.addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 49) {
    document.getElementById("nappi1").click();
  } else if (event.keyCode === 50) {
    document.getElementById("nappi2").click();
  } else if (event.keyCode === 51) {
    document.getElementById("nappi3").click();
  } else if (event.keyCode === 52) {
    document.getElementById("langbtn").click();
  }
});
