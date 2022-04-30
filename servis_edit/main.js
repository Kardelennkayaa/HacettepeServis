// Custom variables
var clickedCoord = []
var clickedCoord_lineString = []
var clickedCoord_json = []



var points = [],
    msg_el = document.getElementById('msg'),
    url_osrm_nearest = '//router.project-osrm.org/nearest/v1/driving/',
    url_osrm_route = '//router.project-osrm.org/route/v1/driving/',
    icon_url = '//cdn-icons-png.flaticon.com/512/1042/1042263.png',
    vectorSource = new ol.source.Vector(),
    vectorLayer = new ol.layer.Vector({
      source: vectorSource
    }),
    styles = {
      route: new ol.style.Style({
        stroke: new ol.style.Stroke({
          width: 6, color: [40, 40, 40, 0.8]
        })
      }),
      icon: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          scale: 0.1,
          src: icon_url
        })
      })
    };

//console.clear();

var view =  new ol.View({
    center:[4434288.936162015, 4825488.5058124615],
    zoom:6
    })


// Basemap layer
var basemapLayer = new ol.layer.Tile({
    source: new ol.source.OSM({
        layer:'terrain'
    })
  })
// Layers Array
var layerArray = [basemapLayer]
// Initiating Map


var map = new ol.Map({
    target : 'mymap',
    view :view,
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
    }), vectorLayer]
})


var draw_route = function(pixel){
  map.on('click', function (evt) { 
    utils.getNearest(evt.coordinate).then(function(coord_street){
      var last_point = points[points.length - 1];
      var points_length = points.push(coord_street);

      utils.createFeature(coord_street);

      if (points_length < 2) {
        msg_el.innerHTML = 'Click to add another point';
        return;
      }

      //get the route
      var point1 = last_point.join();
      var point2 = coord_street.join();
      
      fetch(url_osrm_route + point1 + ';' + point2).then(function(r) { 
        return r.json();
      }).then(function(json) {
        if(json.code !== 'Ok') {
          msg_el.innerHTML = 'No route found.';
          return;
        }
        msg_el.innerHTML = 'Use the "Add Route" button to save your route to the database';
        //points.length = 0;
        utils.createRoute(json.routes[0].geometry);
      });
    });
  });
};

var utils = {
  getNearest: function(coord){
    var coord4326 = utils.to4326(coord);    
    return new Promise(function(resolve, reject) {
      //make sure the coord is on street
      fetch(url_osrm_nearest + coord4326.join()).then(function(response) { 
        // Convert to JSON
        return response.json();
      }).then(function(json) {
        if (json.code === 'Ok') resolve(json.waypoints[0].location);
        else reject();
      });
    });
  },
  createFeature: function(coord) {
    var feature = new ol.Feature({
      type: 'place',
      geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
    });
    feature.setStyle(styles.icon);
    jsonSource.addFeature(feature)
    //vectorSource.addFeature(feature);
  },
  createRoute: function(polyline) {
    // route is ol.geom.LineString
    var route = new ol.format.Polyline({
      factor: 1e5
    }).readGeometry(polyline, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    var feature = new ol.Feature({
      type: 'route',
      geometry: route
    });
    feature.setStyle(styles.route);
    vectorSource.addFeature(feature);
  },
  to4326: function(coord) {
    return ol.proj.transform([
      parseFloat(coord[0]), parseFloat(coord[1])
    ], 'EPSG:3857', 'EPSG:4326');
  }
};


const highlightStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: '#EEE',
  }),
  stroke: new ol.style.Stroke({
    color: '#3399CC',
    width: 2,
  }),
});

var jsonSource = new ol.source.Vector();
var vector = new ol.layer.Vector({
  source: jsonSource,
  background: 'white',
});
map.addLayer(vector)


var jsonSource_ank = new ol.source.Vector({
  url: 'https://raw.githubusercontent.com/Kardelennkayaa/heroku_app/main/ankara_road.json',
  format: new ol.format.GeoJSON(),
});

var vector_ank = new ol.layer.Vector({
  source: jsonSource_ank,
  background: 'white',
});
map.addLayer(vector_ank)

map.addInteraction(
  new ol.interaction.Snap({
    source: jsonSource_ank,
    //pixelTolerance: 50,
  })
);

let select = null; // ref to currently selected interaction

const selected_slc = new ol.style.Style({
  fill: new ol.style.Fill({
    color: '#eeeeee',
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});


const selected = new ol.style.Style({
  fill: new ol.style.Fill({
    color: '#eeeeee',
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});




var modify_ank = new ol.interaction.Modify({
  source: jsonSource_ank
});
map.addInteraction(modify_ank);


//  1. To define a source
var drawSource = new ol.source.Vector()



var drawLayer = new ol.layer.Vector({
    source:drawSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
          color: '#F61D1D',
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 4,
          fill: new ol.style.Fill({
            color: '#F61D1D',
          }),
        }),
    })      
})


