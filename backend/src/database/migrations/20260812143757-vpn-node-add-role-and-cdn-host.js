"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(
      queryInterface,
      Sequelize,
  ) {
    await queryInterface.addColumn(
        "vpn_nodes",
        "role",
        {
          type: Sequelize.ENUM(
              "exit",
              "gateway",
          ),
          allowNull: false,
          defaultValue: "exit",
        },
    );

    await queryInterface.addColumn(
        "vpn_nodes",
        "cdn_host",
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
    );
  },

  async down(
      queryInterface,
  ) {
    await queryInterface.removeColumn(
        "vpn_nodes",
        "cdn_host",
    );

    await queryInterface.removeColumn(
        "vpn_nodes",
        "role",
    );

    await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_vpn_nodes_role";',
    );
  },
};