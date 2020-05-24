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

const sensorsRow = document.getElementById("sensorsRow");

function showDevices(devices) {
    console.log('showDevices')
    let html = '';
    devices.forEach(device => {
        html += `<div class="col deviceCell">${device.label}</div>`;
    })
    sensorsRow.innerHTML = html;
    console.log('html', html)
}

// fetch the initial list of dreams
fetch("/devices")
    .then(response => response.json()) // parse the JSON from the server
    .then(devices => {
        console.log(`/devices returned ${devices.length} devices`);
        let sensorList = listOfContactSensors(devices);
        console.log(`${sensorList.length} contact sensors`);
        showDevices(sensorList)
    });
