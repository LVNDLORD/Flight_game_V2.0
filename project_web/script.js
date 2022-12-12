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
    reroute(game_origin.coords, destination, 2)  // both origin and destination need to be set dinamic.
})

// Helsinki
let destination = [24.9633, 60.3172];  // Helsinki

let cityList;
let game_origin;
let pos_array = 4;
async function getCities() {
    let response = await fetch('http://127.0.0.1:5000/all');
    let cityObject = await response.json();
    cityList = cityObject;
    //console.log("cityList", cityList);
    game_origin = cityList[pos_array];
    //console.log(`Origin coords: ${game_origin.coords} Origin City: ${game_origin.city}`);
}

// Haversine formula - https://www.htmlgoodies.com/javascript/calculate-the-distance-between-two-points-in-your-web-apps/
function distance(lat1, lon1, lat2, lon2) {
    let radlat1 = Math.PI * lat1/180
    let radlat2 = Math.PI * lat2/180
    let radlon1 = Math.PI * lon1/180
    let radlon2 = Math.PI * lon2/180
    let theta = lon1-lon2
    let radtheta = Math.PI * theta/180
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    dist = dist * 1.609344
    return dist
}

let in_range_destinations;
async function getFlyable_Destinations() {
    await getGoals();
    let origin_x = game_origin.coords[1];
    let origin_y = game_origin.coords[0];
    let origin_city1 = game_origin.city;
    //console.log("origin city after click", origin_city1);
    let button = [];
    const container = document.querySelector('#container');
    fly_title = document.createElement('h2')
    fly_title.innerHTML += `Travelled totally: ${travelledDistance} km<br><br>CO2 footprint: ${CO2.toFixed(3)} tonn<br><br>Current Location: ${game_origin.city}<br><br>Fly to:`;
    container.appendChild(fly_title);

    for (let i = 0; i < cityList.length; i++) {
        d = distance(origin_x, origin_y, cityList[i].coords[1],cityList[i].coords[0]);
        //console.log(`i: ${i} Distance: ${d}`);
        if (d > 0 && d < 800) {
            //console.log(cityList[i].city);
            button[i] = document.createElement('button');
            container.appendChild(button[i]);
            button[i].setAttribute('class', 'destinations');
            button[i].setAttribute('name', `${cityList[i].city}`);
            button[i].innerHTML += `${cityList[i].city}, ${cityList[i].country}`;
        }
    }
}

let goal_countries;
let travelledDistance = 0;
let CO2 = 0;
async function getGoals() {
    await getCities();
    let response = await fetch('http://127.0.0.1:5000/goals');
    let goals = await response.json();
    
    // Test if the variable is undefinied so that it can populate the countries at the beginning and change its type to Array.
    if (goal_countries == null) {
        goal_countries = goals;
    }
    createList(goal_countries);
    return goals
}

// Creates a list with the goal cities. Can be styled to anything else. Maybe inside its own box or so. Fuck knows.
// TO DO: Maybe show RED if the city has not yet been visited and green if it has
// or... Remove the city name from the goal altogether once visited? Whatever is easier...
function createList(data) {
    let list = [];
    const container = document.querySelector('#options');
    const actualContainer = document.querySelector('#goal');
    goal_text = document.createElement('h2')
    if (goal_countries.length == 0) {
        console.log("Array is empty.. Player won!");
        goal_text.innerHTML += "Congratulations. You won!";
        actualContainer.appendChild(goal_text);
        victory_text = document.createElement('p');
        victory_text.innerHTML += "<b>You're free to fly all you want.<br>See you on the next mission!</b>";
        actualContainer.appendChild(victory_text);
    } else {
        goal_text.innerHTML += "Goal Cities to visit";
        actualContainer.appendChild(goal_text);
    }
    for (let i = 0; i < data.length; i++) {
        list[i] = document.createElement('li')
        container.appendChild(list[i]);
        list[i].setAttribute('class', 'goal_destination_class')
        list[i].innerHTML += `${data[i].city}, ${data[i].country}`;
    }
    //console.log("Goal List", data);
}

let destinationObj;
// Button click logic
$(document).on('click','.destinations',function(e)
{
    let btnName;

    btnName = e.target.name;
    //console.log(`button clicked: ${btnName}`);

    for (let i=0; i < cityList.length; i++) {
        if (btnName == cityList[i].city) {
            destinationObj = cityList[i];
            pos_array = i;
        }
    }
    //console.log(destinationObj.coords);
    destination = destinationObj.coords;

// forcefully remove mapbox stuff
map.removeLayer('route2');
map.removeLayer('point2');
map.removeSource('route2');
map.removeSource('point2');
});

function isGoalReached() {
    //console.log(`isGoalReached Current city: ${game_origin.city}`);
    for (let i=0; i < goal_countries.length; i++){
        if (game_origin.city == goal_countries[i].city) {
            //console.log(goal_countries);
            // loop through goal_country array and remove the one that matches the city
            for (let c=0; c < goal_countries.length; c++) {
                if (game_origin.city == goal_countries[c].city) {
                    goal_countries.splice(c, 1);
                    //console.log("Removed", game_origin.city);
                }
            }
        }
    }
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
    let lineDistance = turf.length(route.features[0]);

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

        counter = counter + 2;
    }
    game_origin = destinationObj;
    //console.log("game_origin", game_origin.city);
    // Start the animation
    animate(counter);
    
    // Move camera to destination
    map.flyTo({center: [game_origin.coords[0], game_origin.coords[1]], zoom: 4, speed: 0.2});

    // add total travelled distance
    travelledDistance += Math.round(lineDistance);

    // add CO2
    CO2 += Number((lineDistance * 0.02).toFixed(1));


    // Remove html elements to avoid duplication of texts
    fly_title.remove();
    goal_text.remove();
    let buttonsCountry = document.getElementsByClassName('goal_destination_class');
    for(let i = buttonsCountry.length - 1; 0 <= i; i--)
    if(buttonsCountry[i] && buttonsCountry[i].parentElement)
    buttonsCountry[i].parentElement.removeChild(buttonsCountry[i]);
    let btnElements = document.getElementsByClassName("destinations");
    for(let i = btnElements.length - 1; 0 <= i; i--)
    if(btnElements[i] && btnElements[i].parentElement)
    btnElements[i].parentElement.removeChild(btnElements[i]);

    // Redraw buttons
    getFlyable_Destinations();

    // Check for goals
    isGoalReached();
}

map.on('load', () => {
    map.addControl(new mapboxgl.NavigationControl());
    getFlyable_Destinations();
    const modal = document.querySelector('.modal');
    const shade = document.querySelector('.shade');
    const btnCloseModal = document.querySelector('.close-modal');

    const closeModal = function () {
    modal.classList.add('hidden');
    shade.classList.add('hidden');
    };

    btnCloseModal.addEventListener('click', closeModal);
    shade.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
});


















