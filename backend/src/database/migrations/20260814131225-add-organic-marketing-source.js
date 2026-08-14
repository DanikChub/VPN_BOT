"use strict";

module.exports = {

  async up(queryInterface) {

    await queryInterface.bulkInsert(
        "marketing_sources",
        [
          {
            code: "organic",
            name: "Органический переход",
            type: "other",
            is_active: true,

            created_at: new Date(),
            updated_at: new Date(),
          },
        ]
    );

  },


  async down(queryInterface) {

    await queryInterface.bulkDelete(
        "marketing_sources",
        {
          code: "organic",
        }
    );

  }

};