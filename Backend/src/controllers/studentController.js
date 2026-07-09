const Student = require('../models/Student')
const Payment = require('../models/Payment')
const sheetsService = require('../services/googleSheetsService')
const {
    logInfo,
    logStep,
    logWarn,
    logError,
} = require('../utils/logger')

logInfo('[STUDENT CONTROLLER] Loaded', {
    controllerPath: require.resolve('./studentController'),
    sheetsServicePath: require.resolve('../services/googleSheetsService'),
})

exports.getStudents = async (req, res) => {
    try {
        const query = req.query.q || ''
        const search = query.trim()

        const students = await Student.find(
            search
                ? {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { rollNumber: { $regex: search, $options: 'i' } },
                    ],
                }
                : {}
        ).sort({ id: 1 })

        return res.json(students)
    } catch (error) {
        logError('Get students error', error, {
            query: req.query,
        })
        return res.status(500).json({ message: 'Failed to fetch students.', error: error.message })
    }
}

exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findOne({ id: Number(req.params.id) })
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' })
        }

        return res.json(student)
    } catch (error) {
        logError('Get student by id error', error, { params: req.params })
        return res.status(500).json({ message: 'Failed to fetch student.' })
    }
}

exports.createStudent = async (req, res) => {
    logStep('START createStudent', {
        method: req.method,
        originalUrl: req.originalUrl,
        path: req.path,
        body: req.body,
    })

    try {
        const { rollNumber, name, className, parentName, phone, totalFees, amountReceived, transactionId, paymentDate, remarks } = req.body

        if (!rollNumber || !name || !className || !parentName || !phone || totalFees === undefined || amountReceived === undefined) {
            logWarn('createStudent validation failed', {
                rollNumber,
                name,
                className,
                parentName,
                phone,
                totalFees,
                amountReceived,
            })
            return res.status(400).json({ message: 'All required student fields must be provided.' })
        }

        logStep('Student validated', { rollNumber, name })

        logStep('Creating student document in MongoDB', {
            rollNumber,
            name,
        })

        const student = await Student.create({
            rollNumber,
            name,
            className,
            parentName,
            phone,
            totalFees: Number(totalFees),
            amountReceived: Number(amountReceived),
        })

        logStep('Student saved', {
            id: student.id,
            rollNumber: student.rollNumber,
            studentId: String(student._id),
            pendingAmount: student.pendingAmount,
        })

        let paymentRecord = null
        if (Number(amountReceived) > 0) {
            logStep('Creating payment record', {
                studentId: student.id,
                amountReceived: Number(amountReceived),
            })
            paymentRecord = await Payment.create({
                studentId: student.id,
                studentName: student.name,
                rollNumber: student.rollNumber,
                amount: Number(amountReceived),
                transactionId: transactionId || '-',
                paymentDate: paymentDate || new Date().toISOString().slice(0, 10),
                remarks: remarks || '',
            })
            logStep('Payment saved', {
                paymentId: paymentRecord.id,
                transactionId: paymentRecord.transactionId,
                amount: paymentRecord.amount,
            })
        } else {
            logInfo('No payment record created because amountReceived is 0')
        }

        const studentForSync = student.toObject ? student.toObject() : { ...student }
        if (paymentRecord) {
            studentForSync.lastTransactionId = paymentRecord.transactionId
            studentForSync.lastPaymentDate = paymentRecord.paymentDate
            studentForSync.lastPaymentRemarks = paymentRecord.remarks
        }

        logStep('Calling syncStudent', {
            syncStudentPath: require.resolve('../services/googleSheetsService'),
            rollNumber: studentForSync.rollNumber,
        })
        try {
            const syncResult = await sheetsService.syncStudent(studentForSync)
            logStep('syncStudent completed', syncResult)
        } catch (syncError) {
            logError('Google Sheets sync failed in createStudent', syncError, {
                rollNumber: studentForSync.rollNumber,
            })
        }

        logStep('Returning createStudent response', {
            studentId: student.id,
            rollNumber: student.rollNumber,
        })
        return res.status(201).json(student)
    } catch (error) {
        logError('Create student error', error, {
            body: req.body,
        })

        if (error.code === 11000) {
            return res.status(409).json({ message: 'A student with this roll number already exists.' })
        }
        return res.status(500).json({ message: 'Failed to create student.', error: error.message })
    }
}

