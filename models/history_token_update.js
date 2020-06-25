module.exports = function (sequelize, Sequelize) {
    var history_token_update = sequelize.define('history_token_update', {
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
        rupiah: Sequelize.INTEGER,
        kwh: Sequelize.DOUBLE,
        tipe: Sequelize.INTEGER,
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

    history_token_update.associate = function (models) {}

    return history_token_update
}