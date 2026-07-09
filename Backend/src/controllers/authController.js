const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {
    logInfo,
    logWarn,
    logError,
} = require('../utils/logger')

function getAuthCredentials() {
    return {
        email: process.env.DB_EMAIL || 'teacher@school.com',
        password: process.env.DB_PASSWORD || '',
    }
}

async function validatePassword(inputPassword, storedPassword) {
    if (!storedPassword) {
        throw new Error('DB_PASSWORD is not set in .env')
    }

    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
        return bcrypt.compare(inputPassword, storedPassword)
    }

    return inputPassword === storedPassword
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const authCredentials = getAuthCredentials()

        logInfo('[AUTH] Login attempt received', {
            email,
            configuredEmail: authCredentials.email,
        })

        if (!email || !password) {
            logWarn('[AUTH] Login rejected - missing email or password')
            return res.status(400).json({ message: 'Email and password are required.' })
        }

        if (email !== authCredentials.email) {
            logWarn('[AUTH] Login rejected - email mismatch', {
                email,
                configuredEmail: authCredentials.email,
            })
            return res.status(401).json({ message: 'Invalid email or password.' })
        }

        const isMatch = await validatePassword(password, authCredentials.password)
        if (!isMatch) {
            logWarn('[AUTH] Login rejected - password mismatch', {
                email,
            })
            return res.status(401).json({ message: 'Invalid email or password.' })
        }

        const user = {
            id: 1,
            email: authCredentials.email,
            name: process.env.DB_NAME || 'Teacher Admin',
            role: process.env.DB_ROLE || 'teacher',
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        logInfo('[AUTH] Login successful', {
            email: user.email,
            role: user.role,
        })

        return res.json({
            token,
            user,
        })
    } catch (error) {
        logError('Login error', error, { body: req.body })
        return res.status(500).json({ message: 'Login failed.', error: error.message })
    }
}

exports.seedAdmin = async () => {
    logInfo('[AUTH] seedAdmin skipped - login now uses .env credentials')
}
