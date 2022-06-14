// County Typologies

// mapbox info
mapboxgl.accessToken = 'pk.eyJ1Ijoic21lcnJpYW0iLCJhIjoiY2w0MzQ2MXZ0MmxjMjNjbzJ2Z3p2aTg4diJ9.utk0iQOt4bBP41MFR0wO-g';
var map2 = new mapboxgl.Map({
    container: 'map2',
    // style: 'mapbox://styles/smerriam/cl3vems65009m14rwfzkhn6dv',
    style: 'mapbox://styles/smerriam/cl43hceg3000114nz7bud292z',
    zoom: 3.2,
    maxZoom: 9,
    minZoom: 3.2,
    center: [-99, 38],
    projection: 'albers'
});

map2.on("load", function () {
    map2.addLayer(
      {
        id: "states_outline",
        type: "line",
        source: {
          type: "geojson",
          data: "https://raw.githubusercontent.com/browninstitute/pointsunknowndata/main/webmapAssignmentDataset/countyTypologyCodes.geojson",
        },
        paint: {
        //   "line-color": "#ffffff",
          "line-width": 0.05,
          "line-opacity": 0.2,
        },
      },
      "waterway-label" // Here's where we tell Mapbox where to slot this new layer
    ); 
    map2.addLayer(
        {
          id: "county_typologies",
          type: "fill",
          source: {
            type: "geojson",
            data: "data/countyTypologyCodes.geojson",
          },
        //   minZoom: 3,
          maxZoom: 6,
          paint: {
            "fill-color": [
                "match",
                ["get", "Economic_Type_Label"],
                "Farming", "#723d46",
                "Mining", "#8e646b",
                "Manufacturing", "#a58389",
                "Federal\/State Government", "#c9cba3",
                "Recreation", "#858935",
                "Nonspecialized", "#ffe1a8", '#ffffff',
            ],
              "fill-outline-color": "#ffffff",
              // adding opacity
              "fill-outline-color": "#ffffff",
               "fill-opacity": 0.6,
          },
        },
        "states_outline" // Here's where we tell Mapbox where to slot this new layer
      ); 
    });

        //POP-UPS!!!
        // Create the popup
    map2.on('click', 'us_states', function (e) {
        var stateName = e.features[0].properties.State; 
        var countyName = e.features[0].properties.County_name;
        var econ = e.features[0].properties.Economic_Type_Label;
            
        stateName = stateName.toUpperCase();
        countyName = countyName.toUpperCase();

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(  
          '<h2>'+ countyName + ' — ' + stateName +'</h2>' +
          '<h4>' + 'Industries of Economic Dependence: ' + econ + '</h4>'
            )
            .addTo(map2);
        });
        // Change the cursor to a pointer when the mouse is over the us_states layer.
        map2.on('mouseenter', 'county_typologies', function () {
            map2.getCanvas().style.cursor = 'pointer';
        });
        // Change it back to a pointer when it leaves.
        map2.on('mouseleave', 'county_typologies', function () {
            map2.getCanvas().style.cursor = '';
        });
