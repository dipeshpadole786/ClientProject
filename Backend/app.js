require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoutes = require('./src/routes/authRoutes')
const studentRoutes = require('./src/routes/studentRoutes')
const paymentRoutes = require('./src/routes/paymentRoutes')
const { seedAdmin } = require('./src/controllers/authController')
const { testAuth } = require('./src/services/googleSheetsService')
const {
    logInfo,
    logStep,
    logWarn,
    logError,
    logRequest,
} = require('./src/utils/logger')

logInfo('[APP] Loaded backend entry point', {
    appPath: require.resolve('./app'),
    authRoutesPath: require.resolve('./src/routes/authRoutes'),
    studentRoutesPath: require.resolve('./src/routes/studentRoutes'),
    paymentRoutesPath: require.resolve('./src/routes/paymentRoutes'),
    studentControllerPath: require.resolve('./src/controllers/studentController'),
    paymentControllerPath: require.resolve('./src/controllers/paymentController'),
    sheetsServicePath: require.resolve('./src/services/googleSheetsService'),
})

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    logRequest('Incoming request', {
        method: req.method,
        originalUrl: req.originalUrl,
        path: req.path,
    })
    next()
})

app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/payments', paymentRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use((err, req, res, next) => {
    logError('[APP] Unhandled express error', err, {
        method: req.method,
        originalUrl: req.originalUrl,
    })
    return res.status(500).json({ message: 'Internal server error.' })
})

process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason))
    logError('[APP] Unhandled promise rejection', error)
})

process.on('uncaughtException', (error) => {
    logError('[APP] Uncaught exception', error)
})

mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
        logStep('[APP] MongoDB connected')
        await seedAdmin()

        try {
            logStep('[APP] GOOGLE SHEETS STARTUP CHECK')
            await testAuth()
            logStep('[APP] GOOGLE SHEETS READY')
        } catch (error) {
            logError('[APP] Google Sheets authentication failed at startup - sync operations will fail', error)
            logWarn('[APP] Google Sheets integration is not available. Student data will not sync to sheets.')
        }

        app.listen(PORT, () => {
            logStep('[APP] Server running', { port: PORT, url: `http://localhost:${PORT}` })
        })
    })
    .catch((error) => {
        logError('[APP] MongoDB connection failed', error)
        process.exit(1)
    })
