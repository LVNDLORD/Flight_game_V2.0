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

const map_select = document.querySelector('#replay');
map_select.addEventListener('click', async function (evt) {
    evt.preventDefault();
    reroute(game_origin.coords, destination, 2)  // both origin and destination need to be set dinamic.
})

// Helsinki
const destination = [23.9711, 56.9236];   // riga
//console.log("destination: " + destination);



let cityList;
let game_origin;
async function getCities() {
    let response = await fetch('http://127.0.0.1:5000/all');
    let cityObject = await response.json();
    cityList = cityObject;
    console.log("cityList", cityList);
    game_origin = cityList[4];
    console.log(`Origin coords: ${game_origin.coords} Origin City: ${game_origin.city}`);    
    return cityList
}

let in_range_destinations;
async function getFlyable_Destinations() {
    let response = await fetch('http://127.0.0.1:5000/fly_destinations');
    let flydestinations = await response.json();
    in_range_destinations = flydestinations
    return in_range_destinations
}

// Create buttons where the player is allowed to navigate to
async function createDestinationButtons() {
    await getFlyable_Destinations(); // wait for the JSON with country destinations within range is finished before attempting to create the buttons
    let button = [];
    const container = document.querySelector('#container');
    fly_title = document.createElement('h2')
    fly_title.innerHTML += "Fly to:";
    container.appendChild(fly_title);
    console.log("waited");
    console.log(in_range_destinations);
    for (let i = 0; i < in_range_destinations.length; i++) {
        button[i] = document.createElement('button');
        container.appendChild(button[i]);
        button[i].setAttribute('class', 'destinations');
        button[i].setAttribute('name', `${in_range_destinations[i][6]}`);
        button[i].innerHTML += `${in_range_destinations[i][6]}, ${in_range_destinations[i][5]}`;
    }
}

let goal_countries;
async function getGoals() {
    let response = await fetch('http://127.0.0.1:5000/goals');
    let goals = await response.json();
    //console.log("Obtained the goal airports");
    goal_countries = goals;
    createList(goal_countries);
    return goals
}

// Creates a list with the goal cities. Can be styled to anything else. Maybe inside its own box or so. Fuck knows.
// TO DO: Maybe show RED if the city has not yet been visited and green if it has
// or... Remove the city name from the goal altogether once visited? Whatever is easier...
function createList(data) {
    let list = [];
    const container = document.querySelector('#options');
    goal_text = document.createElement('h2')
    goal_text.innerHTML += "Goal Cities to visit";
    container.appendChild(goal_text);
    for (let i = 0; i < data.length; i++) {
        list[i] = document.createElement('li')
        container.appendChild(list[i]);
        //list[i].setAttribute('class', 'destinations')
        list[i].innerHTML += `${data[i].city}, ${data[i].country}`;
    }
    console.log("Goal List", data);
}

// Button click logic
// Handles clicks on countries - Previously used on last project...
/*let destButtons = document.getElementsByClassName("destinations");
let buttonsFunction = function() {
    let country = this.getAttribute("name");
    alert(country);
}
for (let i = 0; i < destButtons.length; i++) {
    elements[i].addEventListener('click', buttonsFunction, false);
}
*/
/*document.getElementById.on('click','.destinations',function(e)
{
    e.preventDefault();
    let country;
    country = e.target.value;
    console.log(`country ${country}`);
});*/

// Ajax code to detect what button got clicked on and send it to flask to update the vars
// $(document).on('click','.destinations',function(e)
// {
//     //e.preventDefault();
//     let btnName;
//     btnName = e.target.name;
//     console.log(`button clicked: ${btnName}`);
//     for (const obj in in_range_destinations):
//         if (in_range_destinations.obj  == btnName):
//             return obj



    /*$.ajax({
        type:'POST',
        url:'/',
        data: {'data': country},
        success:function()
        {
            //origin = [destination[0], destination[1]];
            console.log(origin)
            destination = [{{ flight_destination }}];//
            map.flyTo({center: [destination[0], destination[1]], zoom: 4, speed: 0.2});
            location.reload(true);
        }
    })*/
// });

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
}

map.on('load', () => {
    getGoals();
    //createDestinationButtons();
    getCities();

});