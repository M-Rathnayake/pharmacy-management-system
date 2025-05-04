const mongoose = require("mongoose");
const Medicine = require("./Medicine");

const imsTransactionSchema = new mongoose.Schema({
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: [true, "Medicine ID is required"]
    },
    type: {
        type: String,
        enum: ["sale", "restock", "adjustment", "expired-writeoff"],
        required: [true, "Transaction type is required"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"]
    },
    previousStock: Number,
    newStock: Number,
    notes: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// calculating stock values
imsTransactionSchema.pre('save', async function(next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // fetching medicine
        const medicine = await Medicine.findById(this.medicineId).session(session).select("stock");

        if(!medicine) {
            throw new Error("Medicine not found in our Database");
        }

        this.previousStock = medicine.stock;

        switch(this.type) {
            case "restock": 
                this.newStock = medicine.stock + this.quantity;
                break;
            case "sale":
            case "adjustment":
            case "expired-writeoff":
                this.newStock = medicine.stock - this.quantity;
                if(this.newStock < 0) {
                    throw new Error(`Insufficient stock! Current: ${medicine.stock}, Attempted deduction: ${this.quantity}`);
                }
                break;
            default:
                throw new Error("Invalid transaction type");
        }

        await Medicine.findByIdAndUpdate(
            this.medicineId, 
            { $set: { stock: this.newStock }}, 
            { session, new: true }
        );

        await session.commitTransaction();
        next();
    } catch(error) {
        await session.abortTransaction();
        console.error("Transaction failed:", error.message);
        next(error);
    } finally {
        session.endSession();
    }
});

module.exports = mongoose.model("IMS_Transaction", imsTransactionSchema);