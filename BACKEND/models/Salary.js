const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
    employee_id: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}-\d{2}$/.test(v);
            },
            message: props => `${props.value} is not a valid month format (YYYY-MM)`
        }
    },
    basicSalary: {
        type: Number,
        required: true,
        min: 0
    },
    overtime: {
        type: Number,
        default: 0,
        min: 0
    },
    epf_etf: {
        type: Number,
        default: 0,
        min: 0
    },
    net_salary: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

// Create a compound index for employee_id and month
salarySchema.index({ employee_id: 1, month: 1 }, { unique: true });

// Add validation to ensure net_salary is calculated correctly
salarySchema.pre('save', function(next) {
    const calculatedNet = this.basicSalary + this.overtime - this.epf_etf;
    if (Math.abs(calculatedNet - this.net_salary) > 0.01) { // Allow for small floating point differences
        next(new Error('Net salary does not match the calculation (basic + overtime - deductions)'));
    }
    next();
});

// Add method to calculate net salary
salarySchema.methods.calculateNetSalary = function() {
    return this.basicSalary + this.overtime - this.epf_etf;
};

// Add virtual for total earnings (basic + overtime)
salarySchema.virtual('totalEarnings').get(function() {
    return this.basicSalary + this.overtime;
});

// Add virtual for total deductions
salarySchema.virtual('totalDeductions').get(function() {
    return this.epf_etf;
});

// Ensure virtuals are included when converting to JSON
salarySchema.set('toJSON', { virtuals: true });
salarySchema.set('toObject', { virtuals: true });

const Salary = mongoose.model("Salary", salarySchema);

module.exports = Salary;