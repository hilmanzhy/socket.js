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

exports.isToday = function (datetime) {
    let today = moment()
    let params = moment(datetime)

    if (today.year() != params.year()) return false
    if (today.month() != params.month()) return false
    if (today.date() != params.date()) return false
    
    return true
}

exports.timeDiff = function (start, end, unit) {
    let startTime = moment(start);
    let endTime = moment(end);
    let duration = moment.duration(endTime.diff(startTime)).as(unit);
    
    return duration.toFixed()
}

function hmsToSeconds(hms) {
    let split = hms.split(':')
    let toSeconds = split[0]*3600 + split[1]*60 + split[2]

    return toSeconds
}

function secondsToHMS(seconds) {
    
}