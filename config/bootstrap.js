/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

  console.log('Seeding database ....');
  User.create({email: 'toto@mail.com', password: '123456', name: 'test', points: 4500}).exec(console.log);
  User.create({email: 'titi@mail.com', password: '123456', name: 'titi', points: 9900}).exec(console.log);
  Character.create({
    name:  'CharOfToto',
    biography:  'CharOfTotoBiography',
    user:  1,
    life:  100,
    actionLeft:  2,
    experience:  0
  }).exec(console.log);
  cb();
};
