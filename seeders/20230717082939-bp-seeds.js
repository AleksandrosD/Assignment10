'use strict';
const bcrypt = require("bcryptjs");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "user",
      [
        {
          name: "Aleksandros",
          lastName:"Doci",
          email: "foksi.dog@live.com",
          createdAt: new Date(),
          updatedAt: new Date(),
          password: await bcrypt.hash("password", 10)
        },
      ],
      {}
    )
    const users = await queryInterface.sequelize.query(`SELECT id FROM "user"`);
    const uId = users[0][0].id;

    await queryInterface.bulkInsert(
      "post",
      [
        {
          postName: "Alex",
          postURL:"dsnbhfvudshbinoubvyuhbjnsdibhucjindisbvhudbscjnjcbscnhb",
          createdAt: new Date(),
          updatedAt: new Date(),
          UserId:uId,
        },
      ],
      {}
    );
    const post = await queryInterface.sequelize.query(`SELECT id FROM post`);
    const pId = post[0][0].id;

   

    await queryInterface.bulkInsert(
      "comments",
      [
        {
          comentContent: "Hello World",
          createdAt: new Date(),
          updatedAt: new Date(),
          UserId:uId,
          PostId:pId,
        },
      ],
      {}
    );

   
  

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("user", null, {});
    await queryInterface.bulkDelete("comments", null, {});
    await queryInterface.bulkDelete("post", null, {});
  }
};
