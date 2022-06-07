// Police Brutality Map?

// mapbox info
mapboxgl.accessToken = 'pk.eyJ1Ijoic21lcnJpYW0iLCJhIjoiY2w0MnVnMTl0MWY4ZTNqcHhocTg5NGRiNSJ9.gm0NL48HgL2p9BuwsUt9Kw';
var map1 = new mapboxgl.Map({
    container: 'map1',
    style: 'mapbox://styles/smerriam/cl42ums4m005g14mrzickvp6y',
    zoom: 3.3,
    maxZoom: 9,
    minZoom: 3.2,
    center: [-99, 38],
    maxBounds: [
      [-180, 15],
      [-30, 72],
    ],
    projection: 'albers',
});


    // this is the function that findas the first symbol layer

    // let layers = map.getStyle().layers;
    // for (var i = 0; i < layers.length; i++) {
    //     console.log(layers[i].id;)
    // }

    
    map1.on("load", function () {
      map1.addLayer(
          {
          id: "police_brutality_points",
          type: "circle",
          source: {
              type: "geojson",
              data: "data/policeBrutality.geojson",
          },
          paint: {
              "circle-radius": 4,
              "circle-color": "#bb3e03",
              // "circle-stroke-color": "#000000",
              "circle-opacity": 0.4 
            },
          },
          "waterway-label"
      );


      

      map1.on('click', 'police_brutality_points', function (e) {
        var stateName = e.features[0].properties.state;
        var cityName = e.features[0].properties.city;
        var date = e.features[0].properties.date;
        var description = e.features[0].properties.description;
        var url = e.features[0].properties.url;
      
        stateName = stateName.toUpperCase();
        cityName = cityName.toUpperCase();

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
            <h4>
                ${cityName}, ${stateName}
            </h4>
            <p>
                <b>${date}</b> | <a href=${url} target="_blank">Video</a>
            </p>
            <p>
                ${description}
            </p>
        `
        )
        .addTo(map1);
    });

    map1.on('mouseenter', 'police_brutality_points', function () {
        map1.getCanvas().style.cursor = 'pointer';
    });
    map1.on('mouseleave', 'police_brutality_points', function () {
        map1.getCanvas().style.cursor = '';
    });
  });

  