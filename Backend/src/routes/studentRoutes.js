const express = require('express')
const auth = require('../middleware/auth')
const {
    logInfo,
} = require('../utils/logger')
const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
} = require('../controllers/studentController')

const router = express.Router()

logInfo('[STUDENT ROUTES] Loaded', {
    routePath: require.resolve('./studentRoutes'),
    controllerPath: require.resolve('../controllers/studentController'),
})

router.get('/', auth, getStudents)
router.get('/:id', auth, getStudentById)
router.post('/', auth, createStudent)
router.put('/:id', auth, updateStudent)
router.delete('/:id', auth, deleteStudent)

module.exports = router
