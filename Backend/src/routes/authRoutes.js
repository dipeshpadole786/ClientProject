const express = require('express')
const {
    logInfo,
} = require('../utils/logger')
const { login } = require('../controllers/authController')

const router = express.Router()

logInfo('[AUTH ROUTES] Loaded', {
    routePath: require.resolve('./authRoutes'),
    controllerPath: require.resolve('../controllers/authController'),
})

router.post('/login', login)

module.exports = router
