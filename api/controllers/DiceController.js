/**
 * DiceController
 *
 * @description :: Server-side logic for managing dice
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	//Need dice number and diceType to roll the dice
	roll: function (req, res) {
		if (!req.isSocket) {
			var diceNumber = req.param['diceNumber'],
					diceType = req.param['diceType'],
					result = 1;

			if(diceNumber !== undefined && diceNumber !== null
				&& diceType !== undefined && diceType !== null)
				{
					for (var i = 0; i < diceNumber; i++) {
						result = result + (Math.floor(Math.random() * diceType) + 1)
					}
				}

				return res.json({result: result});
		}
	}

};
