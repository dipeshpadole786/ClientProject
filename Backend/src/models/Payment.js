const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        studentId: { type: Number, required: true },
        studentName: { type: String, required: true, trim: true },
        rollNumber: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0, default: 0 },
        transactionId: { type: String, trim: true },
        paymentDate: { type: String, required: true },
        remarks: { type: String, default: '' },
    },
    { timestamps: true }
)

paymentSchema.pre('validate', async function () {
    if (this.id) return

    const lastPayment = await mongoose.model('Payment').findOne({}, {}, { sort: { id: -1 } })
    this.id = lastPayment ? lastPayment.id + 1 : 1
})

module.exports = mongoose.model('Payment', paymentSchema)
