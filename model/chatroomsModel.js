
const mongoose = require('mongoose');

const chatroomsSchema = new mongoose.Schema({
    
    groupName: {
        type: String,
        required: true,
        unique: true
    },
    groupDescription: {
        type: String,
        required: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },  // user id
    message: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupMessages'
    }],    // message id
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    isChatroomImageSet : {
        type: Boolean,
        default: true
    },
    chatroomImage: {
        type: String,
        default: "https://api.multiavatar.com/370.svg",
    },

},
    {
        timestamps: true
    }


);

module.exports = mongoose.model("Chatrooms", chatroomsSchema)