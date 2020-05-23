const { SmartThingsClient, BearerTokenAuthenticator } = require('@smartthings/core-sdk');
const lib = require('./lib.js');

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
const client = new SmartThingsClient(
    new BearerTokenAuthenticator('d2856d93-cb36-46e2-a49f-c9a4b4b166e9'));
var allDevices = null;


//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function turnBackLampOffAndOn() {
    let lampBackInfo = lib.deviceFromLabel('Lamp Back', allDevices);
    let lampBackId = lampBackInfo.deviceId;
    console.log('Turn lamp off');
    await client.devices.executeCommand(lampBackId, lib.lampCommand('off'));
    console.log('Turn lamp on in 1 second');
    setTimeout(() => {
        console.log('Turn lamp on');
        client.devices.executeCommand(lampBackId, lib.lampCommand('on'));
    }, 1000);
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function checkDoorsAndWindows() {

    // let info = lib.deviceFromLabel('Kitchen Door', allDevices);
    // console.log('let item = ' + JSON.stringify(info, null, 4));

    console.log('----- Open and closed switched');
    let sensorTypeName = 'Z-Wave Door/Window Sensor';
    allDevices.forEach(async device => {
        let deviceTypeName = device.deviceTypeName;
        let isContactSensor = false;
        let capabilities = '';
        let components = device.components;
        if (components) {
            let comp0 = components[0];
            let caps = comp0.capabilities;
            if (caps) {
                caps.forEach(cap => {
                    let id = cap.id;
                    capabilities += id + ' ';
                    if (id == 'contactSensor') isContactSensor = true;
                });
            }
        }
        if (isContactSensor) {
            let status = await client.devices.getStatus(device.deviceId);
            let openClosed = status.components.main.contactSensor.contact.value;
            if (openClosed == 'open') openClosed = 'OPEN';
            //let status2 = JSON.stringify(status);
            console.log(`${openClosed}: ${device.label}`);
        }
        
    });
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function main() {
    allDevices = await lib.fetchData(client);
    await turnBackLampOffAndOn();
    await checkDoorsAndWindows();
}

main()

