// MTA Turnstiles

// mapbox info
mapboxgl.accessToken = 'pk.eyJ1Ijoic21lcnJpYW0iLCJhIjoiY2pwMG8wOXh0MzZzNjN3bmh2dWFkbWQwZiJ9.Sql33k3knqLCJnESFalXyQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/smerriam/cl3vems65009m14rwfzkhn6dv',
    zoom: 10,
    center: [-74, 40.725], //longitude and latitude (y.x)
    maxZoom: 15,
    minZoom: 8,
    maxBounds: [[-74.45, 40.45], [-73.55, 41]] 
});



https://github.com/chriswhong/nycturnstiles/blob/master/geocoded.csv

map.on('load', function () {
 
  // This is the function that finds the first symbol layer
  let layers = map.getStyle().layers;
  let firstSymbolId;
      for (var i = 0; i < layers.length; i++) {
      console.log(layers[i].id); // This is the line of code that we are adding
      if (layers[i].type === 'symbol') {
          firstSymbolId = layers[i].id;
          break;
      }
  }

  map.addLayer({
      'id': 'MTA Station Data',
      'type': 'circle', //type is circle for a point, polygon layers are of type fill
      'source': {
          'type': 'geojson',
          'data': 'data/turnstileData.geojson'
      },
      'paint': {
        'circle-color': ['interpolate', ['linear'], ['get', 'ENTRIES_DIFF'],
        -1, '#ff4400', //-1 should be #ff4400 crea
        -0.7, '#ffba31', // we are adding a stop in the middle (-0.7). This allows us to go from white, to yellow, to coral in the color progression.
        -0.4, '#ffffff'
        ],
        // 'circle-stroke-color': '#4d4d4d',
        // 'circle-stroke-width': 0.5,
        // circle-radius property uses an interpolate function to assign the circle-radius property based on the ENTRIES_DIFF field from the GeoJson file
        'circle-radius': ['interpolate', ['exponential', 2], ['zoom'],
                10, ['interpolate', ['linear'], ['get', 'ENTRIES_DIFF'],
                    -1, 10, //a value of -1 should be represented with a radius of 10
                    -0.4, 1 //a value of -0.4 should have a radius of 1, and Mapbox interpolates between those values
                ],
                15, ['interpolate', ['linear'], ['get', 'ENTRIES_DIFF'],
                    -1, 25,
                    -0.4, 12
                ] //10 vs. 15 is tied to zoom level for different interpolations
            ],
    }
  }, firstSymbolId); 

  map.addLayer({
    'id': 'Household Income Data',
    'type': 'fill',
    'source': {
        'type': 'geojson',
        'data': 'data/medianIncome.geojson'
    },
    'paint': {
        // 'fill-color': '#5f0f40',
        // 'fill-opacity': 0.5,

        'fill-color': ['step', ['get', 'MHHI'],
        '#ffffff',
        20000, '#93caf6', //#ccedf5 in tutorial
        50000, '#858ae3',
        75000, '#613dc1',
        100000, '#461177',
        150000, '#3d0e61' //#00a2ca in tutorial
      ],  
    'fill-opacity': ['case', ['==', ['get', 'MHHI'], null], 0, 0.65]
    }
}, 'waterway-shadow');


});



// Create the popup
map.on('click', 'turnstileData', function (e) {
  let entriesDiff = e.features[0].properties.ENTRIES_DIFF;
  let entries_06 = e.features[0].properties.ENTRIES_06;
  let entries_20 = e.features[0].properties.ENTRIES_20;
  let stationName = e.features[0].properties.stationName;
  new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML('<h4>' + stationName + '</h4>'
          + '<p><b>Friday, March 6th:</b> ' + entries_06 + ' entries<br>'
          + '<b>Friday, March 20th:</b> ' + entries_20 + ' entries<br>'
          + '<b>Change:</b> ' + Math.round(entriesDiff * 1000) / 10 + '%</p>')
      .addTo(map);
});
// Change the cursor to a pointer when the mouse is over the turnstileData layer.
map.on('mouseenter', 'turnstileData', function () {
  map.getCanvas().style.cursor = 'pointer';
});
// Change it back to a pointer when it leaves.
map.on('mouseleave', 'turnstileData', function () {
  map.getCanvas().style.cursor = '';
});



// add menu

var toggleableLayerIds = ['MTA Station Data', 'Household Income Data'];


for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function(e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}