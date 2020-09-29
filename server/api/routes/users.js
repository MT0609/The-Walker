
const express = require('express')

const UsersController = require('./../controllers/users')
const checkAuth = require('./../middleware/checkAuth')

const router = express.Router()

// Signup new account
router.post('/signup', UsersController.signup)
// Email verify
router.get('/signup/confirmation/:verifyToken', UsersController.confirmation)
// Resend email verify
router.post('/signup/resend', UsersController.resend)
// User login
router.post('/login', UsersController.login)
// User token refresh
router.post('/login/refresh', UsersController.refresh)
// // Reset password
// router.post('/recovery', UsersController.recovery)
// // Forgot password
// router.get('/forgot/:verifyToken', UsersController.reset)
// Forgot password
router.post('/forgot', UsersController.forgot)
// Change password
router.post('/information', checkAuth, UsersController.change)
// Query user information
router.get('/information', checkAuth, UsersController.information)
// Delete user
router.delete('/:userID', checkAuth, UsersController.delete)

module.exports = router