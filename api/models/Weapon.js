/**
* Weapon.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    item: {
      model: 'item'
    },
    damage: {
      type: 'integer'
    },
    range: {
      type: 'integer'
    },
    reload: {
      type: 'boolean'
    },
    oneHand: {
      type: 'boolean'
    }
  }
};
