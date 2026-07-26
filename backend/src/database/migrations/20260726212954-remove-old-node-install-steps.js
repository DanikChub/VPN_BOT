'use strict';

module.exports = {

  async up(queryInterface, Sequelize) {


    await queryInterface.changeColumn(
        'node_install_logs',
        'step',
        {
          type: Sequelize.ENUM(
              'ssh_connect',
              'install_node',
              'install_xray',
              'configure_xray',
              'install_agent',
              'completed',
          ),

          allowNull:false,
        }
    );


  },


  async down(queryInterface, Sequelize) {


    await queryInterface.changeColumn(
        'node_install_logs',
        'step',
        {
          type: Sequelize.STRING,

          allowNull:false,
        }
    );


  },

};