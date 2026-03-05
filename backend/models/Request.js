const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({

  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  editorId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  service:String,
  description:String,
  budget:Number,

  status:{
    type:String,
    default:"PENDING_QUOTE"
  }

},{timestamps:true});

module.exports =
mongoose.model("Request",RequestSchema);