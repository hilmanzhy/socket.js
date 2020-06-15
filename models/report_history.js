module.exports = function (sequelize, Sequelize) {
    var Report_History = sequelize.define('report_history', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        total_rp: Sequelize.INTEGER,
        total_kwh: Sequelize.INTEGER,
        year: Sequelize.STRING,
        month: Sequelize.STRING,
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

    Report_History.associate = function (models) {}

    return Report_History
}