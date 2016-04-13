exports.setCharStat = function (charOwner, charStat, valueCharStat) {
    CharStats.create({
        charOwner: charOwner,
        charStat: charStat,
        value: valueCharStat
    }, function characterCreated(err, newChar) {
        console.log(err);
        console.log(newChar);
    })
};