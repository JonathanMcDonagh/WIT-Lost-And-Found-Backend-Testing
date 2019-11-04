let mongoose = require("mongoose")

let userSchema = new mongoose.Schema({
  email : String,
  name : String,
  password : String,
  posts: {type: Number, default: 0}
},
{ collection: "users" })

module.exports = mongoose.model("User", userSchema)

