const async =  require('async')
let query = {}

function feature(req, level_id) {
    let arrFeature = level_id.split(',')

    return arrFeature.map(id => {
        query.feature_id = {
            where: { id: id },
            attributes: ['feature_id'],
        }
        return req.APP.models.mysql.feature.findOne(query.feature_id).then((result) => {
            if (!result) return 'NOT_FOUND'
            
            return result.feature_id;
        }).catch((err) => {
            return err
        })
    })
}

function can(req, role, cb) {
    async.waterfall([
        function checkingCondition(cb) {
            if (req.auth && req.auth.user_level) {         
                cb(null, req.auth.user_level)
            } else if (req.body.user_id) {
                query.level_id = {
                    where: { user_id: req.body.user_id },
                    attributes: ['level_id'],
                    include: 'user_level'
                }

                req.APP.models.mysql.user.findOne(query.level_id)
                    .then((result) => {
                        if (!result.level_id) throw new Error('LEVEL_EMPTY')

                        let level_previledge = result.user_level.level_previledge
                        let mapFeature = feature(req, level_previledge)

                        Promise.all(mapFeature).then((result) => cb(null, result))
                            .catch((err) => {
                                throw new Error(err)
                            });
                    }).catch((err) => {
                        if (err.message == 'LEVEL_EMPTY') {
                            cb(null, { granted: true })
                        } else {
                            return cb({
                                code: 'GENERAL_ERR',
                                message: err.message
                            })
                        }
                    });
            } else {
                cb(null, { granted: true })
            }
        }
    ], function (err, permission) {
        if (err) return cb(err)
        if (permission.granted || permission.indexOf(role) >= 0) {
            return cb(null, { granted: true })
        }

        return cb(null, { granted: false })
    });
}

module.exports = {
    can: can,
    feature: feature
};