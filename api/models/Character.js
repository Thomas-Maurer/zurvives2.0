/**
* Character.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    biography: {
      type: 'string'
    },
    life: {
      type: 'integer',
      required: true
    },
    actionLeft: {
      type: 'integer',
      required: true
    },
    user: {
      model: 'user',
      required: true
    },
    talents: {
      collection: 'talent',
      via: 'ownersTalent'
    },
    experience: {
      type: 'integer',
      required: true
    },
    inventory: {
      collection: 'item'
    },
    equipment: {
      collection: 'item'
    }

    //todo Add verification for each attribute to avoid errors in DB

  }
};

