// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
 
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake(feature).
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h4>Location:${feature.properties.place}<br>Magnitude:${
        feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}
      </h4><hr><p>${new Date(feature.properties.time)}</p>`
    );
  }

  //Define a function that set colors to magnitude ranges
  function determineEarthquakeRadius(magnitude){
  return (magnitude * 4);
 }
  function determineEarthquakeColor(depth){
    if (depth > 50){
      return "#800000";
    }
    if (depth > 20){
      return "#A52A2A";
    }
    if (depth > 15){
      return "#DC143C";
    }
    if (depth > 10){
      return "#FF7F50";
    }
    if (depth > 2){
      return "#FFD700";
    }
    if (depth > 0){
      return "#F0E68C";
    } else {
      return "#EEE8AA";
    }
  }
  
  function renderEarthquakeStyles(feature){
    return {
      color: determineEarthquakeColor(feature.geometry.coordinates[2]),
      radius: determineEarthquakeRadius(feature.properties.mag),
      weight: 0.3,
      opacity: 0.5,
      fillOpacity: 1
    };
  }

  function renderEarthquakeCircle(feature, layer) {
    return L.circleMarker(layer);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // ***Run the onEachFeature function once for each piece of data in the array*** Removes need for a 'for loop'.
  var earthquakes = L.geoJSON(data.features, {
    onEachFeature: onEachFeature,
    style:renderEarthquakeStyles,
    pointToLayer: renderEarthquakeCircle,
  });


  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
  };
  

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [39.419220, -111.950684],
    zoom: 5,
    layers: [street, earthquakes],
  });

// Create an overlay oBject to hold our overlay
  var overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  })
  .addTo(myMap);

// Set up the legend.
var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = [-100, 0, 2, 10, 15, 20, 50];
  var colors = [
    "#EEE8AA",
    "#F0E68C",
    "#FFD700",
    "#FF7F50",
    "#DC143C",
    "#A52A2A",
    "#800000",
  ];

    // Add the minimum and maximum.
    var legendInfo = `
      <strong>Earthquake Depth</strong>
      <div class="labels">
      <div class="min">
      Shallow (Top):${limits[0]}
      </div>
      <div class="max">
      Deep (Bottom):${limits[limits.length - 1]}
      </div>
      </div>
      <ul>`;

    limits.forEach(function (limits, index) {
      legendInfo += '<li style="background-color: ' + colors[index] + '"></li>';
    });

    legendInfo += "</ul>";
    div.innerHTML = legendInfo;
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);

});
