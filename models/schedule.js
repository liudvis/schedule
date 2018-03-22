var mongoose=require("mongoose");

var scheduleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'name cannot be blank'
    },
    complete: {
        type: Boolean,
        default: false
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
    }
});



var Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
