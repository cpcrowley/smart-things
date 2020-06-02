//*-----------------------------------------------------------------------------
//* Do initial setup
//*-----------------------------------------------------------------------------
const rowOfDevices = document.getElementById("rowOfDevices");
var deviceList = [];
var contactSensorList = [];
var batteryList = [];
var lightList = [];
var switchList = [];
var tempList = [];
var waterSensorList = [];
var alarmList = [];
var otherDevicesList = [];
var idToDevice = {};
var idToLabel = {};

//*-----------------------------------------------------------------------------
//* make names shorter
//*-----------------------------------------------------------------------------
var encodeLabelTable = {
    // Temps
    'Backyard': 'Backyard',
    'Front Porch Temp': 'Porch',
    'Front Screen': 'Front Screen',
    'Leak Crawl Space': 'Crawl Space',
    'Shed': 'Shed',
    // Lights
    'Lamp Back': 'Back Room',
    'Lamp Couch': 'Couch',
    'Lamp Living East': 'Living Window',
    'Lamp Wyn 1': 'Wynette 1',
    'Lamp Wyn 2': 'Wynette 2',
    // Batteries
    'Leak dishwasher': 'Dishwasher',
    'Bath Small North': 'Bath Small',
    'Leak washing machine': 'Washer',
    'Leak Water Heater': 'Water Heater',
    'Z-Wave Water Sensor': 'Water Sensor',
    'Living East Right': 'Living East R',
    'Living East Left': 'Living East L',
    'Bath Big East': 'Bath Big',
    'Back East Right': 'Back East R',
    'Back East Left': 'Back East L',
    // Alarms
    'xxxxx': 'xxxxx',
    'xxxxx': 'xxxxx',
    'xxxxx': 'xxxxx',
    'xxxxx': 'xxxxx',
}

