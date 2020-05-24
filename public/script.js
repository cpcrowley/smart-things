var listOfContactSensors = (allDevices) => {
    let sensorList = [];
    allDevices.forEach(device => {
        let components = device.components;
        if (components && components.length > 0) {
            let comp0 = components[0];
            let caps = comp0.capabilities;
            if (caps) {
                caps.forEach(cap => {
                    if (cap.id == 'contactSensor') sensorList.push(device);
                });
            }
        }
    });
    return sensorList;
}

const allSensorsRow = document.getElementById("allSensorsRow");
const openSensorsRow = document.getElementById("openSensorsRow");
const otherDevicesRow = document.getElementById("otherDevicesRow");

function showDevices(devices) {
    let html = '';
    devices.forEach(device => {
        html += `<div class="col deviceCell">${device.label}</div>`;
    })
    otherDevicesRow.innerHTML = html;
}
function showSensors(sensorInfo) {
    let html = '';
    sensorInfo.forEach(sensor => {
        html += `<div class="col deviceCell ${sensor[1]}">${sensor[0]} ${sensor[1]}</div>`;
    })
    allSensorsRow.innerHTML = html;
}

fetch("/sensors")
    .then(response => response.json()) // parse the JSON from the server
    .then(sensors => {
        console.log(`/sensors: ${sensors}`);
        showSensors(sensors)
    });
// fetch("/devices")
//     .then(response => response.json()) // parse the JSON from the server
//     .then(devices => {
//         console.log(`/devices returned ${devices.length} devices`);
//         let sensorList = listOfContactSensors(devices);
//         console.log(`${sensorList.length} contact sensors`);
//         showDevices(sensorList)
//     });
