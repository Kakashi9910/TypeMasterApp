const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wpm: {
        type: Number,
        required: true
    },
    accuracy: {
        type: Number,
        required: true
    },
    totalErrors: {
        type: Number,
        required: true
    },
    errorWords: [{
        type: String
    }],
    typingDurations: [{
        type: Number
    }],
    duration: {
        type: Number,
        enum: [15, 30],
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WorkFlowSession', sessionSchema);