const { SmartThingsClient, BearerTokenAuthenticator } = require('@smartthings/core-sdk')
const lib = require('./lib.js');
const express = require("express");
const app = express();
const PAT = 'd2856d93-cb36-46e2-a49f-c9a4b4b166e9';
const PORT = 3344;
const client = new SmartThingsClient(new BearerTokenAuthenticator(PAT))
// const client = new SmartThingsClient(new BearerTokenAuthenticator(process.env.PAT))

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});


let deviceList = [];
let sensorList = [];

app.get("/devices", (request, response) => {
    // express helps us take JS objects and send them as JSON
    client.devices.list().then(devices => {
        console.log('/devices devices.length:', devices.length)
        response.json(devices);
    });
});

async function fetchData() {
    lib.init().then(result => {
        console.log('lib.init finished result.length:', result.length);
        deviceList = result;
        lib.listOfContactSensors(result).then(async list => {
            sensorList = list;
            console.log('sensorList.length:', sensorList.length);
            let sensorsInfo = await lib.checkDoorsAndWindows(sensorList);
            console.log('sensorsInfo:', sensorsInfo);
        })
    })

}

const listener = app.listen(PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
    fetchData().then(() => {
        console.log('fetchData finished');
    });
});
