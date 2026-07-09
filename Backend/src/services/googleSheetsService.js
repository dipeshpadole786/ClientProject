const { google } = require('googleapis')
const path = require('path')
const fs = require('fs')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

let sheetsClient = null
let authClient = null
let authVerified = false

const logPath = path.join(__dirname, '../../backend.log')

function log(message) {
    const timestamp = new Date().toISOString()
    const fullMsg = `[${timestamp}] [SHEETS] ${message}`
    console.log(fullMsg)
    fs.appendFileSync(logPath, fullMsg + '\n')
}

function logError(message, error = null) {
    const timestamp = new Date().toISOString()
    let fullMsg = `[${timestamp}] [SHEETS-ERROR] ${message}`
    if (error) {
        if (error.errors) {
            fullMsg += ` | API Errors: ${JSON.stringify(error.errors)}`
        }
        if (error.message) {
            fullMsg += ` | Message: ${error.message}`
        }
        if (error.code) {
            fullMsg += ` | Code: ${error.code}`
        }
        if (error.status) {
            fullMsg += ` | Status: ${error.status}`
        }
        if (error.stack) {
            fullMsg += ` | Stack: ${error.stack}`
        }
    }
    console.error(fullMsg)
    fs.appendFileSync(logPath, fullMsg + '\n')
}

function getEnvVar(name) {
    const v = process.env[name]
    log(`Loading env var: ${name} = ${v ? '✓ (set)' : '✗ (missing)'}`)
    if (!v) return null
    return v
}

function verifyEnvVars() {
    log('========== GOOGLE SHEETS ENV VERIFICATION START ==========')

    const clientEmail = getEnvVar('GOOGLE_CLIENT_EMAIL')
    const privateKey = getEnvVar('GOOGLE_PRIVATE_KEY')
    const sheetId = getEnvVar('GOOGLE_SHEET_ID')
    const sheetName = getEnvVar('GOOGLE_SHEET_NAME')

    const allPresent = clientEmail && privateKey && sheetId && sheetName

    log(`Verification Result:`)
    log(`  - GOOGLE_CLIENT_EMAIL: ${clientEmail ? '✓' : '✗ MISSING'}`)
    log(`  - GOOGLE_PRIVATE_KEY: ${privateKey ? '✓ (length: ' + privateKey.length + ')' : '✗ MISSING'}`)
    log(`  - GOOGLE_SHEET_ID: ${sheetId ? '✓' : '✗ MISSING'}`)
    log(`  - GOOGLE_SHEET_NAME: ${sheetName ? '✓' : '✗ MISSING'}`)

    if (!allPresent) {
        const missing = []
        if (!clientEmail) missing.push('GOOGLE_CLIENT_EMAIL')
        if (!privateKey) missing.push('GOOGLE_PRIVATE_KEY')
        if (!sheetId) missing.push('GOOGLE_SHEET_ID')
        if (!sheetName) missing.push('GOOGLE_SHEET_NAME')
        throw new Error(`Missing Google Sheets environment variables: ${missing.join(', ')}`)
    }

    log('========== GOOGLE SHEETS ENV VERIFICATION SUCCESS ==========')
}

function initAuth() {
    if (authClient) {
        log('Auth client already initialized, reusing...')
        return authClient
    }

    log('Initializing Google Sheets authentication...')

    try {
        verifyEnvVars()

        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
        let privateKey = process.env.GOOGLE_PRIVATE_KEY

        // Handle newline escape sequences in environment variables
        privateKey = privateKey.replace(/\\n/g, '\n')

        log(`Creating JWT auth with email: ${clientEmail}`)

        authClient = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: SCOPES,
        })

        log('Google Sheets JWT authentication initialized successfully')
        return authClient
    } catch (error) {
        logError('Failed to initialize authentication', error)
        throw error
    }
}

function getSheets() {
    if (sheetsClient) {
        log('Sheets client already initialized, reusing...')
        return sheetsClient
    }

    log('Creating Google Sheets API client...')
    try {
        const auth = initAuth()
        sheetsClient = google.sheets({ version: 'v4', auth })
        log('Google Sheets API client created successfully')
        return sheetsClient
    } catch (error) {
        logError('Failed to create Sheets client', error)
        throw error
    }
}

async function testAuth() {
    if (authVerified) {
        log('Authentication already verified')
        return true
    }

    log('Testing Google Sheets authentication...')
    try {
        const sheets = getSheets()
        const sheetId = process.env.GOOGLE_SHEET_ID

        // Try a simple read to verify auth works
        log(`Attempting test read from Sheet ID: ${sheetId}`)
        const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId })

        log(`✓ Authentication test successful! Sheet title: ${res.data.properties.title}`)
        authVerified = true
        return true
    } catch (error) {
        logError('Authentication test failed', error)
        authVerified = false
        throw error
    }
}


