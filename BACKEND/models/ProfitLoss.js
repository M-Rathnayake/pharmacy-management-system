const mongoose=require('mongoose');

const profitLossSchema = new mongoose.Schema({
   state_id:{type: mongoose.Schema.Types.ObjectId, required:true},
   period:{type:String,required:true},
   revenue:{type:Number,required:true} ,
   expenses:{type:Number,required:true},
   net_Profit:{type:Number,required:true, default:0},
   created_At:{type:Date,default:Date.now}

});

const profitLoss = mongoose.model('profitLoss', profitLossSchema,'profitlosses');

module.exports = profitLoss;