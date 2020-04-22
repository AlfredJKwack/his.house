/*  -----------                     -----------
                     Polyfills
    -----------                     -----------  */  
// Array.prototype.find() is not supported in IE
Array.prototype.find||Object.defineProperty(Array.prototype,"find",{value:function(r){if(null==this)throw new TypeError('"this" is null or not defined');var t=Object(this),e=t.length>>>0;if("function"!=typeof r)throw new TypeError("predicate must be a function");for(var n=arguments[1],o=0;o<e;){var i=t[o];if(r.call(n,i,o,t))return i;o++}}});

/*  -----------                     -----------
         Set up some map layers for later 
    -----------                     -----------  */  

L.mapbox.accessToken = 'pk.eyJ1IjoiYWxmcmVkamt3YWNrIiwiYSI6ImNqZGhheXpoeDB1ZjIyeHBpNjRhNnIwdDAifQ.4lJHofm8CBd2lKB7djcepQ';

var mapboxTiles = L.tileLayer(
    'https://api.mapbox.com/styles/v1/alfredjkwack/ck9bpqquv09e81ipm77a070aa/tiles/{z}/{x}/{y}?access_token=' + L.mapbox.accessToken
    );
var houses = L.layerGroup();

/*  -----------                     -----------
              Get yourself some data 
    -----------                     -----------  */  

var defaultZoom = 15;
var currZoom =  defaultZoom;

var data = [
  {
    name:   'The Hague',
    latLng: [52.103210, 4.315351],
    guid:   'pylb4985ll',
    icon:   L.icon({
        iconUrl: '../img/map-marker1.svg',
        iconSize:     [40, 58], 
        iconAnchor:   [20, 29]
    })
  },
  {
    name:   'Watermael-Boitsfort',
    latLng: [50.807869, 4.402557],
    guid:   'mvvaltqz1y',
    icon:   L.icon({
        iconUrl: '../img/map-marker2.svg',
        iconSize:     [48, 48], 
        iconAnchor:   [24, 24]
    })
  },
  {
    name:   'Chantilly',
    latLng: [49.195213, 2.467015],
    guid:   'ya7qax17jm',
    icon:   L.icon({
        iconUrl: '../img/map-marker1.svg',
        iconSize:     [40, 58], 
        iconAnchor:   [20, 29]
    })
  },
  {
    name:   'Chatelain',
    latLng: [50.822225, 4.363848],
    guid:   'q0z4qkhaxt',
    icon:   L.icon({
        iconUrl: '../img/map-marker3.svg',
        iconSize:     [60, 40], 
        iconAnchor:   [30, 20]
    })
  },
  {
    name:   'ULB',
    latLng: [50.815861, 4.378379],
    guid:   'icgst21r6s',
    icon:   L.icon({
        iconUrl: '../img/map-marker4.svg',
        iconSize:     [67, 47], 
        iconAnchor:   [34, 23]
    })
  },
  {
    name:   'Berg',
    latLng: [50.929705, 4.547924],
    guid:   'yx3cri7jjx',
    icon:   L.icon({
        iconUrl: '../img/map-marker1.svg',
        iconSize:     [40, 58], 
        iconAnchor:   [20, 29]
    })
  }                      
];

/*  -----------                     -----------
                Set up your markers
    -----------                     -----------  */  

/**
 * Creates a Leaflet divIcon object with custom XML contents
 * @param  {ojbect} iconOpts A set of L.icon options
 * @param  {string} svg      the SVG/XML to use inside
 * @return {L.divIcon}       Leaflet divIcon
 */
var createDivIcon = function (iconOpts, svg) {
  return L.divIcon({
    iconSize:   iconOpts.iconSize,
    iconAnchor: iconOpts.iconAnchor,
    className:  'icon-wrapper',
    html: svg
  });
  
}

/**
 * Formats input data into a Leaflet divIcon object
 * @param  {object} data   input data 
 * @param  {tring} strHtml an html string used for the leaflet divIcon
 * @return {object}        L.divIcon object
 */
var formatMarker = function ( data, strHtml ) {
  var output = { 
    title: data.name, 
    guid: data.guid, 
    icon: createDivIcon( data.icon.options, strHtml ) 
  };
  return output;
}

/**
 * Get an SVG file and pass its XML string onto a callback
 * @param  {Function} callback The function we'd like to pass things back to.
 * @param  {object}   opts     Simply passed onto the callback untouched
 * @param  {string}   url      The location we'll get the SVG from with a GET.
 * @return {function}          The callback function with 'opts' and SVG string.
 */
var getMarkerSvg = function( callback, opts, url ) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState==4 && xhr.status == 200) {
      var response = xhr.responseXML.getElementsByTagName('svg')[0].outerHTML;
      callback( opts, response);
    }
  }  
  xhr.open("GET", url);
  xhr.setRequestHeader("Content-Type", "text/xml");
  xhr.responseType = "document";
  xhr.send();
}

