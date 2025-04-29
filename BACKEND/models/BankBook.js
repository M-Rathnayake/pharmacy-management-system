const mongoose= new require('mongoose');

//defining a new collection(schema)
const bankBookSchema=new mongoose.Schema({
    bankbook_id:{type:mongoose.Schema.Types.ObjectID,required:true},
    date:{type:Date,required:true},
    description:{type:String,required:true},
    voucher_no:{type:Number},
    deposists:{type:Number},
    withdrawal:{type:Number},
    balance:{type:Number,required:true},
})

const BankBook = new mongoose.model('BankBook',bankBookSchema);
module.exports=BankBook;
