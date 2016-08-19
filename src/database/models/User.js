/**
 * # User.js
 *
 * The user document for Mongoose
 *
 */
'use strict';
//Create one anonymous user
/**
 * ## Imports
 *
 */
//Mongoose - the ORM
var Mongoose = require('mongoose'),
    //The document structure definition
    Schema = Mongoose.Schema;

//Same fields as Parse.com
var UserSchema = new Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password:{
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  fbId: Number,
  gId: Number,
  role: {
    type: String,
    default: 'reporter'
  }
});
UserSchema.index({ email: 1 }, { unique: true });
/**
 * ## findUserByIdAndUserName
 *
 * @param id - user _id from Mongodb
 * @param callback - resolve the action
 *
 */
UserSchema.statics.findUserById = function(id, callback) {
  this.findOne({
    _id: id
  }, callback);
};
/**
 * ## findUserByEmail
 *
 * @param email - the user document email field from Mongodb
 * @param callback - resolve the action
 *
 */
UserSchema.statics.findUserByEmail = function(email, callback) {
  this.findOne({
    email: email
  }, callback);
};

/**
 * ## Mongoose model for User
 *
 * @param UserSchema - the document structure definition
 *
 */
var user = Mongoose.model('User', UserSchema);

module.exports = user;
