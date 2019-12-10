module.exports = function (sequelize, Sequelize) {
    var Pricing = sequelize.define('electricity_pricing', {
        id          : {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false
        },
        meter_type  : Sequelize.INTEGER,
        allocation  : Sequelize.INTEGER,
        tariff      : Sequelize.STRING,
        range_daya  : Sequelize.STRING,
        rp_lbwp     : Sequelize.DECIMAL(10,2),
        rp_wbp      : Sequelize.DECIMAL(10,2),
        rp_blok3    : Sequelize.DECIMAL(10,2),
        rp_kvrah    : Sequelize.DECIMAL(10,2),
        description : Sequelize.TEXT,
        created_at  : {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updated_at  : {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    })

    Pricing.associate = function (models) {
        Pricing.hasMany(models.user, { foreignKey: 'tdl_id' })
    }

    return Pricing
}