function mapStudentToRow(student) {
    // Order: Roll Number, Student Name, Class, Parent Name, Phone Number,
    // Total Fees, Amount Received, Pending Amount, Transaction ID, Payment Date, Remarks
    log(`Mapping student to row: ${student.rollNumber} - ${student.name}`)
    return [
        student.rollNumber || '',
        student.name || '',
        student.className || '',
        student.parentName || '',
        student.phone || '',
        String(student.totalFees ?? ''),
        String(student.amountReceived ?? ''),
        String(student.pendingAmount ?? ''),
        student.lastTransactionId || '',
        student.lastPaymentDate || '',
        student.lastPaymentRemarks || '',
    ]
}

async function findRowIndexByRoll(sheetId, sheetName, rollNumber) {
    log(`Finding row for roll number: ${rollNumber} in sheet: ${sheetName}`)
    try {
        const sheets = getSheets()
        const range = `${sheetName}!A:A`

        log(`Fetching values from range: ${range}`)
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range })
        const rows = res.data.values || []

        log(`Found ${rows.length} rows in sheet`)

        // rows include header if present; find first match
        for (let i = 0; i < rows.length; i++) {
            const cell = rows[i][0]
            if (cell && String(cell).trim() === String(rollNumber).trim()) {
                log(`✓ Found matching row at index ${i} (Sheets row: ${i + 1})`)
                return i + 1
            }
        }

        log(`✗ No matching row found for roll number: ${rollNumber}`)
        return -1
    } catch (error) {
        logError(`Failed to find row for roll ${rollNumber}`, error)
        throw error
    }
}

async function appendStudentRow(sheetId, sheetName, student) {
    log(`Appending new student row: ${student.rollNumber} - ${student.name}`)
    try {
        const sheets = getSheets()
        const values = [mapStudentToRow(student)]

        log(`Append payload: ${JSON.stringify({ spreadsheetId: sheetId, range: `${sheetName}!A:K`, values })}`)
        const res = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${sheetName}!A:K`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values },
        })

        log(`Append API response: ${JSON.stringify(res.data)}`)
        log(`✓ Student row appended successfully. Updates: ${JSON.stringify(res.data.updates)}`)
        return res
    } catch (error) {
        logError(`Failed to append student row for ${student.rollNumber}`, error)
        throw error
    }
}

async function updateStudentRow(sheetId, sheetName, rowIndex, student) {
    log(`Updating student row at index ${rowIndex}: ${student.rollNumber} - ${student.name}`)
    try {
        const sheets = getSheets()
        const values = [mapStudentToRow(student)]
        const range = `${sheetName}!A${rowIndex}:K${rowIndex}`

        log(`Update payload: ${JSON.stringify({ spreadsheetId: sheetId, range, values })}`)
        const res = await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        })

        log(`Update API response: ${JSON.stringify(res.data)}`)
        log(`✓ Student row updated successfully. Updates: ${JSON.stringify(res.data.updates)}`)
        return res
    } catch (error) {
        logError(`Failed to update student row at index ${rowIndex} for ${student.rollNumber}`, error)
        throw error
    }
}

async function syncStudent(student) {
    log(`========== SYNC STUDENT START ==========`)
    log(`Student: ${student.rollNumber} (${student.name})`)

    try {
        const sheetId = process.env.GOOGLE_SHEET_ID
        const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1'

        if (!sheetId) {
            throw new Error('GOOGLE_SHEET_ID is not set in environment variables')
        }

        log(`Sheet ID: ${sheetId}`)
        log(`Sheet Name: ${sheetName}`)

        const idx = await findRowIndexByRoll(sheetId, sheetName, student.rollNumber)

        if (idx !== -1) {
            log(`Row exists at index ${idx}, updating...`)
            await updateStudentRow(sheetId, sheetName, idx, student)
            log(`========== SYNC STUDENT SUCCESS (UPDATED) ==========`)
            return { updated: true, row: idx }
        } else {
            log(`Row does not exist, appending new row...`)
            await appendStudentRow(sheetId, sheetName, student)
            log(`========== SYNC STUDENT SUCCESS (APPENDED) ==========`)
            return { appended: true }
        }
    } catch (err) {
        logError(`Failed to sync student ${student.rollNumber}`, err)
        log(`========== SYNC STUDENT FAILED ==========`)
        throw err
    }
}

module.exports = {
    syncStudent,
    initAuth,
    testAuth,
    verifyEnvVars,
    log,
    logError,
}
