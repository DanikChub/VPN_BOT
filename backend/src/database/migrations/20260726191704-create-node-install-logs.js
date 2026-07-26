module.exports = {

  async up(queryInterface, Sequelize){

    await queryInterface.createTable(
        "node_install_logs",
        {

          id:{
            type:Sequelize.INTEGER,
            autoIncrement:true,
            primaryKey:true,
          },


          node_id:{
            type:Sequelize.INTEGER,
            allowNull:false,
          },


          step:{
            type:Sequelize.STRING,
            allowNull:false,
          },


          status:{
            type:Sequelize.STRING,
            allowNull:false,
          },


          message:{
            type:Sequelize.TEXT,
            allowNull:true,
          },


          error:{
            type:Sequelize.TEXT,
            allowNull:true,
          },


          created_at:{
            type:Sequelize.DATE,
            defaultValue:Sequelize.literal("CURRENT_TIMESTAMP"),
          },


          updated_at:{
            type:Sequelize.DATE,
            defaultValue:Sequelize.literal("CURRENT_TIMESTAMP"),
          },


        }
    )

  },


  async down(queryInterface){

    await queryInterface.dropTable(
        "node_install_logs"
    )

  }

};