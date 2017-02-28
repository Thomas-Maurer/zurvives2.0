/**
* Game.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    guid: {
      type: 'string',
      required: true,
      unique: true
    },
    name: {
      type: 'string',
      required: true
    },
    listPlayers: {
      collection: 'user',
      via: 'currentGame',
      required: true
    },
    listChar: {
      collection: 'character',
      required: true
    },
    scenario: {
      model: 'scenario',
      required: false
    },
    turnof: {
      type: 'string',
      required: true
    },
    maxPlayers: {
      type: 'integer',
      required: true,
      defaultsTo: 5
    },
    password: {
      type: 'string',
      defaultsTo: null
    }

  }
};
