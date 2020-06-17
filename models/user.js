module.exports = function (sequelize, Sequelize) {
    var User = sequelize.define("users", {
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
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
        phone: Sequelize.INTEGER,
        password: Sequelize.STRING,
        device_key: Sequelize.STRING,
        active_status: Sequelize.INTEGER,
        tdl_id: Sequelize.INTEGER,
        tax_id: Sequelize.INTEGER,
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
        token: Sequelize.DOUBLE,
        support_pal_id: Sequelize.INTEGER,
        usage_target: Sequelize.INTEGER,
        notif_token_alert: {
            type: Sequelize.INTEGER,
            get: function() {
                if (!this.getDataValue("notif_token_alert")) return 0;

                return this.getDataValue("notif_token_alert");
            }
        },
        notif_device_disconnected: {
            type: Sequelize.INTEGER,
            get: function() {
                if (!this.getDataValue("notif_device_disconnected")) return 0;

                return this.getDataValue("notif_device_disconnected");
            }
        },
        notif_sensor_status_update: {
            type: Sequelize.INTEGER,
            get: function() {
                if (!this.getDataValue("notif_sensor_status_update")) return 0;

                return this.getDataValue("notif_sensor_status_update");
            }
        },
        notif_device_connected: {
            type: Sequelize.INTEGER,
            get: function() {
                if (!this.getDataValue("notif_device_connected")) return 0;

                return this.getDataValue("notif_device_connected");
            }
        },
        notif_email_login: {
            type: Sequelize.INTEGER,
            get: function() {
                if (!this.getDataValue("notif_email_login")) return 0;

                return this.getDataValue("notif_email_login");
            }
        },
        notif_tax_update: {
            type: Sequelize.INTEGER,
            get: function() {
                if (!this.getDataValue("notif_tax_update")) return 0;

                return this.getDataValue("notif_tax_update");
            }
        },
        notif_update_token: {
            type: Sequelize.INTEGER,
            get: function() {
                if (!this.getDataValue("notif_update_token")) return 0;

                return this.getDataValue("notif_update_token");
            }
        },
        notif_usage_target: {
            type: Sequelize.INTEGER,
            get: function() {
                if (!this.getDataValue("notif_usage_target")) return 0;

                return this.getDataValue("notif_usage_target");
            }
        }
    });

    User.associate = function (models) {
        User.belongsTo(models.user_level, { foreignKey: 'level_id' })
        User.belongsTo(models.pricing, { foreignKey: 'tdl_id' })
        User.belongsTo(models.city_tax, { foreignKey: 'tax_id' })
    }

    return User
}