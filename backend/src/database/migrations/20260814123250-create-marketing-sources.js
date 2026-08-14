"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable(
        "marketing_sources",
        {

          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },


          code: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
          },


          name: {
            type: Sequelize.STRING,
            allowNull: false,
          },


          type: {
            type: Sequelize.ENUM(
                "telegram",
                "tiktok",
                "blogger",
                "friend",
                "other",
            ),
            allowNull: false,
            defaultValue: "other",
          },


          is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },


          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal(
                "CURRENT_TIMESTAMP"
            ),
          },


          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal(
                "CURRENT_TIMESTAMP"
            ),
          },

        }
    );

  },


  async down(queryInterface) {

    await queryInterface.dropTable(
        "marketing_sources"
    );

  }
};