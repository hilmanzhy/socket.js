
const moment = require('moment');
const async = require('async');
const sequelize = require('sequelize');

exports.reportHistory = ( APP, req, callback ) => {
    let { report_history } = APP.models.mysql;
    let { month } = req.body;

    report_history
        .findAll({
            attributes: ['id','user_id','total_kwh','total_rp','year','month'],
            order: [
                ['created_at','DESC']
            ],
            where: {
                month: { [sequelize.Op.lte]: month },
                year: moment().format('YYYY'),
                user_id: req.auth.user_id
            }
        })
        .then(res => {
            callback( null, {
                code: res.length > 0 ? 'OK' : 'NOT_FOUND',
                message: res.length > 0 ? 'Data ditemukan' : 'Data tidak ditemukan',
                data: res
            });
        })
        .catch(err => {
            console.log(err);
            
            callback({
                code: "ERR_DATABASE",
                message: 'Error database',
                data: JSON.stringify( err )
            });
        });
};