const mongoose = new require('mongoose');

const ledgerSchema=new mongoose.Schema({
    transaction_id:{type:mongoose.Schema.Types.ObjectID,required:true},
    account_name:{type:String, required:true},
    transaction_type:{type:String,required:true},
    description:{type:String,required:true},
    date:{type:Date,required:true},
    amount:{type:Number, required:true},
    created_At:{type:Date, required:true}

});

const ledger =new mongoose.model('ledger',ledgerSchema);
module.exports=ledger;