const mongoose = require("mongoose");

const imsAlertSchema = new mongoose.Schema({
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: [true, "Mecdicine ID is required"]
    },
    type: {
        type: String,
        enum: ["low-stock", "expiry", "near-expiry"],
        required: [true, "Alert type is required"]
    },
    message: {
        type: String,
        required: [true, "Alert message is required"]
    },
    resolved: { // alerts say active until manually resolved
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// indexing 
imsAlertSchema.index({medicineId: 1}); 
imsAlertSchema.index({createdAt: -1});

module.exports = mongoose.model("IMS_Alert", imsAlertSchema);
