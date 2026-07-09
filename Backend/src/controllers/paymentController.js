const Student = require('../models/Student')
const Payment = require('../models/Payment')
const sheetsService = require('../services/googleSheetsService')
const {
    logInfo,
    logStep,
    logWarn,
    logError,
} = require('../utils/logger')

logInfo('[PAYMENT CONTROLLER] Loaded', {
    controllerPath: require.resolve('./paymentController'),
    sheetsServicePath: require.resolve('../services/googleSheetsService'),
})

exports.getPayments = async (req, res) => {
    try {
        logStep('START getPayments', {
            method: req.method,
            originalUrl: req.originalUrl,
            path: req.path,
        })
        const query = req.query.q || ''
        const search = query.trim()

        const payments = await Payment.find(
            search
                ? {
                    $or: [
                        { studentName: { $regex: search, $options: 'i' } },
                        { rollNumber: { $regex: search, $options: 'i' } },
                        { transactionId: { $regex: search, $options: 'i' } },
                    ],
                }
                : {}
        ).sort({ id: -1 })

        return res.json(payments)
    } catch (error) {
        logError('Get payments error', error)
        return res.status(500).json({ message: 'Failed to fetch payments.' })
    }
}

exports.createPayment = async (req, res) => {
    try {
        logStep('START createPayment', {
            method: req.method,
            originalUrl: req.originalUrl,
            path: req.path,
            body: req.body,
        })

        const { studentId, amount, transactionId, paymentDate, remarks } = req.body

        if (!studentId || !amount || !transactionId || !paymentDate) {
            logWarn('createPayment validation failed', {
                studentId,
                amount,
                transactionId,
                paymentDate,
            })
            return res.status(400).json({ message: 'Student, amount, transaction ID, and payment date are required.' })
        }

        const student = await Student.findOne({ id: Number(studentId) })
        if (!student) {
            logWarn('createPayment student not found', { studentId })
            return res.status(404).json({ message: 'Student not found.' })
        }

        const paymentAmount = Number(amount)
        if (paymentAmount <= 0) {
            logWarn('createPayment invalid amount', { amount: paymentAmount })
            return res.status(400).json({ message: 'Amount must be greater than zero.' })
        }

        logStep('Creating payment document in MongoDB', {
            studentId: student.id,
            rollNumber: student.rollNumber,
            amount: paymentAmount,
        })
        const payment = await Payment.create({
            studentId: student.id,
            studentName: student.name,
            rollNumber: student.rollNumber,
            amount: paymentAmount,
            transactionId,
            paymentDate,
            remarks: remarks || '',
        })
        logStep('Payment saved', {
            paymentId: payment.id,
            studentId: student.id,
            transactionId: payment.transactionId,
        })

        student.amountReceived = Number(student.amountReceived || 0) + paymentAmount
        student.pendingAmount = Math.max(Number(student.totalFees || 0) - student.amountReceived, 0)
        await student.save()
        logStep('Student updated after payment', {
            studentId: student.id,
            amountReceived: student.amountReceived,
            pendingAmount: student.pendingAmount,
        })

        student.lastTransactionId = payment.transactionId
        student.lastPaymentDate = payment.paymentDate
        student.lastPaymentRemarks = payment.remarks

        logStep('Calling syncStudent from createPayment', {
            syncStudentPath: require.resolve('../services/googleSheetsService'),
            rollNumber: student.rollNumber,
        })
        try {
            const syncResult = await sheetsService.syncStudent(student)
            logStep('syncStudent completed for createPayment', syncResult)
        } catch (syncError) {
            logError('Google Sheets sync failed in createPayment', syncError, {
                rollNumber: student.rollNumber,
            })
        }

        logStep('Returning createPayment response', {
            paymentId: payment.id,
            studentId: student.id,
        })
        return res.status(201).json(payment)
    } catch (error) {
        logError('Create payment error', error, { body: req.body })
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Payment already exists.' })
        }
        return res.status(500).json({ message: 'Failed to create payment.', error: error.message })
    }
}

exports.getDashboardStats = async (req, res) => {
    try {
        const students = await Student.find({})
        const totalStudents = students.length
        const totalFees = students.reduce((sum, student) => sum + (Number(student.totalFees) || 0), 0)
        const totalReceived = students.reduce((sum, student) => sum + (Number(student.amountReceived) || 0), 0)
        const totalPending = students.reduce((sum, student) => sum + (Number(student.pendingAmount) || 0), 0)

        return res.json({ totalStudents, totalFees, totalReceived, totalPending })
    } catch (error) {
        logError('Dashboard stats error', error)
        return res.status(500).json({ message: 'Failed to fetch dashboard stats.' })
    }
}
