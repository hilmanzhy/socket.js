let query = {}

function getRoute(req, array) {
    return array.map(id => {
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

exports.can = (req, cb) => {
    let response = {}
    query.level_id = {
        where: { user_id: req.auth.user_id },
        attributes: ['level_id'],
        include: 'user_level'
    }

    req.APP.models.mysql.user.findOne(query.level_id)
    .then((result) => {
        if (!result) throw new Error('LEVEL_EMPTY')

        let user_level = result.user_level
        if (user_level.level_previledge == '1') {
            return cb(null, { granted: true })
        }

        let arrFeature = user_level.level_previledge.split(','),
            mapFeature = getRoute(req, arrFeature)

        Promise.all(mapFeature).then((result) => {
            (result.indexOf(req.originalUrl) >= 0) ? response.granted = true : response.granted = false;

            return cb(null, response);
        }).catch((err) => {
            throw new Error(err)
        });        
    }).catch((err) => {
        return cb({
            code: 'GENERAL_ERR',
            message: err.message
        })
    });
}