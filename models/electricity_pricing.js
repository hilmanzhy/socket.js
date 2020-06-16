module.exports = function (sequelize, Sequelize) {
    var Electricity_Pricing = sequelize.define('electricity_pricing', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false
        },
        meter_type: Sequelize.INTEGER, 
        allocation: Sequelize.INTEGER, 
        tariff: Sequelize.STRING,
        range_daya: Sequelize.STRING,
        rp_lbwp: Sequelize.DECIMAL,
        rp_wbp: Sequelize.DECIMAL,
        rp_blok3: Sequelize.DECIMAL,
        rp_kvrah: Sequelize.DECIMAL,
        max_kwh: Sequelize.DECIMAL,
        description: Sequelize.TEXT,
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

    Electricity_Pricing.associate = function (models) {}

    return Electricity_Pricing
}