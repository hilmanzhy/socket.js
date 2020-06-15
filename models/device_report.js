module.exports = function (sequelize, Sequelize) {
    var Device_report = sequelize.define('device_report', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false
        },
        user_id: {
            type: Sequelize.STRING
        },
        device_id: Sequelize.STRING,
        pin: Sequelize.INTEGER,
        device_type: Sequelize.INTEGER,
        date: Sequelize.DATE,
        uptime: Sequelize.DOUBLE,
        last_watt: Sequelize.DOUBLE,
        kwh: Sequelize.DOUBLE,
        last_update: Sequelize.DATE,
        is_active: Sequelize.BOOLEAN,
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

    Device_report.associate = function (models) {}

    return Device_report
}