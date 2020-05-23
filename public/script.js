// client-side js, loaded by index.html
// run by the browser each time the page is loaded

console.log("hello world :o");

// define variables that reference elements on our page
const deviceList = document.getElementById("devices");


// a helper function that creates a list item for a given dream
function appendNewDevice(device) {
    const newListItem = document.createElement("li");
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
