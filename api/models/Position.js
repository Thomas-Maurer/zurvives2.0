/**
* Position.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    x: {
      type: 'integer'
    },
    y: {
      type: 'integer'
    },
    Zone: {
      type: 'string'
    },
    charPos: {
      model: 'character',
      unique: true
    }
  }
};
