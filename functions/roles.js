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
    let response = {}
    query.level_id = {
        where: { user_id: req.auth.user_id },
        attributes: ['level_id'],
        include: 'user_level'
    }

    req.APP.models.mysql.user.findOne(query.level_id)
    .then((result) => {
        if (!result.level_id) throw new Error('LEVEL_EMPTY')

        let level_previledge = result.user_level.level_previledge
        let mapFeature = feature(req, level_previledge)

        Promise.all(mapFeature).then((result) => {
            (result.indexOf(role) >= 0) ? response.granted = true : response.granted = false;

            return cb(null, response);
        }).catch((err) => {
            throw new Error(err)
        });
    }).catch((err) => {
        if (err.message == 'LEVEL_EMPTY') {
            return cb(null, { granted: true });
        }

        return cb({
            code: 'GENERAL_ERR',
            message: err.message
        })
    });
}

module.exports = {
    can: can,
    feature: feature
};