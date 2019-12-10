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
        phone: Sequelize.INTEGER,
        password: Sequelize.STRING,
        device_key: Sequelize.STRING,
        active_status: Sequelize.INTEGER,
        tdl_id: Sequelize.INTEGER,
        verify_status: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        verify_date: Sequelize.DATE,
        level_id: Sequelize.INTEGER,
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
        },
        token: Sequelize.DOUBLE
    })

    User.associate = function (models) {
        User.belongsTo(models.user_level, { foreignKey: 'level_id' })
        User.belongsTo(models.pricing, { foreignKey: 'tdl_id' })
    }

    return User
}