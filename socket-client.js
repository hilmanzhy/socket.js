const app = require('express')(),
	  http = require('http').createServer(app),
      chalk = require('chalk'),
      io = require('socket.io-client');

let socket = io('http://localhost:5005');

socket.emit('handshake', {
    "device_id": "SitamotoDevice-v1_43-688",
    "user_id": "43",
    "device_ip": "20.0.0.28",
    "device_name": "Kamar Depan",
    "device_type": "0",
    "pin": "1",
    "mac_address": "DC:4F:22:4C:89:46"
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