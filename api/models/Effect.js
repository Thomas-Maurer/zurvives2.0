/**
 * Effect.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    //What the spell will do (like heal 2 life, add 1 point in charisma ...)
    do: {
      type: 'string'
    }

  }
};
