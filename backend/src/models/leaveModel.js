const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    fromDate: Date,
    toDate: Date,
    reason: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
    
}, {timestamps: true});

module.exports = mongoose.model('Leave', leaveSchema);