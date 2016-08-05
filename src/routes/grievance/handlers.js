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
    moment = require('moment'),
    // helper library
    _ = require('underscore'),
    //async library
    async = require('async'),
    //crypto
    crypto = require('crypto'),
    //graphicsmagick library
    gm = require('gm'),
    //fs library
    fs = require('fs'),
    //path library
    path = require('path'),
    // our user in mongodb
    Grievance = require('../../database/models/Grievance');

var internals = {};
/**
 * ## registerUser
 *
 * Encrypt the password and store the user
 */
internals.reportGrievance = function (req, reply) {
  var grievance,
    imageBuffer,
    curlPath,
    momentTime = crypto.createHash('md5').update(moment().unix()+':'+Math.random()).digest("hex"),
    data;

  if (req.payload.curlyUrl) {
    data = req.payload.curlyUrl.uri;

    function decodeBase64Image(dataString) {
      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }

      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');

      return response;
    }

    imageBuffer = decodeBase64Image(data);

    curlPath = path.join(__dirname, 'public', CONFIG.uploadPath, momentTime);
    //create small and large url and upload to uploads folder and save only the path excluding small and large string
    gm(imageBuffer.data).resize(50, 50).write(curlPath + '-sm.jpg', function(err, data) {
      console.log('cool small error', err);
      if (!err) console.log('small image done');
    });
    gm(imageBuffer.data).resize(300, 300).write(curlPath + '-lg.jpg', function(err, data) {
      console.log('cool large error', err);
      if (!err) console.log('large image done');
    });
    req.payload.curlyUrl = CONFIG.uploadPath + momentTime + '.jpg';
  }
  grievance = new Grievance(req.payload);
  grievance.moreReportedUsers = [];

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
       console.log('check this', grievance);
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
  Grievance.find({
    location: {$geoWithin: {$center: [req.query.location, req.query.radius]}}
  }).lean().exec(function(err, grievances) {
    if (err) {
      return reply(Boom.badImplementation(err));
    }
    async.map(grievances, function(grievance, callback) {
      var upVoted;
      grievance.upVotedCount = grievance.moreReportedUsers.length;
      grievance.isUpVoted = 'no';
      if (req.auth.credentials._id.equals(grievance.reportedUser)) {
        delete grievance.moreReportedUsers;
        callback(null, grievance);
      } else {
        upVoted = _.find(grievance.moreReportedUsers, function(mapReportedUser) {
          return mapReportedUser.user.equals(req.auth.credentials._id);
        });

        if (upVoted) {
          grievance['isUpVoted'] = 'yes';
        }
        delete grievance.moreReportedUsers;
        callback(null, grievance);
      }
    }, function(err, result) {
      if (err) {
        return reply(Boom.badImplementation(err));
      }
      reply(result);
    });
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
        reply({});
      });

    }
  });
};


internals.feedbackUpdateGrievance = function(req, reply) {
  var mutate = {};

  if (req.payload.isUpVoted === 'yes') {
    mutate['$push'] = {
      'moreReportedUsers': {
        user: req.payload.user, //have to replace with req.auth.credentials._id
        isUpVoted: 'yes'
      }
    };
  } else {
    mutate['$pull'] = {
      'moreReportedUsers': {
        user: req.payload.user, //have to replace with req.auth.credentials._id
        isUpVoted: 'yes'
      }
    };
  }
  Grievance.findByIdAndUpdate(req.params._id, mutate, {new: true}, function(err, grievance) {
    if (err) {
      return reply(Boom.badImplementation(err));
    }
    reply({
      upVotedCount: grievance.moreReportedUsers.length,
      isUpVoted: req.payload.isUpVoted
    });
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
