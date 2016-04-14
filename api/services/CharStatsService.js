exports.setCharStat = function (charID, charStat, valueCharStat) {
    CharStats.create({
        char: charID,
        stat: charStat,
        value: valueCharStat
    }, function characterCreated(err, newChar) {
        console.log(err);
    })
};
