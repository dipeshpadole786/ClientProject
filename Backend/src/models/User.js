const mongoose = require('mongoose')
const {
    logError,
} = require('../utils/logger')

const userSchema = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        name: { type: String, default: 'Teacher' },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: 'teacher' },
    },
    { timestamps: true }
)

// Pre-validate hook to generate ID
userSchema.pre('validate', async function () {
    if (this.isNew && !this.id) {
        try {
            const lastUser = await mongoose.model('User').findOne().sort({ id: -1 }).lean()
            this.id = lastUser && lastUser.id ? lastUser.id + 1 : 1
        } catch (err) {
            logError('User ID generation fallback used', err)
            this.id = 1
        }
    }
})

module.exports = mongoose.model('User', userSchema)
