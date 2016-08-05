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
  _ = require('lodash'),
  config = require('../../config'),
  //The document structure definition
  Schema = Mongoose.Schema;

//Same fields as Parse.com
var GrievanceSchema = new Schema({
  address: String,
  location: {type: [Number], index: '2dsphere', required: true},
  reportedUser: {type: Schema.ObjectId, ref: 'User'}, //Either anonymous-id or user-id
  description: String,
  dateOfReporting: { type: Date, default: Date.now },
  dateOfResolving: Date,
  resolvedUser: { type: Schema.ObjectId, ref: 'User' },
  status: {type: String, default: 'new'},
  tag: {type: String, index: true, required: true},
  moreReportedUsers: [{
    user: {type: Schema.ObjectId, ref: 'User'},
    isUpVoted: {type: String, default: 'yes'} //I added string type instead of boolean for future purpose
  }],
  curlyUrl: String
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

GrievanceSchema
.virtual('curlyUrlSmall')
.get(function () {
  var ext,
    url;
  if (this.curlyUrl) {
    url = this.curlyUrl.split('.');
    ext = url.pop();
    return config.uploadUrl+url.join('').concat('-sm.', ext);
  }
  return this.curlyUrl;
});

GrievanceSchema
.virtual('curlyUrlLarge')
.get(function () {
  var ext,
    url;
  if (this.curlyUrl) {
    url = this.curlyUrl.split('.');
    ext = url.pop();
    return config.uploadUrl+url.join('').concat('-lg.', ext);
  }
  return this.curlyUrl;
});
/**
 * ## Mongoose model for Grievance
 *
 * @param GrievanceSchema - the document structure definition
 *
 */
var Grievance = Mongoose.model('Grievance', GrievanceSchema);

module.exports = Grievance;
