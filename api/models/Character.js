/**
* Character.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string'
    },
    biography: {
      type: 'string'
    },
    life: {
      type: 'integer'
    },
    actionLeft: {
      type: 'integer'
    },
    user: {
      model: "user"
    },

    mainHand: {
      model: 'weapon'
    },
    offHand: {
      model: 'weapon'
    },
    talents: {
      collection: 'talent',
      via: 'ownersTalent'
    },
    experience: {
      type: 'integer'
    }

  }
};

