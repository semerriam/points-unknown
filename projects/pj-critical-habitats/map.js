/* First, define what constitutes a small screen.
This will affect the zoom parameter for each chapter. */

var smallMedia = window.matchMedia("(max-width: 600px)").matches;

/* Next, create two variables that will hold:
1. The different types of layers available to Mapbox and their
respective opacity attributes.
2. The possible alignments which could be applied to the vignettes.*/

var layerTypes = {
  fill: ["fill-opacity"],
  line: ["line-opacity"],
  circle: ["circle-opacity", "circle-stroke-opacity"],
  symbol: ["icon-opacity", "text-opacity"],
  raster: ["raster-opacity"],
  "fill-extrusion": ["fill-extrusion-opacity"],
  heatmap: ["heatmap-opacity"],
};

var alignments = {
  left: "lefty",
  center: "centered",
  // right: "righty",
  full: "fully",
  seventy: "three_quartters",
  first: "opening",
};

/* The next two functions help turn on and off individual
layers through their opacity attributes: The first one gets
the type of layer and the second one adjusts the layer's opacity */

function getLayerPaintType(layer) {
  var layerType = map.getLayer(layer).type;
  return layerTypes[layerType];
}

function setLayerOpacity(layer) {
  var paintProps = getLayerPaintType(layer.layer);
  paintProps.forEach(function (prop) {
    var options = {};
    if (layer.duration) {
      var transitionProp = prop + "-transition";
      options = { duration: layer.duration };
      map.setPaintProperty(layer.layer, transitionProp, options);
    }
    map.setPaintProperty(layer.layer, prop, layer.opacity, options);
  });
}

/* Next, these variables and functions create the story and vignette html
elements, and populate them with the content from the config.js file.
They also assign a css class to certain elements, also based on the
config.js file */

// Main 'story', 'features' and 'header' elements
var story = document.getElementById("story");
var features = document.createElement("div");
var header = document.createElement("div");
features.setAttribute("id", "features");

// If the content exists, then assign it to the 'header' element
// Note how each one of these are assigning 'innerHTML'

// if (config.opening) {
//   var opening = document.createElement("div");
//   opening.innerHTML = config.opening;
//   header.appendChild(opening);
// }
 
if (config.topTitle) {
  var topTitle = document.createElement("div");
  topTitle.innerHTML = config.topTitle;
  header.appendChild(topTitle);
}
if (config.title) {
  var titleText = document.createElement("div");
  titleText.innerHTML = config.title;
  header.appendChild(titleText);
}
if (config.subtitle) {
  var subtitleText = document.createElement("div");
  subtitleText.innerHTML = config.subtitle;
  header.appendChild(subtitleText);
}
if (config.byline) {
  var bylineText = document.createElement("div");
  bylineText.innerHTML = config.byline;
  header.appendChild(bylineText);
}
if (config.description) {
  var descriptionText = document.createElement("div");
  descriptionText.innerHTML = config.description;
  header.appendChild(descriptionText);
}

// If after this, the header has anything in it, it gets appended to the story
if (header.innerText.length > 0) {
  header.classList.add(config.theme);
  header.setAttribute("id", "header");
  story.appendChild(header);
}

/* After building the elements and assigning content to the header these
functions will loop through the chapters in the config.js file,
create the vignette elements and assign them their respective content */

config.chapters.forEach((record, idx) => {
  /* These first two variables will hold each vignette, the chapter
    element will go in the container element */
  var container = document.createElement("div");
  var chapter = document.createElement("div");
  // Adds a class to the vignette
  chapter.classList.add("chap");
  // Adds all the content to the vignette's div
  chapter.innerHTML = record.chapterDiv;
  // Sets the id for the vignette and adds the step css attribute
  container.setAttribute("id", record.id);
  container.classList.add("step");
  // If the chapter is the first one, set it to active
  if (idx === 0) {
    container.classList.add("active");
  }
  // Adds the overall theme to the chapter element
  chapter.classList.add(config.theme);
  /* Appends the chapter to the container element and the container
    element to the features element */
  container.appendChild(chapter);
  // container.classList.add(alignments[record.alignment] || "centered");
  container.classList.add(alignments[record.alignment]);
  if (record.hidden) {
    container.classList.add("hidden");
  }
  features.appendChild(container);
});

