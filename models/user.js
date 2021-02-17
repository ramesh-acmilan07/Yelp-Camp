const mongoose = require("mongoose");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        reuired: true,
        unique: true
    }
});

UserSchema.plugin(passportlocalmongoose);

module.exports = mongoose.model("User", UserSchema);