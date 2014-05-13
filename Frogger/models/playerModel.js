var	mongoose = require('./../utils/getMongoose.js').mongoose,
    PlayerSchema	=	mongoose.Schema({
        pseudo	:	String,
        password	:	String,
        victories: Number,
        bestTimeVictory: Number,
        bestTimeWaterLillyCapture: Number,
        defeats: Number


    }),
    PlayerModel = mongoose.model('Player', PlayerSchema);

exports.PlayerModel = PlayerModel;
