// map_a.js 

mapboxgl.accessToken = 'pk.eyJ1Ijoic21lcnJpYW0iLCJhIjoiY2w0dTgya3g1MXJ5MzNocWNxMmZ0a3BnZiJ9.6rOGDeeBgzOJo1FM3C_Jfg';
var map_a = new mapboxgl.Map({
    container: 'map_a',
    style: 'mapbox://styles/smerriam/cl4u83m3o000b14o9keixyawt',
    zoom: 4.7,
    center: [-109.5, 50.0], //longitude and latitude (y.x)
    maxZoom: 6,
    minZoom: 4.4,
    maxBounds: [[-122, 39], [-97, 51]] 
});

// inserted variable for popup
var popup = new mapboxgl.Popup({
    closeButton: false
});

map_a.on('load', function () {
    let layers = map_a.getStyle().layers;
    let firstSymbolId;
        for (var i = 0; i < layers.length; i++) {
        console.log(layers[i].id); 
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    map_a.addLayer({
        id: 'barley_shapes',
        type: 'fill',
          source: {
              type: 'geojson',
              data: 'data/barleyData_geo.geojson'
          },
          paint: {
                //   "fill-color": 
                //   ['step', ['get', 'value'],
                //         '#ffffff',
                //       58300000, "#00b4d8",
                //       146400000, "#f8b55b",
                //       291900000, "#0096c7",
                //       402800000, "#0077b6",
                //       523400000, "#023e8a"
                //   ],
                // "fill-outline-color": "#ffcf67",
                "fill-opacity": 0,
            },
        }, 
        firstSymbolId
        );

    map_a.addLayer({
      id: 'Mean BP',
      type: 'fill',
        source: {
            'type': 'geojson',
            'data': 'data/countiesData.geojson'
        },
        paint: {
                "fill-color": [
                    "match",
                    ["get", "naturalBreaksMBP"],
                    '0.0 - 0.0004', "#ffcf67",
                    '0.0004 - 0.0013', "#f8b55b",
                    '0.0013 - 0.0026', "#f09b4e",
                    '0.0026 - 0.0044', "#e98142",
                    '0.0044 - 0.0068', "#e26636",
                    '0.0068 - 0.011', "#da4c29", 
                    '0.011 - 0.0171', "#d3321d", 
                    '#ffffff',
                ],
                  "fill-outline-color": "#ffcf67",
                  "fill-opacity": 0.8,
        },
    }, 
    'waterway-shadow'
    );
  });

  
    // create function to seperate numbers with commas for bushel numbers
    
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Create the popup + mouseover
    map_a.on('mousemove', 'barley_shapes', function (e) {
        map_a.getCanvas().style.cursor = 'pointer';
        var county = e.features[0].properties.NAME;
        var bushels = e.features[0].properties.value;
        popup
        .setLngLat(e.lngLat)
            .setHTML(`
                <p>
                    <b>${county} County</b><br>${numberWithCommas(bushels)} Bushels 
                </p>
            `)
        .addTo(map_a);
    });
        
    // Change it back to a pointer when it leaves.
    map_a.on('mouseout', 'barley_shapes', function () {
        map_a.getCanvas().style.cursor = '';
        popup.remove();
      });
