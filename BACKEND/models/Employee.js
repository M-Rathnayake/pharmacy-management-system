const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employee_id: {
        type: String,
        required: true,
        unique: true,
        default: () => `EMP${Date.now()}${Math.floor(Math.random() * 1000)}`
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['male', 'female', 'other']
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    hireDate: {
        type: Date,
        required: [true, 'Hire date is required'],
        default: Date.now
    },
    basicSalary: {
        type: Number,
        required: [true, 'Basic salary is required'],
        min: [0, 'Salary cannot be negative']
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, 'ZIP code is required'],
            match: [/^\d{6}$/, 'Please enter a valid 6-digit ZIP code']
        }
    },
    emergencyContact: {
        name: {
            type: String,
            required: [true, 'Emergency contact name is required'],
            trim: true
        },
        relationship: {
            type: String,
            required: [true, 'Relationship is required'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Emergency contact phone is required'],
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for faster queries
employeeSchema.index({ email: 1 });
employeeSchema.index({ employee_id: 1 });
employeeSchema.index({ department: 1 });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;