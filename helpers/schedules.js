var db = require("../models");

exports.getSchedules =  function(req, res){
    db.Schedule.find({"author.id": req.user._id})
    .then(function(schedules){
        res.send(schedules);
    })
    .catch(function(err){
        res.send(err);
    });
};
exports.createSchedule =  function(req, res){
    db.Schedule.create(req.body)
    .then(function(newSchedule){
        newSchedule.author.username=req.user.username;
        newSchedule.author.id=req.user._id;
        newSchedule.save();
        console.log("?????????!!!!!!!!"+newSchedule)
        res.json(newSchedule);
        // console.log(newSchedule)
    })
    .catch(function(err){
        res.send(err);
    });
};
exports.getSchedule =   function(req, res){
    db.Schedule.findById(req.params.scheduleId)
    .then(function(foundSchedule){
        res.json(foundSchedule);
    })
    .catch(function(err){
        res.send(err);
    });
};
exports.updateSchedule = function(req, res){
    db.Schedule.findOneAndUpdate({_id: req.params.scheduleId}, req.body, {new: true})
    .then(function(schedule){
        res.json(schedule);
    })
    .catch(function(err){
        res.send(err);
    });
};
exports.deleteSchedule =   function(req, res){
    db.Schedule.remove({_id: req.params.scheduleId})
    .then(function(){
        res.json({message:"deleted."});
    })
    .catch(function(err){
        res.send(err);
    });
};

function isLoggedIn(req, res, next){ //middleware
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


module.exports = exports;