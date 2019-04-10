module.exports = function (sequelize, Sequelize) {
    var User = sequelize.define('users', {
        user_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false
        },
        name: Sequelize.STRING,
        username: Sequelize.STRING,
        email: {
            type:Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
        password: Sequelize.STRING,
        device_key: Sequelize.STRING,
        active_status: Sequelize.INTEGER,
        tdl: Sequelize.INTEGER,
        power: Sequelize.INTEGER,
        action_by: Sequelize.INTEGER,
        ip_address: Sequelize.STRING,
        created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    })

    User.associate = function (models) {}

    return User
}