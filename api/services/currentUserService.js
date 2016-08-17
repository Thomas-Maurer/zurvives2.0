exports.getCurrentUser = function (idUser, callback) {
  User.findOne({id: idUser})
      .exec(function (err, user) {
        delete user.password;
        callback(user);
      })
};
