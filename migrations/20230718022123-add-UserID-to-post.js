'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("post", "UserId", {
      type: Sequelize.INTEGER,
      references: {
        model: "user", // you can use the table name here
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("post", "UserId");
  }
};
