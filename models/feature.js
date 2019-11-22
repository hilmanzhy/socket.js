module.exports = function (sequelize, Sequelize) {
    var Feature = sequelize.define('features', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false
        },
        feature_id: {
            type: Sequelize.STRING,
            unique: true,
        },
        name: Sequelize.STRING,
        description: Sequelize.STRING,
    })

    Feature.associate = function (models) {}

    return Feature
}