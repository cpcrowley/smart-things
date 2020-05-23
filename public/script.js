// define variables that reference elements on our page
const deviceList = document.getElementById("devices");
const mainContainer = document.getElementById("main-container");
const mainRow = document.getElementById("main-row");

// a helper function that creates a list item for a given dream
function appendNewDevice(device) {
    const newListItem = document.createElement("span");
    newListItem.innerText = device.label;
    deviceList.appendChild(newListItem); 
}

function showDevices(devices) {
    let html = '';
    console.log('showDevices')
    devices.forEach(device => {
        html += `<div class="col deviceCell">${device.label}</div>`;
    })
    console.log('html', html)
    mainRow.innerHTML = html;
}

// fetch the initial list of dreams
fetch("/devices")
    .then(response => response.json()) // parse the JSON from the server
    .then(devices => {
        console.log('/devices returned')
        deviceList.firstElementChild.remove();
        showDevices(devices)
    });
