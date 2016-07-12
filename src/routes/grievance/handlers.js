/**
 * # account/handlers.js
 *
 * This handles all the account actions
 *
 *
 */
'use strict';
/**
 * ## Imports
 *
 */
//Boom is an abstraction over http error codes
var Boom = require('boom'),
    // our configuration
    CONFIG = require('../../config'),
    // support for token signing and verification
    JasonWebToken = require('jsonwebtoken'),
    // how we email
    Mailer = require('../../lib/Mailer'),
    // time/date functions
    Moment = require('moment'),
    // helper library
    _ = require('underscore'),
    // our user in mongodb
    Grievance = require('../../database/models/Grievance');

var internals = {};
/**
 * ## registerUser
 *
 * Encrypt the password and store the user
 */
internals.reportGrievance = function (req, reply) {
  var grievance = new Grievance(req.payload);
  //save the user w/ the encrypted password
  grievance.save(function (err, grievance) {
    if (err) {
      reply(Boom.conflict(err));
    } else {
      //Will check this after the grievance report
      // var tokenData = {
      //   id: grievance._id
      // };
      // send an email verification with a JWT token
      // Mailer.sendMailVerificationLink(user,
      //                                 JasonWebToken.sign(tokenData,
      //                                                    CONFIG.crypto.privateKey));

      /** grievance:
       report { _id: 56844c798d4dce65e2b45b6e,
         address: 'Bangalore',
         location: [344.22, 233.33],
         reportedUser: 56899c798cdece65e2b55kce,
         description: 'Having Drianage issue from past 3 days',
         dateOfReporting: '2016-06-12T01:03:22Z',
         status: 'new',
         tag: 'Drianage'
       __v: 0 }
       */

      reply(grievance);
    }
  });
};

/**
 * ## getMyGrievance
 *
 * Get the user grievance based on grievance id
 *
 */
internals.getMyGrievance = function (req, reply) {
  Grievance.findById(req.params._id, function(err, grievance) {
    if (err) {
      return reply(Boom.badImplementation(err));
    }
    reply(grievance);
  });
};

/**
 * ## getAllGrievancesForUser
 *
 * Get the user grievance based on logged-in user id
 *
 */
internals.getAllGrievancesForUser = function (req, reply) {
  Grievance.find({reportedUser: req.auth.credentials._id}, function(err, grievances) {
    if (err) {
      return reply(Boom.badImplementation(err));
    }
    reply(grievances);
  });
};
/**
 * ## updateGrievance
 *
 * Update grievance based on grievance id
 *
 */
internals.updateGrievance = function (req, reply) {
  Grievance.findById(req.params._id, function(err, grievance) {
    if (err) {
      return reply(Boom.badImplementation(err));
    }


    //Provide no indication if user exists
    if (grievance) {
      grievance.description = req.payload.description;

      grievance.save(function(err, updatedGrievance) {
        if (err) {
          return reply(Boom.conflict("Grievance couldn't be saved."));
        }
        reply(updatedGrievance);
      });

    }
  });
};

/**
 * ## deleteGrievance
 *
 * Delete grievance based on grievance id
 *
 */
internals.deleteGrievance = function (req, reply) {
  Grievance.findByIdAndRemove(req.params._id, function(err) {
    if (err) {
      return reply(Boom.badImplementation(err));
    }
    reply({});
  });
};
module.exports = internals;
