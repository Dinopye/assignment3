const http = require('http');
const url = require('url');

const availableTimes = {
    Monday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Tuesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Wednesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "4:00", "4:30"], // 3:30 removed (James has it)
    Thursday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Friday: ["1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"], // 1:00 removed (Lillie has it)
};
const appointments = [
    {name: "James", day: "Wednesday", time: "3:30" },
    {name: "Lillie", day: "Friday", time: "1:00" }];

let serverObj =  http.createServer(function(req,res){
	console.log(req.url);
	let urlObj = url.parse(req.url,true);
	switch (urlObj.pathname) {
		case "/schedule":
			schedule(urlObj.query,res);
			break;
		case "/cancel":
			cancel(urlObj.query,res);
			break;
		case "/check":
			check(urlObj.query,res);
			break;
		default:
			sendError(res,400,"Invalid pathname. Use /schedule, /cancel, or /check");

	}
});

function schedule(qObj, res) {
	// Validate required parameters
	if (!validateParams(qObj, ['name', 'day', 'time'])) {
		sendError(res, 400, "Missing required parameters: name, day, time");
		return;
	}

	// Check if the day exists and time is valid
	if (!availableTimes[qObj.day]) {
		sendError(res, 400, "Invalid weekday");
		return;
	}

	// Check if the time exists in available times for that day
	const timeIndex = availableTimes[qObj.day].indexOf(qObj.time);
	if (timeIndex === -1) {
		sendResponse(res, 200, "Appointment not available");
		return;
	}

	// Remove the time from available times
	availableTimes[qObj.day].splice(timeIndex, 1);

	// Add appointment to the appointments array
	appointments.push({
		name: qObj.name,
		day: qObj.day,
		time: qObj.time
	});

	sendResponse(res, 200, "Appointment reserved");
}

function cancel(qObj, res) {
	// Validate required parameters
	if (!validateParams(qObj, ['name', 'day', 'time'])) {
		sendError(res, 400, "Missing required parameters: name, day, time");
		return;
	}

	// Find the appointment
	const appointmentIndex = appointments.findIndex(appt => 
		appt.name === qObj.name && 
		appt.day === qObj.day && 
		appt.time === qObj.time
	);

	if (appointmentIndex === -1) {
		sendResponse(res, 200, "Appointment not found");
		return;
	}

	// Remove appointment from appointments array
	const canceledAppt = appointments.splice(appointmentIndex, 1)[0];

	// Add the time back to available times for that day
	if (!availableTimes[canceledAppt.day]) {
		availableTimes[canceledAppt.day] = [];
	}
	availableTimes[canceledAppt.day].push(canceledAppt.time);
	
	// Sort the times to keep them in order
	availableTimes[canceledAppt.day].sort();

	sendResponse(res, 200, "Appointment has been canceled");
}

function check(qObj, res) {
	// Validate required parameters
	if (!validateParams(qObj, ['day', 'time'])) {
		sendError(res, 400, "Missing required parameters: day, time");
		return;
	}

	// Check if the day exists and time is available
	if (availableTimes[qObj.day] && availableTimes[qObj.day].includes(qObj.time)) {
		sendResponse(res, 200, "Time is available");
	} else {
		sendResponse(res, 200, "Time is not available");
	}
}

// Helper function to send responses
function sendResponse(response, statusCode, message) {
	response.writeHead(statusCode, {'content-type': 'text/plain'});
	response.write(message);
	response.end();
}

// Helper function to send errors
function sendError(response, status, message) {
	sendResponse(response, status, message);
}

// Helper function to validate query parameters
function validateParams(qObj, requiredParams) {
	for (let param of requiredParams) {
		if (!qObj[param]) {
			return false;
		}
	}
	return true;
}

// Helper function to validate day and time
function isValidDayAndTime(day, time) {
	return availableTimes[day] && availableTimes[day].includes(time);
}

serverObj.listen(3000,function(){console.log("listening on port 3000")});
