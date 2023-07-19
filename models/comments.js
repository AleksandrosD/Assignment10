'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    static associate(models) {
      this.belongsTo(models.User),
      this.belongsTo(models.Post)
    }
  }
  Comments.init({
    comentContent: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    PostId:DataTypes.INTEGER
    
  }, {
    sequelize,
    modelName: 'Comments',
    tableName: 'comments'
  });
  return Comments;
};