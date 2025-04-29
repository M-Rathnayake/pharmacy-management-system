const mongoose= new require('mongoose');

const pettyCashSchema=new mongoose.Schema({
    petty_id:{type:String,required:true},
    description:{type:String,required:true},
    receipt_no:{type:String,required:true},
    transaction_type:{type:String,required:true},
    date:{type:String,required:true},
    amount:{type:Number,required:true}
});

const pettyCash=new mongoose.model('pettyCash',pettyCashSchema);
module.exports=pettyCash;