exports.updateStudent = async (req, res) => {
    try {
        logStep('START updateStudent', {
            method: req.method,
            originalUrl: req.originalUrl,
            path: req.path,
            params: req.params,
            body: req.body,
        })

        const student = await Student.findOne({ id: Number(req.params.id) })
        if (!student) {
            logWarn('updateStudent student not found', { id: req.params.id })
            return res.status(404).json({ message: 'Student not found.' })
        }

        const { rollNumber, name, className, parentName, phone, totalFees, amountReceived } = req.body

        student.rollNumber = rollNumber || student.rollNumber
        student.name = name || student.name
        student.className = className || student.className
        student.parentName = parentName || student.parentName
        student.phone = phone || student.phone
        student.totalFees = Number(totalFees ?? student.totalFees)
        student.amountReceived = Number(amountReceived ?? student.amountReceived)
        await student.save()
        logStep('Student updated in MongoDB', {
            studentId: student.id,
            rollNumber: student.rollNumber,
        })

        logStep('Calling syncStudent from updateStudent', {
            syncStudentPath: require.resolve('../services/googleSheetsService'),
            rollNumber: student.rollNumber,
        })
        try {
            const syncResult = await sheetsService.syncStudent(student)
            logStep('syncStudent completed for updateStudent', syncResult)
        } catch (syncError) {
            logError('Google Sheets sync failed in updateStudent', syncError, {
                rollNumber: student.rollNumber,
            })
        }

        logStep('Returning updateStudent response', {
            studentId: student.id,
            rollNumber: student.rollNumber,
        })
        return res.json(student)
    } catch (error) {
        logError('Update student error', error, { params: req.params })
        return res.status(500).json({ message: 'Failed to update student.' })
    }
}

exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({ id: Number(req.params.id) })
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' })
        }

        await Payment.deleteMany({ studentId: Number(req.params.id) })
        return res.json({ message: 'Student deleted successfully.' })
    } catch (error) {
        logError('Delete student error', error, { params: req.params })
        return res.status(500).json({ message: 'Failed to delete student.', error: error.message })
    }
}
exports.seedInitialData = async () => {
    try {
        const existingStudents = await Student.countDocuments()
        if (existingStudents > 0) return

        const sampleStudents = [
            {
                rollNumber: 'R001',
                name: 'Aarav Sharma',
                className: '10th A',
                parentName: 'Rajesh Sharma',
                phone: '9876543210',
                totalFees: 50000,
                amountReceived: 50000,
            },
            {
                rollNumber: 'R002',
                name: 'Priya Verma',
                className: '9th B',
                parentName: 'Sanjay Verma',
                phone: '9876543211',
                totalFees: 45000,
                amountReceived: 25000,
            },
            {
                rollNumber: 'R003',
                name: 'Rohan Gupta',
                className: '10th A',
                parentName: 'Anil Gupta',
                phone: '9876543212',
                totalFees: 50000,
                amountReceived: 10000,
            },
            {
                rollNumber: 'R004',
                name: 'Sneha Iyer',
                className: '8th C',
                parentName: 'Kumar Iyer',
                phone: '9876543213',
                totalFees: 40000,
                amountReceived: 40000,
            },
            {
                rollNumber: 'R005',
                name: 'Karan Mehta',
                className: '9th B',
                parentName: 'Vikas Mehta',
                phone: '9876543214',
                totalFees: 45000,
                amountReceived: 15000,
            },
        ]

        for (const studentData of sampleStudents) {
            const student = await Student.create(studentData)
            if (student.amountReceived > 0) {
                await Payment.create({
                    studentId: student.id,
                    studentName: student.name,
                    rollNumber: student.rollNumber,
                    amount: student.amountReceived,
                    transactionId: `TXN${student.id.toString().padStart(5, '0')}`,
                    paymentDate: '2026-01-10',
                    remarks: 'Seeded sample payment',
                })
            }
        }
    } catch (error) {
        logError('Seed initial data failed', error)
    }
}
