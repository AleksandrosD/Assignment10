'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      this.belongsTo(models.User),
      this.hasMany(models.Comments)
    }
  }
  Post.init({
    postName: DataTypes.STRING,
    postURL: DataTypes.STRING,
    UserId:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'post'
    
  });
  return Post;
};