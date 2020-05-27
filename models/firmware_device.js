module.exports = function (sequelize, Sequelize) {
    var firmware_device = sequelize.define('firmware_device', {
        firmware_id: {
            type: Sequelize.STRING,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        path: {
            type: Sequelize.STRING
        },
        description: Sequelize.TEXT,
        device_type: Sequelize.INTEGER,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
    })

    firmware_device.associate = function (models) {}

    return firmware_device;
}