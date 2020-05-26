const app = require('express')(),
	  http = require('http').createServer(app),
      chalk = require('chalk'),
      io = require('socket.io-client');

let socket = io('http://localhost:5005');

socket.emit('handshake', {
    "device_id": "SitamotoDevice-v1_8-634",
    "user_id": "8",
    "device_ip": "192.168.1.7",
    "device_name": "Wijaya Kost",
    "device_type": "1",
    "pin": "11",
    "mac_address": "b8:27:eb:c8:78:ec"
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