// 4. Adding on map
map.addLayer(drawLayer)





// Initiate a draw interaction
var draw = new ol.interaction.Draw({
    type : 'Point',
    source:drawSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
          color: '#F61D1D',
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 4,
          fill: new ol.style.Fill({
            color: '#F61D1D',
          }),
        }),
    })
})
draw.on('drawstart', function(evt){
    drawSource.clear()
})
draw.on('drawend',function(evt){
    clickedCoord = evt.feature.getGeometry().getCoordinates() 
    $('#pointadding').modal('show');
    console.log('clicked at', evt.feature.getGeometry().getCoordinates() )
    map.removeInteraction(draw)
})

// Function that enables draw interaction

function startDrawing(){
// add interaction to the map
map.addInteraction(draw)
}

const clear = document.getElementById('clear');
clear.addEventListener('click', function() {
  drawSource.clear();
  drawSource_ls.clear();
}); 

const format = new ol.format.GeoJSON({featureProjection: 'EPSG:3857'});
const download = document.getElementById('download');
drawSource.on('change', function() {
  const features = drawSource.getFeatures();
  const json = format.writeFeatures(features);
  download.href = 'data:text/json;charset=utf-8,' + json;
});

function visualize() {
  location.replace("https://visualizelocation.herokuapp.com/")
}



function SaveDatatodb(){
    var location = document.getElementById('location').value;
    var recorder = document.getElementById('recorder').value;
    var clickedCoord_lonlat = ol.proj.toLonLat(clickedCoord)
    var long = clickedCoord_lonlat[0];
    var lat = clickedCoord_lonlat[1];
    var minibus_name = document.getElementById('minibus_name').value;
    if (location != '' && recorder != '' && long != '' && lat != '' && minibus_name != '' ){
      $('#pointadding').modal('hide');
        $.ajax({
            url:'save.php',
            type:'POST',
            data :{
                userloc : location,
                userrecorder : recorder,
                userlong : long,
                userlat : lat,
                userminibus_name : minibus_name
            },
            success : function(dataResult){
                var dataResult = JSON.stringify(dataResult);
                if (dataResult.statusCode == 200){
                    
                    //$('#pointadding').modal('hide');
                } else {
                    
                }
            }
        })
        alert('Point is added')
    } else {
        alert('Please fill complete information')
    }


}


function startDrawing_route(){
  // add interaction to the map
  map.on('click', function (evt) {
    draw_route(evt.pixel);
    window.addEventListener('contextmenu', (event) => {
      $('#route_adding').modal('show')
    })
  });
  };

function SaveDatatodb_route(){

  var feature = vectorSource.getFeatures();
  var geometry = feature[0].getGeometry();
  var distance = ol.sphere.getLength(geometry);
  var format = new ol.format.GeoJSON();
  var featureArray = vectorSource.getFeatures()
  var json = format.writeFeaturesObject(featureArray);
  var geojsonFeatureArray = json.features
  //var distance = ol.sphere.getLength(polyline);
  var distance = 0;
  var geom_list = [];
  for (let i = 0; i < feature.length; i++) {
    var geometry = feature[i].getGeometry();
    var total_distance = ol.sphere.getLength(geometry);
    distance += total_distance;
  };
  var geom ='';
  for (let j = 0; j < geojsonFeatureArray.length; j++) {
    var geom_str = JSON.stringify(geojsonFeatureArray[j].geometry)
    geom_list.push(geom_str);
    geom += geom_list[j]
  };
  //alert(distance)
  
  //var geom = JSON.stringify(geojsonFeatureArray[geojsonFeatureArray.length-1].geometry)
  
  var geom = geom.replaceAll(']}{"type":"LineString","coordinates":[', ',');
  //var geom = newKey.replace(/]]/gi, ']');
  //alert(geom)
  var location = document.getElementById('location_route').value;
  var recorder = document.getElementById('recorder_route').value;
  var minibus_name = document.getElementById('minibus_name_route').value;

  if (location != '' && recorder != '' && geom != '' &&  minibus_name != '' &&  distance != '')   {
    $('#route_adding').modal('hide')
        $.ajax({
            url:'save_ls.php',
            type:'POST',
            data :{
                userloc : location,
                userrecorder : recorder,
                user_distance : distance,
                user_json : geom,
                userminibus_name : minibus_name
            },
            success : function(dataResult3){
                var dataResult3 = JSON.stringify(dataResult3);
                if (dataResult3.statusCode == 200){
                    
                    //$('#route_adding').modal('hide');
                } else {
                    
                }
            }
        })
        alert('JSON is added')
    } else {
        alert('Please fill complete information')
    }


}

