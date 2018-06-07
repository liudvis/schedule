var mongoose=require("mongoose");

var scheduleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'name cannot be blank'
    },
    created_date: {
        type: Date,
        default: Date.now
    }, 
    type: {
        type: String,
        required: 'specify between meeting/todo'
    },
    day: {
        type: Number,
        required: 'specify a day'
    },
    meetingStart: {
        type:Number,
    },
    meetingEnd: {
        type:Number,
    },
    author: {
        id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        },
        username: String
    }
});


var Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
