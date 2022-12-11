'use strict';
// // San Francisco
// const origin = [-122.414, 37.776];
// console.log("origin: " + origin);
//
// // Helsinki
// const destination = [24.945, 60.192];
// console.log("destination: " + destination);
//
// const second_dest = {
//     origin: destination,    // from the first route
//     destination: [14.945, 50.192],
// }


// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoieGJneHRtcHF3MjMiLCJhIjoiY2xiZjV1NGlyMDJ4YjNwcndsdWdleWZvaSJ9.mvG31wH6o9Tu7oGn6s6SmQ';
const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [30, 55.8],
    zoom: 4,
    pitch: 20
});

let target_cities = new Array;

const targetCities = 'http://127.0.0.1:5000/list';
async function getCities(url) {
    const response = await fetch(url);
        let data = await response.json();
        let cityList = JSON.stringify(data);
        console.log(data.length)        // 5
        console.log(typeof (data))
        console.log(typeof (data))
        console.log(data[2].city)        // 5
        console.log(JSON.stringify(data) + ' 5cities');
        assignCities(data);
       target_cities.push(data)      // not working

}

getCities(targetCities);
console.log(target_cities)

let button = [];
function assignCities(data) {
    const container = document.querySelector('#container');
    //button = document.createElement('button')
    for (let i = 0; i < data.length; i++) {
        console.log(data)
        button[i] = document.createElement('button')
        container.appendChild(button[i]);
        button[i].setAttribute('class', 'destinations')
        button[i].innerHTML += `${data[i].city}`;
       // button[i].innerHTML += `${data[i].city}`;
    }
    // Object.entries(data).forEach(entry => {
    //     const [key, value] = entry;
    //
    // })
    // container.forEach(button => {
    //
    // })
    // button.innerHTML = data[0].city; // working with line 50 and if <button class="destinations">1</button> is present
}



const map_select = document.querySelector('#replay');
map_select.addEventListener('click', async function (evt) {
    evt.preventDefault();
    let response = await fetch('http://127.0.0.1:5000/current');
    const current = await response.json();
    console.log("origin_f: ", current.coords);
    reroute(current.coords, destination.coords, 2)  // both origin and destination need to be set dinamic.


    // so need update http://127.0.0.1:5000/origin to 2nd value when we arrive there.
})
//second_dest.origin, origin.coords

// San Francisco
// const origin = [-122.414, 37.776];


// Helsinki
const destination = {
  "ICAO": "EVRA",
  "city": "Riga",
  "coords": [
    23.9711,
    56.9236
  ],
  "country": "Latvia"
}   // riga
console.log("destination: " + destination);


const second_dest = {
    origin: destination,    // from the first route
    destination: [14.945, 50.192],      // prague [14.945, 50.192]
}


function reroute(origin, destination, num) {


// A simple line from origin to destination.
    const route = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [origin, destination]
                }
            }
        ]
    };
    // console.log(route)
// A single point that animates along the route.
// Coordinates are initially set to origin.
    const point = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'Point',
                    'coordinates': origin
                }
            }
        ]
    };

// Calculate the distance in kilometers between route start/end point.
    const lineDistance = turf.length(route.features[0]);

    const arc = [];

// Number of steps to use in the arc and animation, more steps means
// a smoother arc and animation, but too many steps will result in a
// low frame rate
    const steps = 500;

// Draw an arc between the `origin` & `destination` of the two points
    for (let i = 0; i < lineDistance; i += lineDistance / steps) {
        const segment = turf.along(route.features[0], i);
        arc.push(segment.geometry.coordinates);
    }

// Update the route with calculated arc coordinates
    route.features[0].geometry.coordinates = arc;

// Used to increment the value of the point measurement against the route.
    let counter = 0;


    // Add a source and layer displaying a point which will be animated in a circle.
    map.addSource('route' + num, {
        'type': 'geojson',
        'data': route
    });

    map.addSource('point' + num, {
        'type': 'geojson',
        'data': point
    });

    map.addLayer({
        'id': 'route' + num,
        'source': 'route' + num,
        'type': 'line',
        'paint': {
            'line-width': 2,
            'line-color': '#007cbf'
        }
    });

    map.addLayer({
        'id': 'point' + num,
        'source': 'point' + num,
        'type': 'symbol',
        'layout': {
            // This icon is a part of the Mapbox Streets style.
            // To view all images available in a Mapbox style, open
            // the style in Mapbox Studio and click the "Images" tab.
            // To add a new image to the style at runtime see
            // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
            'icon-image': 'airport',
            'icon-size': 1.5,
            'icon-rotate': ['get', 'bearing'],
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
        }
    });

    function animate() {
        const start =
            route.features[0].geometry.coordinates[
                counter >= steps ? counter - 1 : counter
                ];
        const end =
            route.features[0].geometry.coordinates[
                counter >= steps ? counter : counter + 1
                ];
        if (!start || !end) return;

        // Update point geometry to a new position based on counter denoting
        // the index to access the arc
        point.features[0].geometry.coordinates =
            route.features[0].geometry.coordinates[counter];

        // Calculate the bearing to ensure the icon is rotated to match the route arc
        // The bearing is calculated between the current point and the next point, except
        // at the end of the arc, which uses the previous point and the current point
        point.features[0].properties.bearing = turf.bearing(
            turf.point(start),
            turf.point(end)
        );

        // Update the source with this new data
        map.getSource('point' + num).setData(point);

        // Request the next frame of animation as long as the end has not been reached
        if (counter < steps) {
            requestAnimationFrame(animate);
        }

        counter = counter + 1;

    }


    // Start the animation
    animate(counter);

fetch('http://127.0.0.1:5000/current/', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(destination)
})
.then(response => response.json())
.then(response => console.log(JSON.parse(response)))
    // const updateCurrentPos =  async function (evt) {
    // evt.preventDefault();
    // //let dataToSend = destination
    // destination = await fetch('http://127.0.0.1:5000/current')
    // const current = await destination.json();
    // console.log("curr: ", current);
    // return current


}






map.on('load', () => {

});


















