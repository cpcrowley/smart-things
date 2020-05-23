// define variables that reference elements on our page
const deviceList = document.getElementById("devices");
const addBootAlert = document.getElementById("add-boot-alert");

addBootAlert.append(`<div class="alert alert-danger" role="alert">
A simple danger alert—check it out!
</div>`);

// a helper function that creates a list item for a given dream
function appendNewDevice(device) {
    const newListItem = document.createElement("span");
    newListItem.innerText = device.label;
    deviceList.appendChild(newListItem); 
}

// fetch the initial list of dreams
fetch("/devices")
    .then(response => response.json()) // parse the JSON from the server
    .then(devices => {
        // remove the loading text
        deviceList.firstElementChild.remove();

        // iterate through every device and add it to our page
        devices.forEach(appendNewDevice);

    });
