// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

const PAT = 'd2856d93-cb36-46e2-a49f-c9a4b4b166e9'
const PORT = 3344

const { SmartThingsClient, BearerTokenAuthenticator } = require('@smartthings/core-sdk')
const client = new SmartThingsClient(new BearerTokenAuthenticator(PAT))
// const client = new SmartThingsClient(new BearerTokenAuthenticator(process.env.PAT))

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});

let list

// send the default array of dreams to the webpage
app.get("/devices", (request, response) => {
    // express helps us take JS objects and send them as JSON
    client.devices.list().then(devices => {
        list = devices
    });
    response.json(list);
});

// listen for requests :)
const listener = app.listen(PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
