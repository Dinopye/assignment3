const http = require('http');
const url = require('url');
const path = require('path');
const sendFile = require('./sendFile');

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
	let obj_url = url.parse(req.url,true);
	switch (obj_url.pathname) {
		case "/":
			const index_path = path.join(__dirname, 'public_html', 'index.html');
			sendFile(index_path, res);
			break;
		case "/schedule":
			schedule(obj_url.query,res);
			break;
		case "/cancel":
			cancel(obj_url.query,res);
			break;
		case "/check":
			check(obj_url.query,res);
			break;
		default:
			const file_path = path.join(__dirname, 'public_html', obj_url.pathname);
			sendFile(file_path, res);
	}
});

function schedule(qObj, res) {

	if (!validate_parameters(qObj, ['name', 'day', 'time'])) {
		sendError(res, 400, "Missing required parameters: name, day, time");
		return;
	}

	if (!availableTimes[qObj.day]) {
		sendError(res, 400, "Invalid weekday");
		return;
	}
	
	const timeIndex = availableTimes[qObj.day].indexOf(qObj.time);
	if (timeIndex === -1) {
		send_response(res, 200, "Appointment not available");
		return;
	}

	availableTimes[qObj.day].splice(timeIndex, 1);
	
	appointments.push({
		name: qObj.name,
		day: qObj.day,
		time: qObj.time
	});

	send_response(res, 200, "Appointment reserved");
}

function cancel(qObj, res) {

	if (!validate_parameters(qObj, ['name', 'day', 'time'])) {
		sendError(res, 400, "Missing required parameters: name, day, time");
		return;
	}
	
	const appointment_index = appointments.findIndex(appt => 
		appt.name === qObj.name && 
		appt.day === qObj.day && 
		appt.time === qObj.time
	);

	if (appointment_index === -1) {
		send_response(res, 200, "Appointment not found");
		return;
	}

	const canceled_apt = appointments.splice(appointment_index, 1)[0];

	if (!availableTimes[canceled_apt.day]) {
		availableTimes[canceled_apt.day] = [];
	}
	
	availableTimes[canceled_apt.day].push(canceled_apt.time);
	availableTimes[canceled_apt.day].sort();
	send_response(res, 200, "Appointment has been canceled");
}

function check(qObj, res) {

	if (!validate_parameters(qObj, ['day', 'time'])) {
		sendError(res, 400, "Missing required parameters: day, time");
		return;
	}

	if (availableTimes[qObj.day] && availableTimes[qObj.day].includes(qObj.time)) {
		send_response(res, 200, "Time is available");
	} else {
		send_response(res, 200, "Time is not available");
	}
}

function send_response(response, status_code, message) {
	response.writeHead(status_code, {'content-type': 'text/plain'});
	response.write(message);
	response.end();
}

function sendError(response, status, message) {
	send_response(response, status, message);
}

function validate_parameters(qObj, required_parameters) {
	for (let param of required_parameters) {
		if (!qObj[param]) {
			return false;
		}
	}
	return true;
}

function valid_day_time(day, time) {
	return availableTimes[day] && availableTimes[day].includes(time);
}

serverObj.listen(80,function(){console.log("listening on port 80")});