// Appends the features element (with the vignettes) to the story element
story.appendChild(features);

/* Next, this section creates the footer element and assigns it
its content based on the config.js file */

var footer = document.createElement("div");

// This assigns all the content to the footer element
if (config.footer) {
  var footerText = document.createElement("p");
  footerText.innerHTML = config.footer;
  footer.appendChild(footerText);
}
// If the footer element contains any content, add it to the story
if (footer.innerText.length > 0) {
  footer.classList.add(config.theme);
  footer.setAttribute("id", "footer");
  story.appendChild(footer);
}

// Adds the Mapbox access token
mapboxgl.accessToken = config.accessToken;

// Honestly, don't know what this does
const transformRequest = (url) => {
  const hasQuery = url.indexOf("?") !== -1;
  const suffix = hasQuery
    ? "&pluginName=scrollytellingV2"
    : "?pluginName=scrollytellingV2";
  return {
    url: url + suffix,
  };
};

// Creates a variable to hold the starting zoom value
var startingZoom;
// If the screen size is small, it uses the `zoomSmall` value
if (smallMedia) {
  startingZoom = config.chapters[0].location.zoomSmall;
} else {
  startingZoom = config.chapters[0].location.zoom;
}

/* This section creates the map element with the
attributes from the main section of the config.js file */
var map = new mapboxgl.Map({
  container: "map",
  style: config.style,
  center: config.chapters[0].location.center,
  zoom: startingZoom,
  bearing: config.chapters[0].location.bearing,
  pitch: config.chapters[0].location.pitch,
  interactive: false,
  transformRequest: transformRequest,
});

if (config.showMarkers) {
  var marker = new mapboxgl.Marker({ color: config.markerColor });
  marker.setLngLat(config.chapters[0].location.center).addTo(map);
}

// Instantiates the scrollama function
var scroller = scrollama();

/* Here we add the two extra layers we are using, just like in our previous
tutorial. At the end, however, we setup the functions that will tie the
scrolling to the chapters and move the map from one location to another
while changing the zoom level, pitch and bearing */

