module.exports = function (sequelize, Sequelize) {
    var UserLevel = sequelize.define('user_level', {
        level_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false
        },
        level_name: Sequelize.STRING,
        level_desc: Sequelize.STRING,
        level_previledge: Sequelize.STRING,
    })

    UserLevel.associate = function (models) {
        UserLevel.hasMany(models.user, { foreignKey: 'level_id' })
    }

    return UserLevel
}