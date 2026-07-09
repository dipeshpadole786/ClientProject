const fs = require('fs')
const path = require('path')

const logPath = path.join(__dirname, '../../backend.log')

function timestamp() {
    return new Date().toISOString()
}

function safeStringify(value) {
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return value

    try {
        return JSON.stringify(value)
    } catch (error) {
        return `[Unserializable: ${error.message}]`
    }
}

function write(line) {
    console.log(line)
    fs.appendFileSync(logPath, line + '\n')
}

function logInfo(message, meta) {
    const suffix = meta === undefined ? '' : ` | ${safeStringify(meta)}`
    write(`[${timestamp()}] [INFO] ${message}${suffix}`)
}

function logStep(message, meta) {
    const suffix = meta === undefined ? '' : ` | ${safeStringify(meta)}`
    write(`[${timestamp()}] [STEP] ${message}${suffix}`)
}

function logWarn(message, meta) {
    const suffix = meta === undefined ? '' : ` | ${safeStringify(meta)}`
    write(`[${timestamp()}] [WARN] ${message}${suffix}`)
}

function logError(message, error, meta) {
    const parts = [`[${timestamp()}] [ERROR] ${message}`]

    if (meta !== undefined) {
        parts.push(`meta=${safeStringify(meta)}`)
    }

    if (error) {
        if (error.message) parts.push(`message=${error.message}`)
        if (error.code !== undefined) parts.push(`code=${error.code}`)
        if (error.status !== undefined) parts.push(`status=${error.status}`)
        if (error.errors !== undefined) parts.push(`apiErrors=${safeStringify(error.errors)}`)
        if (error.stack) parts.push(`stack=${error.stack}`)
    }

    write(parts.join(' | '))
}

function logRequest(message, meta) {
    const suffix = meta === undefined ? '' : ` | ${safeStringify(meta)}`
    write(`[${timestamp()}] [REQUEST] ${message}${suffix}`)
}

module.exports = {
    logInfo,
    logStep,
    logWarn,
    logError,
    logRequest,
    safeStringify,
}
