const express = require('express')
const auth = require('../middleware/auth')
const {
    logInfo,
} = require('../utils/logger')
const {
    getPayments,
    createPayment,
    getDashboardStats,
} = require('../controllers/paymentController')

const router = express.Router()

logInfo('[PAYMENT ROUTES] Loaded', {
    routePath: require.resolve('./paymentRoutes'),
    controllerPath: require.resolve('../controllers/paymentController'),
})

router.get('/', auth, getPayments)
router.post('/', auth, createPayment)
router.get('/dashboard', auth, getDashboardStats)

module.exports = router
