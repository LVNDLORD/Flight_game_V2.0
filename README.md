# Flight Game V 2.0
Modified Flight Game with GUI

You can check the **game demo** [here](http://167.71.78.129/).

In order to move from one city to another, select a target city from the list on the right side (where displayed all the cities within your flight range) and click the red "**Go**" button in the upper corner of the map. The plane flies to the selected city and the list updates.

## Game Description
A player is a new pilot at the FedEx company, whose mission is to deliver packages to the airports listed in the flight task (5 packages to 5 randomly generated airports). 
A player is flying a fully-loaded Boeing 737-400 with a payload of 23.000kg and the flight range is restricted to 800 km due to fuel constraints.

If the target destination can't be reached directly, the player has to fly to some city that is on the way and refill the fuel tank in order to proceed to one of the target cities. 
The fewer packages are carried, the less carbon footprint per flight is generated because the weight of the plain is decreasing with every delivered package. Each package weighs 4.600kg.

The goal of the game is to use the most efficient route in order to generate less carbon footprint & save the company's operational costs. After finishing the main mission, a player still can freely fly around.

![alt text](https://users.metropolia.fi/~andriid/Flight-game-v2-img/demo1.png)

![alt text](https://users.metropolia.fi/~andriid/Flight-game-v2-img/finalgg.png)

## Install the required modules
Navigate to the `project_server` folder and run `pip install -r requirements.txt` (pip3 if Unix-based).

## Starting the game
Start `main.py` from within `project_server` to start the backend.
Open `index.html` from the `project_web` directory to start playing.
