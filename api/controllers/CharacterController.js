/**
 * CharacterController
 *
 * @description :: Server-side logic for managing characters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  create: function (req, res) {
    Character.create({
      name:  req.param('name'),
      biography:  req.param('biography'),
      user:  req.session.me,
      life:  req.param('life'),
      actionLeft:  2,
      experience:  0
    }, function characterCreated(err, newChar) {
      if (err) {
        console.log("err: ", err);
        console.log("err.invalidAttributes: ", err.invalidAttributes);

        // If this is a uniqueness error about the email attribute,
        // send back an easily parseable status code.
        if (err.invalidAttributes && err.invalidAttributes.name && err.invalidAttributes.name[0]
          && err.invalidAttributes.name[0].rule === 'unique') {
          return res.negotiate(err);
        }

        // Otherwise, send back something reasonable as our error response.
        return res.negotiate(err);
      }
      //Get all the stats and give the initial value
      _.forEach(req.param('stats'), function (stat) {
        //Assign a value to a stat
        CharStatsService.setCharStat(newChar.id, stat.id, stat.value);
      });

      // Send back the id of the new char
      return res.json({
        id: newChar.id
      });
    });
  },

  updateLife: function (req, res) {

  }

	
};

