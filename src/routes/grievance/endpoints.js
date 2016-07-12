/**
 * # ErrorAlert.js
 *
 * This class uses a component which displays the appropriate alert
 * depending on the platform
 *
 * The main purpose here is to determine if there is an error and then
 * plucking off the message depending on the shape of the error object.
 */
'use strict';
/**
 * ## Imports
 *
 */
//Handle the endpoints
var GrievanceHandlers = require('./handlers'),
    //The static configurations
    // CONFIG = require('../../config'),
    //Joi is Hapi's validation library
    Joi = require('joi'),
    CONFIG = require('../../config');

var internals = {};
/**
 * ## Set the method, path, and handler
 *
 * Note the account/logout requires authentication
 *
 * Note the validation of the account/register parameters
 *
 * Note account/register has same Regex expression as Snowflake client
 */
internals.endpoints = [
  {
    method: 'POST',
    path: '/grievance/report',
    handler: GrievanceHandlers.reportGrievance,
    config: {
      // Include this API in swagger documentation
      tags: ['api'],
      description: 'Report Grievance',
      notes: 'The User report grievance, the email will be sent to resolving authority',
      validate: {
      	payload: {
          //location is required to identify the location
      	  location: Joi.array().required(),
          //tag is required to identify the issue
      	  tag: Joi.string().required(),
          address: Joi.string(),
          description: Joi.string(),
          reportedUser: Joi.string().default(CONFIG.anonymous.id)
      	}
      }
    }
  },
  {
    method: 'POST',
    path: '/grievance/delete/{_id}',
    handler: GrievanceHandlers.deleteGrievance,
    config: {
      // Include this API in swagger documentation
      tags: ['api'],
      description: 'A user can delete his reported grievance',
      notes: 'Once User deletes his grievance, email will be sent to respective authority',
      validate: {
        params: {
          _id: Joi.string().required()
        },
        headers: Joi.object({
          'Authorization': Joi.string()
        }).unknown()
      }
    }
  },
  {
    method: 'GET',
    path: '/grievance/report/{_id}',
    handler: GrievanceHandlers.getMyGrievance,
    config: {
      tags: ['api'],
      description: 'Get the reported grievance',
      notes: 'Get all fields from the grievance report',
      validate: {
        headers: Joi.object({
          'Authorization': Joi.string()
        }).unknown()
      }
    }
  },
  {
    method: 'GET',
    path: '/grievance/reports',
    handler: GrievanceHandlers.getAllGrievancesForUser,
    config: {
      auth: 'token',
      tags: ['api'],
      description: 'Get all grievances for logged-in user',
      notes: 'Reporter can only see his grievances',
      validate: {
        headers: Joi.object({
          'Authorization': Joi.string()
        }).unknown()
      }
    }
  },
  {
    method: 'POST',
    path: '/grievance/report/{_id}',
    handler: GrievanceHandlers.updateGrievance,
    config: {
      // Include this API in swagger documentation
      tags: ['api'],
      description: 'A user can update his reported grievance',
      notes: 'User can only update description',
      validate: {
        params: {
          _id: Joi.string().required()
        },
        headers: Joi.object({
          'Authorization': Joi.string()
        }).unknown()
      }
    }
  }

];


module.exports = internals;
