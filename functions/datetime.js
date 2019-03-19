const moment = require('moment');

exports.formatHMS = function (datetime) {
    let hours = (datetime.getHours() < 10 ? '0' : '' ) + datetime.getHours()
    let minutes = (datetime.getMinutes() < 10 ? '0' : '' ) + datetime.getMinutes()
    let seconds = (datetime.getSeconds() < 10 ? '0' : '') + datetime.getSeconds()
    
    return [hours, minutes, seconds].join(':')
}

exports.isToday = function (datetime) {
    let today = moment()
    let params = moment(datetime)
    let diff = today.diff(params, 'days')

    if (diff > 0) {
        return false
    }
    
    return true
}

exports.formatYMD = function (datetime) {
    return moment(datetime).format("YYYY-MM-DD")
}

exports.timeDiff = function (start, end) {
    let startTime = moment(start, "HH:mm:ss");
    let endTime = moment(end, "HH:mm:ss");
    let duration = moment.duration(endTime.diff(startTime)).as('minutes');

    return duration.toFixed()
}

function hmsToSeconds(hms) {
    let split = hms.split(':')
    let toSeconds = split[0]*3600 + split[1]*60 + split[2]

    return toSeconds
}

function secondsToHMS(seconds) {
    
}