module.exports = function(sequelize, Sequelize) {
    var CityTax = sequelize.define("city_tax", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false
        },
        city: {
            type: Sequelize.STRING,
            unique: true
        },
        rumah_tangga: Sequelize.DECIMAL(6, 3),
        sosial: Sequelize.DECIMAL(6, 3),
        bisnis: Sequelize.DECIMAL(6, 3),
        publik: Sequelize.DECIMAL(6, 3),
        industri: Sequelize.DECIMAL(6, 3),
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
    });

    CityTax.associate = function(models) {
        CityTax.hasMany(models.user, { foreignKey: 'tax_id' })
    };

    return CityTax;
};
