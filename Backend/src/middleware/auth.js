const jwt = require('jsonwebtoken')
const {
    logStep,
    logWarn,
} = require('../utils/logger')

module.exports = function auth(req, res, next) {
    logStep('Auth middleware checking token', {
        method: req.method,
        originalUrl: req.originalUrl,
        path: req.path,
    })

    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logWarn('Auth failed - no bearer token', {
            method: req.method,
            originalUrl: req.originalUrl,
        })
        return res.status(401).json({ message: 'Authentication required.' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        logStep('Auth successful', {
            email: decoded.email,
            method: req.method,
            originalUrl: req.originalUrl,
        })
        req.user = decoded
        next()
    } catch (error) {
        logWarn('Auth failed - invalid token', {
            message: error.message,
            method: req.method,
            originalUrl: req.originalUrl,
        })
        return res.status(401).json({ message: 'Invalid or expired token.' })
    }
}
