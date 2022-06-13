// Citibike September 2021 Starts

// mapbox info
mapboxgl.accessToken = 'pk.eyJ1Ijoic21lcnJpYW0iLCJhIjoiY2w0YnVxcDdrMHRnZjNmbGRuZGlkODhnYiJ9.YfzPnjpLawR0kKeTENiudw';
var map3 = new mapboxgl.Map({
    container: 'map3',
    // style: 'mapbox://styles/smerriam/cl3vems65009m14rwfzkhn6dv',
    // style: 'mapbox://styles/smerriam/cl43cz8d4000116n0ggirz0dn',
    style: 'mapbox://styles/smerriam/cl4cqw8df001k15occm7o9z1g',
    zoom: 10.25,
    center: [-73.97, 40.745], //longitude and latitude (y.x)
    maxZoom: 15,
    minZoom: 10,
    maxBounds: [[-74.45, 40.45], [-73.55, 41]], 
    projection: 'albers',
});


    // this is the function that findas the first symbol layer

    // let layers = map.getStyle().layers;
    // for (var i = 0; i < layers.length; i++) {
    //     console.log(layers[i].id;)
    // }

    
    map3.on("load", function () {
      map3.addLayer(
          {
          id: "sep_2021_start_points",
          type: "circle",
          source: {
              type: "geojson",
              data: "data/citibike_sep_2021_start_station_citiGeo.geojson",
          },
        //   'paint': {
        //     'circle-color': ['interpolate', ['linear'], ['get', 'ENTRIES_DIFF'],
        //     -1, '#ff4400', //-1 should be #ff4400 crea
        //     -0.7, '#ffba31', // we are adding a stop in the middle (-0.7). This allows us to go from white, to yellow, to coral in the color progression.
        //     -0.4, '#ffffff'
        //     ],
        paint: {
            // 'circle-radius': 9,
            // "circle-opacity": 0.2,
            'circle-radius': 3,
            "circle-opacity": .9,

          // "circle-stroke-color": "#ffffff",
          // "circle-stroke-width": 0.7,
         
         
    
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'trip_count'],
            0,
            '#F6EFC6',
            296,
            '#F1D299',
            732,
            '#E58F77',
            1713,
            '#BB536B',
            3821,
            '#722155',
            14500,
            '#40273C'
            ],
        },
          },
          // 'waterway-shadow'
      );

      //2nd layer
    //   map.addLayer({
    //     'id': 'Household Income Data',
    //     'type': 'fill',
    //     'source': {
    //         'type': 'geojson',
    //         'data': 'data/medianIncome.geojson'
    //     },
    //     'paint': {
    //         // 'fill-color': '#5f0f40',
    //         // 'fill-opacity': 0.5,
    
    //         'fill-color': ['step', ['get', 'MHHI'],
    //         '#ffffff',
    //         20000, '#93caf6', //#ccedf5 in tutorial
    //         50000, '#858ae3',
    //         75000, '#613dc1',
    //         100000, '#461177',
    //         150000, '#3d0e61' //#00a2ca in tutorial
    //       ],  
    //     'fill-opacity': ['case', ['==', ['get', 'MHHI'], null], 0, 0.65]
    //     }
    // }, 'waterway-shadow');
    

      map3.on('click', 'sep_2021_start_points', function (e) {
        var stationName = e.features[0].properties.start_station_name;
        var tripCount = e.features[0].properties.trip_count;
      
        // stationName = stationName.toTitleCase();
        // tripCount = tripCount.toTitleCase();

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
            <p>
                <b>${stationName}</b> | ${tripCount} Trips 
            </p>
        `
        )
        .addTo(map3);
    });

    map3.on('mouseenter', 'sep_2021_start_points', function () {
        map3.getCanvas().style.cursor = 'pointer';
    });
    map3.on('mouseleave', 'sep_2021_start_points', function () {
        map3.getCanvas().style.cursor = '';
    });
  });

  