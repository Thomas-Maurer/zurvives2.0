/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  signup: function (req, res) {

  },
  logout: function (req, res) {
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
      return res.redirect('/');

    });
  },
  login: function (req, res) {
// Try to look up user using the provided email address
    User.findOne({
      email: req.param('email')
    }, function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.notFound();

      // Compare password attempt from the form params to the encrypted password
      // from the database (`user.password`)
      require('bcrypt').compare(
        req.param('password'),
        user.password,
        function(error, result){
          console.log(result);
          if (!result) {
            return res.negotiate(err);
          } else {
            // Store user id in the user session
            req.session.me = user.id;

            // All done- let the client know that everything worked.
            return res.ok();
          }
        });
    });

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
    if (req.session.me !== undefined){
      User.findOne({id: req.session.me}).exec(function (err, me){
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
    }else {
      return res.json(null);
    }

  }
	
};

