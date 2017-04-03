const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Trainer = require('../../app/model/trainer');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Serialize user for creating user session/trainer session
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
passport.serializeUser((user,done) => {
	done(null, user.id);
});

// deserialize user
passport.deserializeUser((id, done) => {
	Trainer.findById(id, (err, user) => {
		done(err, user);
	});
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Passport Strategy for creating new Trainer
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
passport.use('local.trainer.signup', new LocalStrategy({

	//Get the username field and password field on req.body
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {

	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//Check if email or password is empty, then validate error using the express-validator module
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    req.checkBody('email', 'Invalid Credentials, Please check email').notEmpty().isEmail();
    req.checkBody('password', 'Password should atleast contain more than six characters').notEmpty().isLength({min:6});
    //Validate Error
    var errors = req.validationErrors();
    //If there's error push the error to messages[index] = error array
    if (errors) {
        var messages = [];
        errors.forEach((error) => {
           messages.push(error.msg);
        });

        //If there's error, create an alert that there's error, if you want to modify flash messages
        //set flash messages error info: req.flash('error', "Invalid Credentials, Please check username or password")
        return done(null, false, req.flash('error', messages));
    }

  
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//A query that will search for an existing trainer in the mongo database, then after everything is validated, create new trainer
	//Find local.email from the database of trainer
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Trainer.findOne({'local.email': email}, (err, user)  => {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'That email is already taken!'});
        }
        //After everything is validated, Create new user
        var newTrainer = new Trainer();

        newTrainer.local.email = email;
        newTrainer.local.password = newTrainer.generateHash(password);
        newTrainer.local.isTrainer = true;

        newTrainer.local.name = req.body.name;
        newTrainer.local.description = req.body.description;
        newTrainer.local.specialization = req.body.specialization;

        newTrainer.save((err, result)  => {
           if (err) {
               return done(err);
           }
           return done(null, newTrainer);
        });
    });
}));


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Passport Strategy for Logging a Trainer
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
passport.use('local.trainer.login', new LocalStrategy({
	//Get the username field and password field on req.body
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//Check if email or password is empty, then validate error using the express-validator module
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    req.checkBody('email', 'Invalid Credentials, Please check email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Credentials, Please check password').notEmpty();
    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });

    //If there's error, create an alert that there's error, if you want to modify flash messages
    //set flash messages error info: req.flash('error', "Invalid Credentials, Please check username or password")  
    return done(null, false, req.flash('error', messages));
    }

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//A query that will search for an existing trainer in the mongo database, then after everything is validated, Log in the user
	//Find local.email from the database of trainer
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Trainer.findOne({'local.email': email}, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'The trainer does not exist. Click sign up to register a trainer.'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Password is invalid, Please check your password and try again.'});
        }
        return done(null, user);
    });
}));