map.on("load", function () {
    // This is the function that finds the first symbol layer
  let layers = map.getStyle().layers;
  let firstSymbolId;
      for (var i = 0; i < layers.length; i++) {
      console.log(layers[i].id); // This is the line of code that we are adding
    //   if (layers[i].type === 'symbol') {
    //       firstSymbolId = layers[i].id;
    //       break;
    //   }
  }
  // Add 3d terrain if necessary
  if (config.use3dTerrain) {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });
    // Add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    // Add a sky layer that will show when the map is highly pitched
    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 0.0],
        "sky-atmosphere-sun-intensity": 15,
      },
    },'fly-8h7e0l');
  }

  // Add layer — All Species Line2 (multiline strings data)
  map.addLayer({
    'id': 'all_species_line2',
    'source': {
        'type': 'geojson',
        'data': 'data/all_species_all_layers2.geojson'
    },
    "type": "line",
    "paint": {
    "line-width": 0.8,
    "line-color": 
    '#af9db9',

    // [
    //     "match",
    //     ["get", "vipcode"],
    //     "I01", "#723d46",
    //     "V01", " #8e646b", 
    //     "V06", " #a58389", 
    //     "V02", " #c9cba3", 
    //     "V03", " #858935",
    //     "P01", " #ffe1a8",
    //     "V05", "#C6D39C", 
    //     "V04", "#FEE7BE", 
    //     "V12", "#708A93", 
    //     "#9F93A6",
    // ],
    
    

    //   [
    //     "match",
    //     ["get", "sciname"],
    //     "Leptoxis foremani", "#723d46",
    //     "Pleurobema hanleyianum", " #8e646b", 
    //     "Pleurocera foremani", " #a58389", 
    //     "Medionidus walkeri", " #c9cba3", 
    //     "Zapus hudsonius preblei", " #858935",
    //     "Deltistes luxatus", " #ffe1a8",
    //     "Cambarus callainus", "#C6D39C", 
    //     "Scaphirhynchus suttkusi", "#FEE7BE", 
    //     "Tiaroga cobitis", "#708A93", 
    //     "Acipenser oxyrinchus (=oxyrhynchus) desotoi", "#9F93A6", 
    //     "Cambarus veteranus", "#D4E4D9",  
    //     "Catostomus warnerensis", "#B18F6B", 
    //     "Meda fulgida", "#E1D7D5",  
    //     "Salvelinus confluentus", "#D36F65", 
    //     "Alasmidonta atropurpurea", "#CE9043",
    //     "Hamiota perovalis", "#969093",
    //     "Epioblasma othcaloogensis", "#B6BBA6", 
    //     "Chasmistes brevirostris", "#E2DEE3",  
    //     "Epioblasma metastriata", "#CA9E87",
    //     "Pleurobema perovatum", "#414051", 
    //     "Pleurobema decisum", "#DED0C8",
    //     "Ptychobranchus greenii", "#9CAD93",
    //     "Medionidus acutissimus", "#DFD0CD",  
    //     "Medionidus parvulus", "#988E8C", 
    //     "Pleurobema furvum", "#6E696A",
    //     "Pleurobema georgianum", "#D9CDCD", 
    //     "Necturus alabamensis", "#C35656",  
    //     "Pleurobema strodeanum", "#41588D", 
    //     "Obovaria choctawensis", "#41588D", 
    //     "Margaritifera marrianae", "#A4789A",  
    //     "Fusconaia escambia", "#A4789A", 
    //     "Hamiota australis", "#A4789A", 
    //     "Reginaia rotulata", "#B6A9D8", 
    //     "Ptychobranchus jonesi", "#E7DA58", 
    //     "Elliptoideus sloatianus", "#9293AE", 
    //     "Pleurobema pyriforme", "#98958F",
    //     "Hamiota subangulata", "#8D9D84",  
    //     "Amblema neislerii", "#9FB08E",  
    //     "Medionidus penicillatus", "#D2D0C4",
    //     "Medionidus simpsonianus", "#2E324A", 
    //     "Elliptio chipolaensis", "#B1988B", 
    //     "Elliptio spinosa", "#C4BABD",  
    //     "Rana chiricahuensis", " #AED0D0",
    //     "Rana pretiosa", " #FCF6DC", 
    //     "Lampsilis rafinesqueana", " #C198A2", 
    //     "Etheostoma moorei", " #364C64", 
    //     "Quadrula cylindrica cylindrica", " #87C2AE",  
    //     "Caretta caretta", " #5F7C8D",
    //     "Etheostoma phytophilum", " #5A7E9A",  
    //     "Catostomus discobolus yarrowi", " #5A7E9A", 
    //     "Chrosomus saylori", "#BAB08B", 
    //     "Notropis buccula", "#E3A461",  
    //     "Noturus crypticus", "#F5DAA9",
    //     "Notropis oxyrhynchus", "#C88042",  
    //     "Pleuronaia dolabelloides", "#C39B73", 
    //     "Ptychobranchus subtentus", " #E3A461", 
    //     "Fusconaia burkei", " #E3AA81", 
    //     "Etheostoma spilotum", " #ADAB70",  
    //     "Etheostoma susanae", " #B6CCE0",
    //     "Etheostoma trisella", " #C5D434",
    //     "Fusconaia masoni", " #DB6F1A", 
    //     "Noturus furiosus", " #8DAA66", 
    //     "Necturus lewisi", " #B9C024",

    //     'purple',
    // ],
    },  
  }, 'fly-8h7e0l'); 

  map.addLayer({
      'id': 'all_species_fill1',
      'type': 'fill',
      'source': {
          'type': 'geojson',
          'data': 'data/all_species_all_layers1.geojson'
      },
      paint: {
          "fill-color": 
          // '#f2c6ab',
          '#af9db9',


              // [
              //     "match",
              //     ["get", "vipcode"],
              //     "I01", "#723d46",
              //     "V01", " #8e646b", 
              //     "V06", " #a58389", 
              //     "V02", " #c9cba3", 
              //     "V03", " #858935",
              //     "P01", " #ffe1a8",
              //     "V05", "#C6D39C", 
              //     "V04", "#FEE7BE", 
              //     "V12", "#708A93", 
              //     "#9F93A6",
              // ],
              
              // 'blue',

              // [
              //     "match",
              //     ["get", "sciname"],
              //     "Leptoxis foremani", "#723d46",
              //     "Pleurobema hanleyianum", " #8e646b", 
              //     "Pleurocera foremani", " #a58389", 
              //     "Medionidus walkeri", " #c9cba3", 
              //     "Zapus hudsonius preblei", " #858935",
              //     "Deltistes luxatus", " #ffe1a8",
              //     "Cambarus callainus", "#C6D39C", 
              //     "Scaphirhynchus suttkusi", "#FEE7BE", 
              //     "Tiaroga cobitis", "#708A93", 
              //     "Acipenser oxyrinchus (=oxyrhynchus) desotoi", "#9F93A6", 
              //     "Cambarus veteranus", "#D4E4D9",  
              //     "Catostomus warnerensis", "#B18F6B", 
              //     "Meda fulgida", "#E1D7D5",  
              //     "Salvelinus confluentus", "#D36F65", 
              //     "Alasmidonta atropurpurea", "#CE9043",
              //     "Hamiota perovalis", "#969093",
              //     "Epioblasma othcaloogensis", "#B6BBA6", 
              //     "Chasmistes brevirostris", "#E2DEE3",  
              //     "Epioblasma metastriata", "#CA9E87",
              //     "Pleurobema perovatum", "#414051", 
              //     "Pleurobema decisum", "#DED0C8",
              //     "Ptychobranchus greenii", "#9CAD93",
              //     "Medionidus acutissimus", "#DFD0CD",  
              //     "Medionidus parvulus", "#988E8C", 
              //     "Pleurobema furvum", "#6E696A",
              //     "Pleurobema georgianum", "#D9CDCD", 
              //     "Necturus alabamensis", "#C35656",  
              //     "Pleurobema strodeanum", "#41588D", 
              //     "Obovaria choctawensis", "#41588D", 
              //     "Margaritifera marrianae", "#A4789A",  
              //     "Fusconaia escambia", "#A4789A", 
              //     "Hamiota australis", "#A4789A", 
              //     "Reginaia rotulata", "#B6A9D8", 
              //     "Ptychobranchus jonesi", "#E7DA58", 
              //     "Elliptoideus sloatianus", "#9293AE", 
              //     "Pleurobema pyriforme", "#98958F",
              //     "Hamiota subangulata", "#8D9D84",  
              //     "Amblema neislerii", "#9FB08E",  
              //     "Medionidus penicillatus", "#D2D0C4",
              //     "Medionidus simpsonianus", "#2E324A", 
              //     "Elliptio chipolaensis", "#B1988B", 
              //     "Elliptio spinosa", "#C4BABD",  
              //     "Rana chiricahuensis", " #AED0D0",
              //     "Rana pretiosa", " #FCF6DC", 
              //     "Lampsilis rafinesqueana", " #C198A2", 
              //     "Etheostoma moorei", " #364C64", 
              //     "Quadrula cylindrica cylindrica", " #87C2AE",  
              //     "Caretta caretta", " #5F7C8D",
              //     "Etheostoma phytophilum", " #5A7E9A",  
              //     "Catostomus discobolus yarrowi", " #5A7E9A", 
              //     "Chrosomus saylori", "#BAB08B", 
              //     "Notropis buccula", "#E3A461",  
              //     "Noturus crypticus", "#F5DAA9",
              //     "Notropis oxyrhynchus", "#C88042",  
              //     "Pleuronaia dolabelloides", "#C39B73", 
              //     "Ptychobranchus subtentus", " #E3A461", 
              //     "Fusconaia burkei", " #E3AA81", 
              //     "Etheostoma spilotum", " #ADAB70",  
              //     "Etheostoma susanae", " #B6CCE0",
              //     "Etheostoma trisella", " #C5D434",
              //     "Fusconaia masoni", " #DB6F1A", 
              //     "Noturus furiosus", " #8DAA66", 
              //     "Necturus lewisi", " #B9C024",

              //     '#E3AA81',
              // ],


              //   "fill-outline-color": "#ffffff",
              // adding opacity
              //   "fill-outline-color": "#ffffff",
              "fill-opacity": 0.5,
      }
  },'all_species_line2'); 

  // pipeline
  map.addLayer({
    'id': 'pipeline',
    'source': {
        'type': 'geojson',
        'data': 'data/pipeline_line.geojson'
    },
    "type": "line",
    "paint": {
    "line-width": 2,
    "line-color": 
    '#A2DA9C',
    },  
  }, 'admin-1-boundary-bg-copy-1'); 

  //prairieA layer: base
  map.addSource('prairie_loc', {
    'type': 'image',
    // 'url': 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
    // 'url': 'https://raw.githubusercontent.com/juliaingram/endangered-species-map3/main/images/radar.gif?token=GHSAT0AAAAAABPNER237JRYUOLUV5AHQUDQYW3AZEQ',
    // 'url': 'https://drive.google.com/file/d/1ozZ1xBTtVaNoSXk5I7qOmVRnYrjnWWae/view?usp=sharing',
    // 'url': 'https://raw.githubusercontent.com/semerriam/points-unknown-data/main/section1.gif',
    'url': 'https://raw.githubusercontent.com/semerriam/points-unknown-data/main/prairie_base.gif',

    // 'image': 'images/prairie_upclose.svg',
    'coordinates': [
        [-89.1215, 42.20305],
        [-89.08329, 42.20305],
        [-89.08329, 42.18248],
        [-89.1215, 42.182848],
    ]

    // center: [-89.120177, 42.195437],

  }, 'road-intersection-copy-1'); 
  map.addLayer({
    id: 'prairie_1',
    'type': 'raster',
    'source': 'prairie_loc',
    'paint': {
    'raster-fade-duration': 0.8
    }
  }, 'road-intersection-copy-1'); 


  //prairieB layer: grid
  map.addSource('prairie_locB', {
    'type': 'image',
    // 'url': 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
    // 'url': 'https://raw.githubusercontent.com/juliaingram/endangered-species-map3/main/images/radar.gif?token=GHSAT0AAAAAABPNER237JRYUOLUV5AHQUDQYW3AZEQ',
    // 'url': 'https://drive.google.com/file/d/1ozZ1xBTtVaNoSXk5I7qOmVRnYrjnWWae/view?usp=sharing',
    // 'url': 'https://raw.githubusercontent.com/semerriam/points-unknown-data/main/section1.gif',
    'url': 'https://raw.githubusercontent.com/semerriam/points-unknown-data/main/prairie_grid.gif',
    // 'image': 'images/section1.gif',
    'coordinates': [
        [-89.1215, 42.20305],
        [-89.08329, 42.20305],
        [-89.08329, 42.18248],
        [-89.1215, 42.182848],
    ]

  }, 'road-intersection-copy-1'); 
  map.addLayer({
    id: 'prairie_2',
    'type': 'raster',
    'source': 'prairie_locB',
    'paint': {
    'raster-fade-duration': 0.8
    }
  }, 'road-intersection-copy-1'); 


  //prairieC layer: prairie section
  map.addSource('prairie_locC', {
    'type': 'image',
    // 'url': 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
    // 'url': 'https://raw.githubusercontent.com/juliaingram/endangered-species-map3/main/images/radar.gif?token=GHSAT0AAAAAABPNER237JRYUOLUV5AHQUDQYW3AZEQ',
    // 'url': 'https://drive.google.com/file/d/1ozZ1xBTtVaNoSXk5I7qOmVRnYrjnWWae/view?usp=sharing',
    // 'url': 'https://raw.githubusercontent.com/semerriam/points-unknown-data/main/section1.gif',
    'url': 'https://raw.githubusercontent.com/semerriam/points-unknown-data/main/prairie_prairie_section.gif',
    // 'image': 'images/section1.gif',
    'coordinates': [
        [-89.1215, 42.20305],
        [-89.08329, 42.20305],
        [-89.08329, 42.18248],
        [-89.1215, 42.182848],
    ]

  }, 'road-intersection-copy-1'); 
  map.addLayer({
    id: 'prairie_3',
    'type': 'raster',
    'source': 'prairie_locC',
    'paint': {
    'raster-fade-duration': 0.8
    }
  }, 'road-intersection-copy-1'); 

  //prairieD layer: runways
  map.addSource('prairie_locD', {
    'type': 'image',
    // 'url': 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
    // 'url': 'https://raw.githubusercontent.com/juliaingram/endangered-species-map3/main/images/radar.gif?token=GHSAT0AAAAAABPNER237JRYUOLUV5AHQUDQYW3AZEQ',
    // 'url': 'https://drive.google.com/file/d/1ozZ1xBTtVaNoSXk5I7qOmVRnYrjnWWae/view?usp=sharing',
    // 'url': 'https://raw.githubusercontent.com/semerriam/points-unknown-data/main/section1.gif',
    'url': 'https://raw.githubusercontent.com/semerriam/points-unknown-data/main/prairie_runways.gif',
    // 'image': 'images/section1.gif',
    'coordinates': [
        [-89.1215, 42.20305],
        [-89.08329, 42.20305],
        [-89.08329, 42.18248],
        [-89.1215, 42.182848],
    ]

  }, 'road-intersection-copy-1'); 
  map.addLayer({
    id: 'prairie_4',
    'type': 'raster',
    'source': 'prairie_locD',
    'paint': {
    'raster-fade-duration': 0.8
    }
  }, 'road-intersection-copy-1'); 

