//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Add the required modules
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Regex for email validation
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const validateEmail = function(email) {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
};


const trainerSchema = mongoose.Schema({
	//Data for local authentication
	local: {
		//login email and password
		email 		 	: { type: String, unique: true, 
                            validate: [validateEmail, 'Please fill a valid email address'],
                            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']},
		password 	 	: String,
		//account info
        isTrainer    	: Boolean,
        name 		 	: String,
        description	 	: String,
        age             : String,
        birthday        : Date,
        address         : [String],
        specialization	: [String],
        image           : String,
        phone           : String,
        rate            : Number,
    //  status          : String,
        gymInfo		    : { type: Schema.Types.ObjectId, ref: 'Gym', unique: true}
	},
	//Data for oauth using facebook
	facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        work         : String,
        timezone     : String,
        about        : String,
        friends      : String,
        education    : String,
        gender       : String,
        profileUrl   : String

    //Data for oauth using gmail or google+
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});

trainerSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

trainerSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.local.password);
};


module.exports = mongoose.model('Trainer', trainerSchema);