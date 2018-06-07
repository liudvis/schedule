var express = require("express");
var router = express.Router();
var db = require("../models");
var helpers = require('../helpers/schedules');

router.route('/')
    .get(helpers.getSchedules)
    .post(helpers.createSchedule);

router.route('/:scheduleId')
    .get(helpers.getSchedule)
    .put(helpers.updateSchedule)
    .delete(helpers.deleteSchedule);


module.exports=router;