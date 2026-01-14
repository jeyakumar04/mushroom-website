const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
    customerId: {
        type: String,
        unique: true,
        default: function () {
            return 'TJP' + Math.random().toString(36).substr(2, 6).toUpperCase();
        }
    },
    name: { type: String, required: true },
    contactNumber: { type: String, required: true, unique: true },
    password: { type: String },
    cycleCount: { type: Number, default: 0 }, // 0-10 cycle
    totalLifetime: { type: Number, default: 0 }, // Permanent history (total pockets)
    totalOrders: { type: Number, default: 0 },
    freePocketsClaimed: { type: Number, default: 0 }, // Total Earned
    rewardsRedeemed: { type: Number, default: 0 }, // Total Given to Customer
    lastNotificationSent: { type: Date },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'customers' });

// Hash password before saving
customerSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Compare password method
customerSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);
