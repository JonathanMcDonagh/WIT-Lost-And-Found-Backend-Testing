let mongoose = require('mongoose');

let LostAndFoundSchema = new mongoose.Schema({
        studentid : Number,
        name : String,
        WITBuilding : String,
        WITRoom : String,
        lostitem : String,
        likes: {type: Number, default: 0}
    },
    { collection: 'items' });

module.exports = mongoose.model('Item', LostAndFoundSchema);

