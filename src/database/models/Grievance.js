/**
 * # User.js
 *
 * The user document for Mongoose
 *
 */
'use strict';
/**
 * ## Imports
 *
 */
//Mongoose - the ORM
var Mongoose = require('mongoose'),
    //The document structure definition
    Schema = Mongoose.Schema;

//Same fields as Parse.com
var GrievanceSchema = new Schema({
  address: String,
  location: {type: [Number], index: '2dsphere'/*, required: true*/},
  reportedUser: { type: Schema.ObjectId, ref: 'User'}, //Either anonymous-id or user-id
  description: String,
  dateOfReporting: { type: Date, default: Date.now },
  dateOfResolving: Date,
  resolvedUser: { type: Schema.ObjectId, ref: 'User' },
  status: {type: String, default: 'new'},
  tag: {type: String, index: true/*, required: true*/}
});

/**
 * ## Mongoose model for Grievance
 *
 * @param GrievanceSchema - the document structure definition
 *
 */
var Grievance = Mongoose.model('Grievance', GrievanceSchema);

module.exports = Grievance;
