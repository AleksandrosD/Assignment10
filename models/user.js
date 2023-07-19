'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Comments),
      this.hasMany(models.Post)
    }
  }
  User.init({
    name: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user'
  });
  return User;
};