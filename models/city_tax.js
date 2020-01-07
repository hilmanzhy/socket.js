function toPercent(decimal) {
    return decimal * 100;
}
function toDecimal(percent) {
    return percent / 100;
}

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
        rumah_tangga: {
            type: Sequelize.DECIMAL(6, 3),
            get: function() {
                return toPercent(this.getDataValue("rumah_tangga")) + "%";
            },
            set: function(percent) {
                return this.setDataValue("rumah_tangga", toDecimal(percent));
            }
        },
        sosial: {
            type: Sequelize.DECIMAL(6, 3),
            get: function() {
                return toPercent(this.getDataValue("sosial")) + "%";
            },
            set: function(percent) {
                return this.setDataValue("sosial", toDecimal(percent));
            }
        },
        bisnis: {
            type: Sequelize.DECIMAL(6, 3),
            get: function() {
                return toPercent(this.getDataValue("bisnis")) + "%";
            },
            set: function(percent) {
                return this.setDataValue("bisnis", toDecimal(percent));
            }
        },
        publik: {
            type: Sequelize.DECIMAL(6, 3),
            get: function() {
                return toPercent(this.getDataValue("publik")) + "%";
            },
            set: function(percent) {
                return this.setDataValue("publik", toDecimal(percent));
            }
        },
        industri: {
            type: Sequelize.DECIMAL(6, 3),
            get: function() {
                return toPercent(this.getDataValue("industri")) + "%";
            },
            set: function(percent) {
                return this.setDataValue("industri", toDecimal(percent));
            }
        },
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
        CityTax.hasMany(models.user, { foreignKey: "tax_id" });
    };

    return CityTax;
};