//*-----------------------------------------------------------------------------
//* look up names in the above table.
//*-----------------------------------------------------------------------------
function encodeLabel(label) {
    let codedLabel = encodeLabelTable[label];
    if (codedLabel && codedLabel != label) {
        console.log(`${label} --> ${codedLabel}`)
        return codedLabel;
    }
    return label;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
var currentTabButton;
let loadingIgnoreButtons = false;

//*-----------------------------------------------------------------------------
//* Fetch the device list
//*-----------------------------------------------------------------------------
fetch('/devices').then(response => {
    return response.json();
}).then(devicesInfoList => {
    deviceList = devicesInfoList;
    deviceList.forEach(device => {
        idToDevice[device.deviceId] = device;
        device.label = encodeLabel(device.label);
        idToLabel[device.deviceId] = device.label;

        let deviceOnAList = false;
        let capIdList = device.capIdList;
        if (capIdList.includes('contactSensor')) {
            contactSensorList.push(device);
            deviceOnAList = true;
        }
        if (capIdList.includes('battery')) {
            batteryList.push(device);
            deviceOnAList = true;
        }
        if (capIdList.includes('light')) {
            lightList.push(device);
            deviceOnAList = true;
        } else if (capIdList.includes('alarm')) {
            alarmList.push(device);
            deviceOnAList = true;
        } else if (capIdList.includes('switch')) {
            switchList.push(device);

            deviceOnAList = true;
        }
        if (capIdList.includes('waterSensor')) {
            waterSensorList.push(device);
            deviceOnAList = true;
        }
        if (capIdList.includes('temperatureMeasurement')) {
            tempList.push(device);
            deviceOnAList = true;
        }
        if (!deviceOnAList) {
            otherDevicesList.push(device);
        }
    });

    let byLabel = (a, b) => a.label.localeCompare(b.label);
    contactSensorList.sort(byLabel);
    batteryList.sort(byLabel);
    lightList.sort(byLabel);
    alarmList.sort(byLabel);
    waterSensorList.sort(byLabel);
    tempList.sort(byLabel);
    otherDevicesList.sort(byLabel);
    console.log('lists completed');

    tempButton.click();
    currentTabButton = tempButton;
}).catch(error => {
    console.log('****** fetch call then block ERROR', error);
});

let cellIndexList = [];


//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
//* Format of "deviceList", "tempList", etc List of these items:
//* postData(data): data: { idList: array of items like deviceListItem }
var deviceListItem = {
    capIdList: ["battery", "contactSensor", "configuration", "sensor"],
    deviceId: "1399abd4-736d-4f6f-b565-68bf6ed04907",
    label: "Front Door",
    name: "Z-Wave Door/Window Sensor",
}
//***** return from postData: List of items like this
var postDataReturnItem = {
    device: deviceListItem,
    status: {
        battery: 50,
        contactSensor: "closed",
        temp: "93&deg;F",
    }
}

//*-----------------------------------------------------------------------------
//* General: statusToHtml
//*----------------------------------------- -----------------------------------
function cellContents(device, className, value) {
    return `<span class="italic">${encodeLabel(device.label)}</span>
    <span class="${className}">${value}</span>`;
}
function statusToHtml(device, value, className, background, kindIndex) {
    let id = device.deviceId;
    let label = device.label;
    let contents = `<span class="italic">${label}</span>
    <span class="${className}">${value}</span>`;
    let cellIndex = cellIndexList.length;
    cellIndexList.push(id);
    return `
<div id="cell${cellIndex}" class="col deviceCell ${background}"
onclick="onClick(${kindIndex},${cellIndex});">
    ${contents}
</div>
`;
}

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function onClick(kindIndex, cellIndex) {
    let id = cellIndexList[cellIndex];
    let device = idToDevice[id]
    let cell = document.getElementById(`cell${cellIndex}`);

    // let msAtStart = new Date().getTime();
    let devicesInfoList = await postData('/statuses', { idList: [device] });
    // console.log(`/statuses: ${new Date().getTime() - msAtStart} ms`);
    let statusInfo = devicesInfoList[0];
    // console.log('statusInfo: ', statusInfo);
    let value, innerHTML;

    switch (kindIndex) {
        case 1: //temp: read again
            value = statusInfo.status.temp;
            innerHTML =
                cellContents(statusInfo.device, tempClassName(value), value);
            break;
        case 2: //light: toggle and read again
            // cell.innerHTML = contents;
            break;
        case 3: //battery: read again
            // cell.innerHTML = contents;
            break;
        case 4: //switch: toggle and read again
            // cell.innerHTML = contents;
            break;
        case 5: //alarm: toggle and read again
            // cell.innerHTML = contents;
            break;
        case 6: //sensor: read again
            // cell.innerHTML = contents;
            break;
    }
    console.log('innerHTML: ' + innerHTML);
    cell.innerHTML = innerHTML;
}



//*-----------------------------------------------------------------------------
//* temp
//*-----------------------------------------------------------------------------
const tempButton = document.getElementById("tempsButton");
function tempClassName(value) {
    return parseInt(value) > 89 ? 'red' : 'blue';
}
tempButton.addEventListener('click', () => {
    return buttonClickHandler(tempButton, tempList, deviceStatus => {
        let value = deviceStatus.status.temp;
        return statusToHtml(
            deviceStatus.device,
            value,
            tempClassName(value),
            'default-background', 1
        );
    })
});

//*-----------------------------------------------------------------------------
//* lights
//*-----------------------------------------------------------------------------
const lightsButton = document.getElementById("lightsButton");
lightsButton.addEventListener('click', async () => {
    return buttonClickHandler(lightsButton, lightList, deviceStatus => {
        // deviceStatus: {device: deviceInfo, status: { lights: degrees"}}
        let device = deviceStatus.device;
        let value = deviceStatus.status.light;
        let className = value == 'on' ? '&#9728;' : '🚫';
        return statusToHtml(device.deviceId, device.label, value, className,
            value, 2);
    })
});

//*-----------------------------------------------------------------------------
//* batteries
//*-----------------------------------------------------------------------------
function batteriesToContents(label, batteries) {
    return cellContents(label, batteries, color);
}
const batteriesButton = document.getElementById("batteriesButton");
batteriesButton.addEventListener('click', async () => {
    return buttonClickHandler(batteriesButton, batteryList, deviceStatus => {
        // deviceStatus: {device: deviceInfo, status: { battery: pct}}
        let device = deviceStatus.device;
        let value = deviceStatus.status.battery;
        let percent = parseInt(value);
        let className = 'blue';
        if (percent < 50) className = 'red';
        else if (percent < 75) className = 'orange';
        return statusToHtml(device.deviceId, device.label, value, className,
            'default-background', 3);
    })
});

//*-----------------------------------------------------------------------------
//* alarms
//*-----------------------------------------------------------------------------
const alarmsButton = document.getElementById("alarmsButton");
alarmsButton.addEventListener('click', async () => {
    return buttonClickHandler(lightsButton, lightList, deviceStatus => {
        // deviceStatus: {device: deviceInfo, status: { ...}}
        let device = deviceStatus.device;
        let value = deviceStatus.status.alarm;
        let className = value == 'on' ? '🔔' : '🔕';
        return statusToHtml(device.deviceId, device.label, value, className,
            'default-background', 5);
    })
});


//*-----------------------------------------------------------------------------
//* sensors
//*-----------------------------------------------------------------------------
function sensorsToContents(label, sensors) {
    let color = parseInt(sensors) > 89 ? 'red' : 'blue';
    return cellContents(label, sensors, color);
}
function sensorsStatusToHtml(id, label, sensors) {
    let contents = sensorsToContents(label, sensors);
    let html = cell('default-background', 6, id, contents);
    return html;
}
const sensorsButton = document.getElementById("sensorsButton");
sensorsButton.addEventListener('click', async () => {
    return buttonClickHandler(sensorsButton, contactSensorList, statusInfo => {
        // deviceStatus: {device: deviceInfo, status: { contactSensor: "open"}}
        let id = statusInfo.device.deviceId;
        let contactSensor = statusInfo.status.contactSensor;
        let label = statusInfo.device.label;
        // console.log(`sensor ${label} ${contactSensor}`)
        return cell(contactSensor, label, '', 'blue', 6, id);
    })
});


//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
currentTabButton = tempButton;

//*-----------------------------------------------------------------------------
//* from: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//*-----------------------------------------------------------------------------
async function postData(url = '', data = {}) {
    // console.log('postData: call with', data)
    let json = JSON.stringify(data);
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // POST *GET,, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // no-cache *default,, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: json // body data type must match "Content-Type" header
    });
    // console.log('postData: return with', response);
    json = response.json();
    // console.log('postData: return as JSON', json);
    return json; // parses JSON response into native JavaScript objects
}

//*-----------------------------------------------------------------------------
//* button click handler common code.
//*-----------------------------------------------------------------------------
async function buttonClickHandler(button, idList, makeHtml) {
    if (loadingIgnoreButtons) return;
    let msAtStart = new Date().getTime();

    currentTabButton.classList.remove('active');
    button.classList.add('active');
    currentTabButton = button;
    let savedLabel = button.innerHTML;

    loadingIgnoreButtons = true;
    button.innerHTML = 'Loading&hellip;';
    rowOfDevices.innerHTML = `<div class="spinner-border" role="status">
    <span class="sr-only">Loading&hellip;</span>
    </div>`;

    let devicesStatusList = await postData('/statuses', { idList: idList });
    // console.log('postData: return:', devicesInfoList);

    let html = '';
    devicesStatusList.forEach(deviceStatus => {
        deviceStatus.device.label = encodeLabel(deviceStatus.device.label);
        let newHtml = makeHtml(deviceStatus);
        if (newHtml) html += newHtml;
    });
    rowOfDevices.innerHTML = html;

    button.innerHTML = savedLabel;
    loadingIgnoreButtons = false;
    console.log(`Button click: ${new Date().getTime() - msAtStart} ms`);
}
