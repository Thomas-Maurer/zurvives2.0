/**
* Item.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string'
    },
    quality: {
      model: 'quality'
    },
    price: {
      type: 'integer'
    },
    description: {
      type: 'string'
    },
    weapon: {
      model: 'weapon'
    },
    effects: {
      collection: 'effect'
    },
    //higher number = better chance to loot the item
    weight: {
      type: 'integer'
    }
  }
};
