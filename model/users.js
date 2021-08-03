const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username:String,
    hash:String,
    salt:String
});

const UserModel = mongoose.model('user',UserSchema);

const conn = async function(){
    try {
        const connected = await mongoose.connect(process.env.DB_URL,{useNewUrlParser:true,useUnifiedTopology:true});
    console.log("connected");
    } catch (error) {
        console.log(error);
    }
    
}

module.exports = {UserModel:UserModel,UserSchema:UserSchema,connectfunc:conn};