const app = require('express')(),
	  http = require('http').createServer(app),
      chalk = require('chalk'),
      io = require('socket.io-client');

let socket = io('http://localhost:5005');

socket.emit('handshake', {
    "device_id": "TESTING",
    "user_id": "1",
    "device_ip": "21.0.0.107",
    "device_name": "TESTING",
    "device_type": "0",
    "pin": "1",
    "mac_address": "00:00:00:00:00"
})

http.listen(5555, function() {
    return console.log(chalk.bold.green('\n' +
		'          ((\n' +
		'         ((((       ((((\n' +
		'         ((((  (((  ((((\n' +
		'     #   (((((((((  ((((\n' +
		'    (((( ((((  (((  ((//  ///\n' +
		'(((((((( ((((  ((/  //////////////////\n') +
		chalk.bold.blue(
		'    (((( ((((  ///  //// (///\n' +
		'    ((((/////  /////////  ///\n' +
		'         ////  ///  ////\n' +
		'         ////  ///  ////\n' +
		'         ////        //*\n') +
		chalk.green(
			"     _    _                     _\n" + 
			" ___<_> _| |_ ___ ._ _ _  ___ _| |_ ___\n" + 
			"<_-<| |  | | <_> || ' ' |/ . \\ | | / . \\\n" +
			"/__/|_|  |_| <___||_|_|_|\\___/ |_| \\___/\n") + '\n' +
		chalk.blue(`///// SOCKET CLIENT RUNNING ON PORT:5555 /////`) + '\n'
	);
});