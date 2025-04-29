const mongoose=new require('mongoose');

const employeeSchema=new mongoose.Schema({
    employee_id:{type:String,required:true},
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    email:{type:String,required:true},
    phone:{type:String,required:true},
    position:{type:String,required:true},
    hireDate:{type:String,required:true},
    basicSalary:{type:Number,required:true},
})

const Employee = new mongoose.model('Employee',employeeSchema);
module.exports=Employee;