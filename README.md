## Environment variables
PORT - port on which the application will be run (default 5000)

ROKKET_API_HOST - host name of the API backend (default "rokketmed.herokuapp.com")

## Building

npm install

ROKKET_API_HOST="hostname" node gulp build

## Run webserver

npm install

PORT=80 node gulp webserver