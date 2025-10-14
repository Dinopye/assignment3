// Get references to the DOM elements
const nameInput = document.getElementById('name');
const dayInput = document.getElementById('day');
const timeInput = document.getElementById('time');
const resultsDiv = document.getElementById('results');

const scheduleBtn = document.getElementById('scheduleBtn');
const cancelBtn = document.getElementById('cancelBtn');
const checkBtn = document.getElementById('checkBtn');

// Schedule button click event handler
scheduleBtn.addEventListener('click', function() {
    const name = nameInput.value;
    const day = dayInput.value;
    const time = timeInput.value;
    
    // Build the URL with query parameters
    const url = `/schedule?name=${encodeURIComponent(name)}&day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`;
    
    // Send AJAX GET request
    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Display the server response in the results div
            resultsDiv.textContent = data;
        })
        .catch(error => {
            resultsDiv.textContent = 'Error: ' + error.message;
        });
});

// Cancel button click event handler
cancelBtn.addEventListener('click', function() {
    const name = nameInput.value;
    const day = dayInput.value;
    const time = timeInput.value;
    
    // Build the URL with query parameters
    const url = `/cancel?name=${encodeURIComponent(name)}&day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`;
    
    // Send AJAX GET request
    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Display the server response in the results div
            resultsDiv.textContent = data;
        })
        .catch(error => {
            resultsDiv.textContent = 'Error: ' + error.message;
        });
});

// Check Availability button click event handler
checkBtn.addEventListener('click', function() {
    const day = dayInput.value;
    const time = timeInput.value;
    
    // Build the URL with query parameters (no name needed for check)
    const url = `/check?day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`;
    
    // Send AJAX GET request
    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Display the server response in the results div
            resultsDiv.textContent = data;
        })
        .catch(error => {
            resultsDiv.textContent = 'Error: ' + error.message;
        });
});
