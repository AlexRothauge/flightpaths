import sys
import os
from traffic.data import opensky
import time
import math
from pymongo import MongoClient
import datetime
from dotenv import load_dotenv
load_dotenv()

connectionString = 'mongodb://{}:{}@{}:{}'.format(os.getenv('DB_USER'), os.getenv('DB_PW'), os.getenv('DB_HOST'), os.getenv('DB_PORT') )
client = MongoClient(connectionString)
db = client[os.getenv('DB_NAME')]
collection = db["flightData"]

def checkClientConnection():
    try:
        client.server_info()
    except:
        print('No connection could be established to the database')
        exit()

def insert(formattedList, startInSeconds, endInSeconds):
    collection.delete_many({
        'time': {
            '$gte': startInSeconds,
            '$lte': endInSeconds
        }
    })
    collection.insert_many(formattedList)
    print('Data inserted')

def validate(icao24, lat, lon, time):
    return isinstance(icao24, str) and icao24 != '' \
        and isinstance(lat, float) and not math.isnan(lat) \
        and isinstance(lon, float) and not math.isnan(lon) \
        and isinstance(time, int) and not math.isnan(time)


def getStartEndHour(start, end):
    startHour = int(datetime.datetime.strptime(start, "%Y-%m-%d %H:%M").replace(minute=0, tzinfo=datetime.timezone.utc).timestamp())
    endHour = int((datetime.datetime.strptime(end, "%Y-%m-%d %H:%M") + datetime.timedelta(hours=1)).replace(minute=0).replace(tzinfo=datetime.timezone.utc).timestamp())
    return startHour, endHour

def getData(start, end, startInSeconds, endInSeconds):
    try:
        startHour, endHour = getStartEndHour(start, end)
        requestString = 'SELECT * FROM state_vectors_data4 WHERE time % 10 = 0 AND time>={} AND time<={} AND hour>={} AND hour<={}'.format(startInSeconds, endInSeconds, startHour, endHour)
        print(requestString)
        response = opensky.request(
            requestString,
            start,
            end,
            columns=['icao24', 'lat', 'lon', 'time']
        )
        if (response.empty):
            print('No data found')
            exit()
        return response
    except Exception as error:
        print('OpenSky Error: ' + str(error))
        exit()

def main(start, end):
    startInSeconds = int(datetime.datetime.strptime(start, "%Y-%m-%d %H:%M").replace(tzinfo=datetime.timezone.utc).timestamp())
    endInSeconds = int(datetime.datetime.strptime(end, "%Y-%m-%d %H:%M").replace(tzinfo=datetime.timezone.utc).timestamp())
    t0 = time.time()
    print('Starting request')

    response = getData(start, end, startInSeconds, endInSeconds)
    print('Request completed')
    t1 = time.time()

    responseDict = response.to_dict()
    formattedList = []
    for key in responseDict['icao24'].keys():
        icao, lat, lon, timestamp = key[1], key[2], key[3], key[0] 
        if validate(icao, lat, lon, time=timestamp): 
            formattedList.append({
                'icao': icao,
                'position': { 
                    'type': 'Point', 
                    'coordinates': [ lon, lat ]
                },
                'time': timestamp,
                'createdAt': datetime.datetime.now(datetime.timezone.utc)
            })

    print('Request Time: ' + str(t1-t0))
    print('Total Response: ' + str(len(responseDict['icao24'])))
    print('Filtered Total: ' + str(len(formattedList)))
    insert(formattedList, startInSeconds, endInSeconds)
    t2 = time.time() 
    print('Total Time: ' + str(t2-t0))

def validateDate(date):
    try:
        datetime.datetime.strptime(date, '%Y-%m-%d %H:%M')
        return True
    except ValueError:
        return False

def getLastInterval():
    requestTime = datetime.datetime.now() - datetime.timedelta(weeks=4)
    if requestTime.minute < 15:
        return requestTime.strftime('%Y-%m-%d %H') + ':00', requestTime.strftime('%Y-%m-%d %H') + ':15'
    elif requestTime.minute < 30:
        return requestTime.strftime('%Y-%m-%d %H') + ':15', requestTime.strftime('%Y-%m-%d %H') + ':30'
    elif requestTime.minute < 45:
        return requestTime.strftime('%Y-%m-%d %H') + ':30', requestTime.strftime('%Y-%m-%d %H') + ':45'
    else:
        return requestTime.strftime('%Y-%m-%d %H') + ':45', (requestTime + datetime.timedelta(hours = 1)).strftime('%Y-%m-%d %H') + ':00'

if __name__ == '__main__':
    start, end = None, None
    if len(sys.argv) == 1:
        start, end = getLastInterval()
    elif len(sys.argv) == 3 \
            and len(sys.argv[1]) == 16 and validateDate(sys.argv[1]) \
            and len(sys.argv[2]) == 16 and validateDate(sys.argv[2]) \
            and sys.argv[1] < sys.argv[2]:
        start, end = sys.argv[1], sys.argv[2]
    else:
        print('Invalid args')
        exit()

    print('Starting Import with daterange: ', start, end)
    checkClientConnection()
    main(start, end)
    client.close()
    