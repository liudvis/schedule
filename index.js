var express     = require('express'),
    app         = express(),
    port        = process.env.PORT,
    bodyParser  = require("body-parser");
    
var scheduleRoutes = require('./routes/schedules');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
    
app.get('/', function(req, res){
    res.sendFile("index.html");
});

app.use('/api/schedules', scheduleRoutes);
app.listen(port, function(){
    console.log("Server is running on port "+port);
});