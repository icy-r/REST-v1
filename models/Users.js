const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Added missing import for bcrypt
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true }
});

const userSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    password_hash: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    address: [addressSchema],
    createdAt: { type: Date, default: Date.now }
});

//hashing password
userSchema.methods.setPassword = function(password){
    this.password_hash = bcrypt.hashSync(password, 10);
}

//compare password
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password_hash);
}

module.exports = mongoose.model('User', userSchema);