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
  User.create({email: 'tata@mail.com', password: '123456', name: 'test', points: 4500}).exec(console.log);

  // *-------Create Test Chars --------*
  Character.create({
    name:  'Char1',
    biography:  'Char1Biography',
    user:  1,
    life:  100,
    actionLeft:  2,
    experience:  0
  }).exec(console.log);
  Character.create({
    name:  'Char2',
    biography:  'Char2Biography',
    user:  2,
    life:  100,
    actionLeft:  2,
    experience:  0
  }).exec(console.log);
  Character.create({
    name:  'Char3',
    biography:  'Char3Biography',
    user:  3,
    life:  100,
    actionLeft:  2,
    experience:  0
  }).exec(console.log);

  //* -------- Create Stats --------*
  Stat.create({
    name: 'perception', description: 'chaque points augmente la précision du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'vitality', description: 'chaque points augmente la vitalité du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'speed', description: 'chaque points augmente la capacité de déplacement du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'strength', description: 'chaque points augmente la force du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'intel', description: 'chaque points augmente l\'intelligence du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'dexterity', description: 'chaque points augmente la dextérité du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'willpower', description: 'chaque points augmente la volonté du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'luck', description: 'chaque points augmente la chance du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'agility', description: 'chaque points augmente l\'agilité du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'resistance', description: 'chaque points augmente la resistance physique du personnage'
  }).exec(console.log);
  Stat.create({
    name: 'charisma', description: 'chaque points augmente le charisme du personnage'
  }).exec(console.log);
  User.create({email: 'titi@mail.com', password: '123456', name: 'titi', points: 9900}).exec(console.log);

// *---------- Create Weapons -----------*
Item.create({name: 'Colt 1860', description: 'Old weapon from The American Civil War, use .44 ammo', quality: 1, price: 440, weapon: 1, weight: 10}).exec(console.log);
Weapon.create({item: 1, damage: 2, range: 2, reload: false, oneHand: true}).exec(console.log);;
Item.create({name: 'Colt 45', description: 'Old weapon from The American Civil War, use .45 ammo', quality: 1, price: 640, weapon: 2, weight: 15}).exec(console.log);
Weapon.create({item: 2, damage: 2, range: 2, reload: false, oneHand: true}).exec(console.log);
Item.create({name: 'nothing', description: 'nothing usefull', quality: 0, price: 0, weapon: null, weight: 80}).exec(console.log);
Item.create({name: null, description: null, quality: 0, price: 0, weapon: null, weight: 90}).exec(console.log);

// *---------- Create LootTable -----------*
LootTable.create({name: 'Zombies'}).exec(function(err, lootTable) {
  lootTable.items.add([1,2]);
  lootTable.save();
});

LootTable.create({name: 'NoobZone'}).exec(function(err, lootTable) {
  lootTable.items.add([1,3,4]);
  lootTable.save();
});

Monster.create({name: 'Zombie', hp: 2, damage: 1, actionLeft: 1, LootTable: 1}).exec(console.log);

cb();

};
