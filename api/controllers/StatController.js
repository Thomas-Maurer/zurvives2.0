/**
 * StatController
 *
 * @description :: Server-side logic for managing stats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getAll: function(req, res) {
        Stat.find().exec(function(err, stats){
            return res.json(stats);
        });
    }
};

