/**
* Weapon.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    damage: {
      type: 'integer'
    },
    reload: {
      type: 'boolean'
    },
    oneHand: {
      type: 'boolean'
    },
      ownersMainHand: {
          collection: 'Character',
          via: 'mainHand'
      },
      ownersOffHand: {
          collection: 'Character',
          via: 'offHand'
      }
  }
};

