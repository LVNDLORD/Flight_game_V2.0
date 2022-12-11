import sys
import json
import os

from flask import Flask
from flask_cors import CORS
import config
import psycopg2
from psycopg2 import extensions
from configparser import ConfigParser
from dotenv import load_dotenv

app = Flask(__name__)
cors = CORS(app)


def config(filename='database.ini', section='postgresql'):
    # create a parser
    parser = ConfigParser()
    # read config file
    parser.read(filename)

    # get section, default to postgresql
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))

    return db


def connect_db():
    """ Connect to the PostgreSQL database server """
    try:
        # read connection parameters
        params = config()

        # connect to the PostgreSQL server
        print('Connecting to the PostgreSQL database...')
        try:
            config.conn = psycopg2.connect(**params)
        except psycopg2.OperationalError as e:
            print(f'Error: {e}')
            sys.exit(1)
        # create a cursor
        config.cur = config.conn.cursor()

        # execute a statement
        if config.conn.status == extensions.STATUS_READY:
            print('PostgreSQL database version:')
            config.cur.execute('SELECT version()')
        else:
            print("Error connecting to the database. Cannot start the game.")
            sys.exit(1)

        # display the PostgreSQL database server version
        db_version = config.cur.fetchone()
        print(db_version)


    except (Exception, psycopg2.DatabaseError) as error:
        print(error)

    # close the communication with the PostgreSQL


def close_db_connection():
    try:
        config.cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if config.conn is not None:
            print('connection closed')
            config.conn.close()


# getting data from db
@app.route("/origin")
def starting_airport():
    sql = f"SELECT city, country, latitude_deg, longitude_deg, icao FROM airport WHERE icao = 'EFHK';"
    config.cur.execute(sql)
    result = config.cur.fetchone()
    airports_obj = {'city': result[0], 'country': result[1], 'coords': [result[3], result[2]], 'ICAO': result[4]}
    json_data = json.dumps(airports_obj, default=lambda o: o.__dict__, sort_keys=True, indent=4)
    print(json_data)
    return json_data

@app.route("/list")
def get_random_airports():
    airports_list = []
    while len(airports_list) < 5:
        sql_db_length = f"SELECT city, country, latitude_deg, longitude_deg, icao FROM airport WHERE icao = " \
                        f"(SELECT icao FROM airport order by random() limit 1);"
        config.cur.execute(sql_db_length)
        result = config.cur.fetchall()
        if result[0] not in airports_list and result[0][0] != 'Helsinki':     # predef Helsinki
            airports_obj = {'city': result[0][0], 'country': result[0][1], 'coords': [result[0][3], result[0][2]], 'ICAO': result[0][4]}
            airports_list.append(airports_obj)
        else:
            continue
        json_data = json.dumps(airports_list, default=lambda o: o.__dict__, sort_keys=True, indent=4)
        config.goal_airports = json_data
    return json_data

@app.route("/goals")
def get_goals():
    return config.goal_airports





@app.route("/target/<icao>")
def target_airport(icao):
    sql = f"""SELECT city, country, latitude_deg, longitude_deg, icao FROM airport WHERE icao = '{icao}';"""
    config.cur.execute(sql)
    result = config.cur.fetchone()
    airports_obj = {'city': result[0], 'country': result[1], 'coords': [result[3], result[2]], 'ICAO': result[4]}
    json_data = json.dumps(airports_obj, default=lambda o: o.__dict__, sort_keys=True, indent=4)
    print(json_data)
    return json_data





# def third_airport():
#     sql = f"SELECT city, country, latitude_deg, longitude_deg FROM airport WHERE icao = 'EVRA';"
#     config.cur.execute(sql)
#     result = config.cur.fetchone()
#     airports_obj = {'city': result[0], 'country': result[1], 'coords': [result[2], result[3]]}
#     json_data = json.dumps(airports_obj, default=lambda o: o.__dict__, sort_keys=True, indent=4)
#     print(json_data)
#     return json_data


# game logic
connect_db()

starting_airport()
# doesnt play a role. Currently flying from second dest in js (line 48) to origin at line 31 from http://127.0.0.1:5000/origin
target_airport('EVRA')  # !! pass value, as ICAO to this function to make it fly.
get_random_airports()

# end of the prog
#close_db_connection()

if __name__ == "__main__":
    app.run(use_reloader=False, debug=True, host='0.0.0.0', port=5000)



# Q&A
# getting data 2 in terminal
# how to close connection in db
# pass JSON to JS