//   map.addLayer({
//     'id': 'bee',
//     'type': 'fill',
//     'source': {
//         'type': 'geojson',
//         'data': 'data/bee.geojson'
//     },
//     'paint': {
//       //   'fill-color': '#ffb703',
//         // 'fill-color': '#D1C783',
//         'fill-color': '#f3e0a0',
//         'fill-opacity': 0.5,
//       // "fill-outline-color": "#AEA56E",
//       //   'fill-outline-opacity': 0.5


//     }
// }, 'road-intersection-copy-1'); 

  

  // Setup the instance, pass callback functions
  scroller
    .setup({
      step: ".step",
      offset: 0.75,
      progress: true,
    })
    .onStepEnter((response) => {
      console.log("scroller")
      var chapter = config.chapters.find(
        (chap) => chap.id === response.element.id
      );
      response.element.classList.add("active");
      let thisZoom;
      if (smallMedia) {
        thisZoom = chapter.location.zoomSmall;
      } else {
        thisZoom = chapter.location.zoom;
      }
      thisLocation = {
        bearing: chapter.location.bearing,
        center: chapter.location.center,
        pitch: chapter.location.pitch,
        zoom: thisZoom,
      };
      map[chapter.mapAnimation || "flyTo"](thisLocation);
      if (config.showMarkers) {
        marker.setLngLat(chapter.location.center);
      }
      if (chapter.onChapterEnter.length > 0) {
        chapter.onChapterEnter.forEach(setLayerOpacity);
      }
      if (chapter.callback) {
        window[chapter.callback]();
      }
      if (chapter.rotateAnimation) {
        map.once("moveend", function () {
          const rotateNumber = map.getBearing();
          map.rotateTo(rotateNumber + 90, {
            duration: 24000,
            easing: function (t) {
              return t;
            },
          });
        });
      }
    })
    .onStepExit((response) => {
      var chapter = config.chapters.find(
        (chap) => chap.id === response.element.id
      );
      response.element.classList.remove("active");
      if (chapter.onChapterExit.length > 0) {
        chapter.onChapterExit.forEach(setLayerOpacity);
      }
    });
});

/* Here we watch for any resizing of the screen to
adjust our scrolling setup */
window.addEventListener("resize", scroller.resize);