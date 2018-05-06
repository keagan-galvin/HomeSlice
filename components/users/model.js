var mongoose = require("mongoose");
var config = require("../../config.json");

var userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    hash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', function (next) {
    var currentDate = new Date();

    //maintain updated
    this.updated_at = currentDate;

    //Pre-insert Tasks
    if (!this.created_at) {
        if (!this.hash)
            next("Invalid password");
        this.created_at = currentDate;
        this.salt = this.methods.genSalt(config.security.saltLength);
        this.hash = this.methods.hashPassword(this.hash, this.salt);
    }
});

userSchema.methods.genSalt = (length) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

userSchema.methods.genHash = (val, salt) => {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(val);
    var value = hash.digest('hex');
    return {
        salt: salt,
        hash: value
    };
}

userSchema.methods.hashPassword = (password) => {
    var salt = genSalt(16);
    return genHash(password, salt);
}

userSchema.methods.validateHash = (password, hash, salt) => {
    return (hash == genHash(password, salt));
}

var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;