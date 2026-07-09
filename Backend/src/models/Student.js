const mongoose = require('mongoose')
const {
    logError,
} = require('../utils/logger')

const studentSchema = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        rollNumber: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        className: { type: String, required: true, trim: true },
        parentName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        totalFees: { type: Number, required: true, min: 0, default: 0 },
        amountReceived: { type: Number, default: 0 },
        pendingAmount: { type: Number, default: 0 },
    },
    { timestamps: true }
)

// Pre-validate hook to generate ID
studentSchema.pre('validate', async function () {
    if (this.isNew && !this.id) {
        try {
            const lastStudent = await mongoose.model('Student').findOne().sort({ id: -1 }).lean()
            this.id = lastStudent && lastStudent.id ? lastStudent.id + 1 : 1
        } catch (err) {
            logError('Student ID generation fallback used', err)
            this.id = 1
        }
    }
})

// Pre-save hook to calculate pending amount
studentSchema.pre('save', function () {
    this.amountReceived = Number(this.amountReceived || 0)
    this.pendingAmount = Math.max(Number(this.totalFees || 0) - this.amountReceived, 0)
})

module.exports = mongoose.model('Student', studentSchema)
