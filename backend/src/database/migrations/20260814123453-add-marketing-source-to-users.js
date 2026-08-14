"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn(
        "users",
        "marketing_source_id",
        {
          type: Sequelize.INTEGER,
          allowNull: true,

          references: {
            model: "marketing_sources",
            key: "id",
          },

          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        }
    );

  },


  async down(queryInterface) {

    await queryInterface.removeColumn(
        "users",
        "marketing_source_id"
    );

  }
};