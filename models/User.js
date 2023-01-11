const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        publicId: String,
        url: String
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId, //connectin 2 schema
            ref: 'user'
        }
    ],
    followings : [
        {
            type: mongoose.Schema.Types.ObjectId, //connectin 2 schema
            ref: 'user'
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId, //connectin 2 schema
            ref: 'post'
        }
    ]
});

module.exports = mongoose.model('user', userSchema);