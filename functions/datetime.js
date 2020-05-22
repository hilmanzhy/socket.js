const moment = require('moment');

exports.formatHMS = function (datetime) {
    let hours = (datetime.getHours() < 10 ? '0' : '' ) + datetime.getHours()
    let minutes = (datetime.getMinutes() < 10 ? '0' : '' ) + datetime.getMinutes()
    let seconds = (datetime.getSeconds() < 10 ? '0' : '') + datetime.getSeconds()
    
    return [hours, minutes, seconds].join(':')
}

exports.formatYMD = function (datetime) {
    return moment(datetime).format("YYYY-MM-DD")
}

/**
 * Check datetime params is today
 * 
 * @param {datetime} datetime is datetime to compare
 * @return {boolean} is today or not
 */
exports.isToday = (datetime) => moment().isSame(datetime, "day");

/**
 * Different between 2 date with unit
 * 
 * @param {datetime} start is datetime start to compare
 * @param {datetime} end is datetime end to compare
 * @param {string} unit is unit to compare, example : minutes, hours, days
 * @return {number} duration between 2 date based on unit
 */
exports.timeDiff = (start, end, unit) => moment.duration(moment(end).diff(moment(start))).as(unit).toFixed();

function hmsToSeconds(hms) {
    let split = hms.split(':')
    let toSeconds = split[0]*3600 + split[1]*60 + split[2]

    return toSeconds
}

function secondsToHMS(seconds) {
    
}