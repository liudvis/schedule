var express     = require('express'),
    app         = express(),
    port        = process.env.PORT,
    passport    = require('passport'),
    LocalStrategy = require('passport-local'),
    User        = require("./models/user"),
    flash       = require("connect-flash"),
    bodyParser  = require("body-parser");
    
var scheduleRoutes = require('./routes/schedules');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.use(flash());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "miau miau miau",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //comes from passport local mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
// if there's a flash message, transfer
// it to the context, then clear it
res.locals.message = req.flash("error");
delete req.session.flash;
next();
});

function isLoggedIn(req, res, next){ //middleware
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
    
app.get('/', isLoggedIn, function(req, res){
        console.log("------"+req.user.username);
        User.find({}, function(err){
            if(err){
                console.log(err)
            } else {
                res.render("index.ejs", {currentUser: req.user.username});
            }
        })
});


///////////////////////////////    
//AUTH routes

//register form
app.get("/register", function(req, res){
    res.render('register.ejs');
});
//handle sign up logic
app.post("/register", function(req,  res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.send(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
            });
        }
    });
});
//login  form 
app.get("/login", function(req, res){
    res.render('login.ejs');
});
//login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login",
        // failureFlash: 'Invalid username or password.'
    }), function(req, res){
});
//logout route
app.get("/logout", function(req, res) {
    req.logout();
    req.flash("error", "Logged You Out.");
    res.redirect("login");
});

app.use('/api/schedules', scheduleRoutes);
app.listen(port, function(){
    console.log("Server is running on port "+port);
});