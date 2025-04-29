const mongoose = new require('mongoose');

const salarySchema=new mongoose.Schema({
    employee_id:{type:mongoose.Schema.Types.ObjectId, ref:'Employee',require:true},
    month:{type:String,required:true},
    basicSalary:{type:Number,required:true,ref:'Employee'},
    overtime:{type:Number,default:0},
    epf_etf:{type:Number,default:0},
    net_salary:{type:Number,required:true},
    paymentStatus:{type:String,enum:['Paid','Pending'],default:'Pending'},
    created_At:{type:Date,default:Date.now}
})

const Salary=new mongoose.model('Salary',salarySchema);
module.exports=Salary;