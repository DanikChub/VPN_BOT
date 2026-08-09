"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(
      queryInterface,
      Sequelize,
  ) {
    await queryInterface.addColumn(
        "vpn_nodes",
        "display_name",
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
    );

    await queryInterface.addColumn(
        "vpn_nodes",
        "country_code",
        {
          type: Sequelize.STRING(2),
          allowNull: true,
        },
    );

    await queryInterface.addColumn(
        "vpn_nodes",
        "sort_order",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
    );
  },

  async down(
      queryInterface,
  ) {
    await queryInterface.removeColumn(
        "vpn_nodes",
        "sort_order",
    );

    await queryInterface.removeColumn(
        "vpn_nodes",
        "country_code",
    );

    await queryInterface.removeColumn(
        "vpn_nodes",
        "display_name",
    );
  },
};