/**
* Game.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    listPlayers: {
      collection: 'user',
      required: true
    },
    listChar: {
      collection: 'character',
      required: true
    },
    scenario: {
      model: 'scenario',
      required: false
    }

  }
};