/**
 * Adds a marker to the Leaflet map
 * @param {object} data    input data
 * @param {[type]} strHtml an html string used for the leaflet divIcon
 */
var addMarker = function( data, strHtml) {
  var opts = formatMarker ( data, strHtml )
  L.marker( data.latLng, opts )
   .addTo( houses )
   .on( 'click', function(e) { 
      map.panTo(latlng,{easeLinearity : 0.05, duration: 1});
    });
};

/**
 * Iterates over the data set getting marker SVG's and putting 
 * them on the leaflet map.
 */
for (var i = 0; i < data.length; i++) {
  getMarkerSvg( addMarker, data[i], data[i].icon.options.iconUrl );
}


/*  -----------                     -----------
          Set up your map and display it 
    -----------                     -----------  */  

var isHome = function (data) { 
  return data.name === 'The Hague';
}

var latLngHome = data.find(isHome).latLng; 

var map = L.map('map', { 
  attributionControl:false,
  tileSize: 512,
  zoomOffset: -1,
  minZoom   : 10, 
  maxZoom   : 17,
  zoom      : defaultZoom,
  center    : latLngHome,
  layers    : [ mapboxTiles, houses ]
});

/*  -----------                     -----------
              Marker zooming effects 
    -----------                     -----------  */  

/**
 * multiplies CSS values (width, height etc.) preserving their unit
 * @param  {string} cssVal     T css value like -14px or 75%
 * @param  {number} multiplier The multiplication value
 * @return {string}            The css value multipied.
 */
var cssMultiply = function ( cssVal, multiplier ) {
  var returnval = cssVal.substring(0, cssVal.match(/[A-Za-z]/).index) * multiplier
  return returnval + cssVal.substring(cssVal.match(/[A-Za-z]/).index)
}

/**
 * Changes the size of marker icons based on zoom level change
 * @param  {number} oldZoom The previous Leaflet zoom level
 * @param  {number} newZoom The current Leaflet zoom level
 * @return {null}           this function does not return anything
 */
var zoomIcons = function ( oldZoom, newZoom ){

  var zoomRatio = ( newZoom - oldZoom > 0 ) ? 1.5 : 0.666666667;  // 1.25 and 0.8 also works
  var elements = document.getElementsByClassName( 'icon-wrapper' );

  for (var i=0, max=elements.length; i < max; i++) {

    elements[i].style.width      = cssMultiply( elements[i].style.width, zoomRatio );
    elements[i].style.height     = cssMultiply( elements[i].style.height, zoomRatio );
    elements[i].style.marginLeft = cssMultiply( elements[i].style.marginLeft, zoomRatio );
    elements[i].style.marginTop  = cssMultiply( elements[i].style.marginTop, zoomRatio );

    var pathEl = elements[i].getElementsByTagName('path');

    if ( newZoom > defaultZoom ) {
      pathEl[0].style['stroke-width'] = cssMultiply( pathEl[0].style['stroke-width'], zoomRatio  );
    } else {
      pathEl[0].style['stroke-width'] = '1.5px'
    }

  }   
}

map.on('zoomend', function() {
  zoomIcons(currZoom, map.getZoom());
  currZoom = map.getZoom();
});

/*  -----------                     -----------
          Manage the notepad interactions 
    -----------                     -----------  */  


function move_notes() {  
  var blocnotes = document.getElementById("block_legend_credits");
  TweenLite.to(blocnotes, 1, {top:'30%',left:'73%', ease:Power2.easeOut});
}
document.getElementById('action-title').addEventListener('click', move_notes);

var draggable_legend = document.getElementById('block_legend_credits');
dragOn.apply( draggable_legend );

// Show/hide noteblock pages using the side-tabs
function switch_tabs(show) {
  if(show=='legend') {
    content_legend.style.display="block";
    blc_tabs_legend.style.display="block";
    content_credits.style.display="none";
    blc_tabs_credits.style.display="none";
  }
  if (show=='credits') {
    content_legend.style.display="none";
    blc_tabs_legend.style.display="none";
    content_credits.style.display="block";
    blc_tabs_credits.style.display="block";
  }
}

/*  -----------                     -----------
          Add interactivity for locations 
    -----------                     -----------  */  

var getDestination = function (data) {
  return data.guid === this[0];
};

// called from <a> on the page
var goToLoc = function (guid) {
  var destination = data.find( getDestination, [guid] );
  map.panTo( destination.latLng,{easeLinearity : 0.05, duration: 4});
};

var showCompleted = function (guid) {
  var el = document.querySelector("[data-guid='" + guid + "'] .invisible");
  if ( el ) {  el.classList.remove("invisible") };
}

map.on('move', function() {
    var inBounds = []
    var bounds = map.getBounds();

    houses.eachLayer(function(marker) {
        if (bounds.contains(marker.getLatLng())) {
            inBounds.push(marker.options.guid);
        }
    });

    inBounds.forEach(showCompleted);
});
