//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
const rowOfDevices = document.getElementById("rowOfDevices");
const allSensorsButton = document.getElementById("allSensorsButton");
allSensorsButton.addEventListener('click', async () =>
    buttonClickHandler(allSensorsButton, '/sensors', sensor => {
        return `<div class="col deviceCell ${sensor[1]}">${sensor[0]} ${sensor[1]}</div>`;
    }));

const openSensorsButton = document.getElementById("openSensorsButton");
openSensorsButton.addEventListener('click', async () =>
    buttonClickHandler(openSensorsButton, '/sensors', sensor => {
        if (sensor[1] == 'open') {
            return `<div class="col deviceCell open">${sensor[0]} open</div>`;
        }
        return null;
    }));

const batteriesButton = document.getElementById("batteriesButton");
batteriesButton.addEventListener('click', async () =>
    buttonClickHandler(batteriesButton, '/devices', device => {
        let cap0id = device.cap0id;
        let show = cap0id == 'battery';
        if (show) {
           return `<div class="col deviceCell">${device.label}</div>`;
        }
        return null;
    }));

const switchesButton = document.getElementById("switchesButton");
switchesButton.addEventListener('click', async () =>
    buttonClickHandler(switchesButton, '/devices', device => {
        let cap0id = device.cap0id;
        let show = cap0id == 'switch';
        if (show) {
            return `<div class="col deviceCell">${device.label}</div>`;
        }
        return null;
    }));

const tempsButton = document.getElementById("tempsButton");
tempsButton.addEventListener('click', async () =>
    buttonClickHandler(tempsButton, '/devices', device => {
        let cap0id = device.cap0id;
        let show = cap0id == 'temperatureMeasurement';
        if (show) {
            return `<div class="col deviceCell">${device.label}</div>`;
        }
        return null;
    }));

const otherDevicesButton = document.getElementById("otherDevicesButton");
otherDevicesButton.addEventListener('click', async () =>
    buttonClickHandler(otherDevicesButton, '/devices', device => {
        let cap0id = device.cap0id;
        if (!specificDeviceType.includes(cap0id)) {
           return `<div class="col deviceCell">${device.label} ${device.cap0id}</div>`;
        }
        return null;
    }));

let allButtons = [allSensorsButton, openSensorsButton, batteriesButton,
    switchesButton, tempsButton, otherDevicesButton,];
let specificDeviceType =
    ['battery', 'contactSensor', 'switch', 'temperatureMeasurement',]
let currentTabButton = allSensorsButton;
let loadingIgnoreButtons = false;
tempsButton.click();

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
function buttonClickHandler(button, url, makeHtml) {
    if (loadingIgnoreButtons) return;
    currentTabButton.classList.remove('active');
    button.classList.add('active');
    currentTabButton = button;
    let savedLabel = button.innerHTML;

    loadingIgnoreButtons = true;
    button.innerHTML = 'Loading...';
    // rowOfDevices.innerHTML = `Loading ${savedLabel}, please wait...`;
    rowOfDevices.innerHTML = `<div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
    </div>`;
    fetch(url)
        .then(response => response.json())
        .then(devicesInfoList => {
            let html = '';
            devicesInfoList.forEach(sensor => {
                let newHtml = makeHtml(sensor);
                if (newHtml) html += newHtml;
            });
            rowOfDevices.innerHTML = html;
            button.innerHTML = savedLabel;
            loadingIgnoreButtons = false;
        });
}

