/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  signup: function (req, res) {
    // Create a User with the params sent from
    // the sign-up form --> signup.ejs
    User.create({
          name: req.param('name'),
          email: req.param('email'),
          password: req.param('password')
        }, function userCreated(err, newUser) {
          if (err) {
              sails.log.verbose('Error: ' + err);

            // If this is a uniqueness error about the email attribute,
            // send back an easily parseable status code.
            if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0]
                && err.invalidAttributes.email[0].rule === 'unique') {
              return res.negotiate(err);
            }

            // Otherwise, send back something reasonable as our error response.
            return res.negotiate(err);
          }

          // Log user in
          req.session.me = newUser.id;

          // Send back the id of the new user
          return res.json({
            id: newUser.id
          });
    });
  },
  logout: function (req, res) {
    if (!req.isSocket) {
      // Look up the user record from the database which is
      // referenced by the id in the user session (req.session.me)
      User.findOne({id: req.session.me}, function foundUser(err, user) {
        if (err) return res.negotiate(err);

        // If session refers to a user who no longer exists, still allow logout.
        if (!user) {
          sails.log.verbose('Session refers to a user who no longer exists.');
          return res.redirect('/');
        }

        // Wipe out the session (log out)
        req.session.me = null;

        // Either send a 200 OK or redirect to the home page
        return res.ok();

      });
    }else {
      //Fire an event to the user to logout current user
      sails.sockets.broadcast(sails.sockets.getId(req), 'userLogout', {user: req.session.socketId});

    }
  },
  login: function (req, res) {
    if (!req.isSocket) {
// Try to look up user using the provided email address
      User.findOne({
        email: req.param('email')
      }, function foundUser(err, user) {
        if (err) return res.negotiate(err);
        if (!user) return res.notFound();

        // Compare password attempt from the form params to the encrypted password
        // from the database (`user.password`)
        require('bcryptjs').compare(
          req.param('password'),
          user.password,
          function (error, result) {
            if (!result) {
              return res.negotiate(err);
            } else {
              // Store user id in the user session
              req.session.me = user.id;

              // All done- let the client know that everything worked.
              return res.json({userID: req.session.me});
            }
          });
      });
    }else {
      //Fire an event to the user to load current user data
      sails.sockets.broadcast(sails.sockets.getId(req), 'userLogin', {user: req.session.socketId});
    }
  },
  find: function(req, res) {
    User.find().exec(function(err, users){
      _.each(users, function(user){
        delete user.password;
      });
      return res.json(users);
    });
  },
  me: function(req, res) {
    if (!req.isSocket) {
      sails.log(req.session.me);
      if (req.session.me !== undefined) {
        User.findOne({id: req.session.me})
          .populate('characters')
          .populate('currentGame')
          .exec(function (err, me) {
            if (err) {
              return res.negotiate(err);
            }
            if (!me) {
              return res.json(404, null);
            }
            delete me.password;
            sails.log('Found "%s"', me.email);
            return res.json(me);
          });
      } else {
        return res.ok(null);
      }
    }else {
      //Fire an event to the user to load current user data
      sails.sockets.broadcast(sails.sockets.getId(req), 'userUnauthorized', {message: "You need to log in to access this area"});
    }

  },
  dashboard: function (req, res) {

  }

};
