const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const User = require('./../models/user')

const {sendMail} =  require('./../config/nodemailer')
const {saveHistory, loadHistory} = require('./../utils/history')

const tokenLife = process.env.TOKEN_LIFE
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE
const jwtKey = process.env.JWT_KEY

exports.getAll = (req, res, next) => {
    if (req.userData.roles != 'admin'){
        return res.status(403).json({
            msg: `You don't have the permission!`
        })
    }

    User.find({})
    .select('name slugName email cash roles isVerified')
    .then(users => {

        res.set("x-total-count", users.length);
        res.status(200).json({
            msg: 'success',
            length: users.length,
            users
        })
    })
    .catch(error => {
        res.status(500).json({
            msg: 'Server error!',
            error
        })
    })
}

exports.getOne = (req, res, next) => {
    const _id = req.userData._id

    User.findById(_id)
    .select('name email roles cash isVerified')
    .then(user => {
        if(!user){
            return res.status(404).json({
                msg: 'User not found!'
            })
        }else{
            res.status(200).json({
                msg: 'success',
                user
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            msg: 'Server error!',
            error
        })
    })
}

exports.create =  (req, res, next) => {
    const {name, email, password} = req.body

    if(!name || !email || !password) {
        return res.status(404).json({
            msg: "Fields: name, email and password are required!"
        })
    }

    User.find({email})
    .then(user => {
        if(user.length >= 1){
            return res.status(409).json({
                msg: "Email has been used!"
            })
        }

        bcrypt.hash(password, 10, (error, encryptedPassword) => {
            if(error){
                return res.status(500).json({
                    msg: 'Server error!',
                    error
                })

            }else{
                const passwordResetToken = crypto.randomBytes(16).toString('hex')
                const user = new User({
                    name,
                    email,
                    password: encryptedPassword,
                    passwordResetToken
                })

                user.save()
                .then(newUser => {
                    const token = jwt.sign( {_id: newUser._id}, jwtKey, {
                        expiresIn: tokenLife
                    })

                    sendMail(req, newUser.email, token, 'confirmation')

                    res.status(201).json({
                        msg: "success",
                        user: newUser
                    })
                })
                .catch(error => {
                    res.status(500).json({
                        msg: 'Server error!',
                        error
                    })
                })
            }
        })
    })
    .catch(error => {
        res.status(500).json({
            msg: "Server error!",
            error
        })
    })
}


exports.update = async (req, res, next) => {
    const {userId: _id} = req.params

    let hasPassword = false

    const newUser = {}

    for (const ops of req.body) {
        newUser[ops.propName] = ops.value

        if(ops.propName === 'password'){
            hasPassword = true
        }
    }


    await User.findById(_id)
    .then(async user => {
        if(!user){
            return res.status(500).json({
                msg: 'User not found!'
            })
        }

        if(hasPassword){
            await bcrypt.hash(newUser.password, 10, async (error, encryptedPassword) => {
                if(error){
                    return res.status(500).json({
                        msg: 'Server error!',
                        error
                    })

                }

                newUser.password = encryptedPassword

                await User.updateOne({_id}, {$set: newUser})
                .then(async result => {

                    await saveHistory(_id, 'accInfos', 'personal', `Update an account: ${_id}-${Object.keys(newUser).join('-')} | ${new Date()}`)
                    res.status(200).json({
                        msg: "success",
                        request: {
                            type: 'GET',
                            url: req.hostname + '/users/' + _id
                        }
                    })
                })
                .catch(error => {
                    console.log(error)
                    res.status(500).json({
                        msg: 'Server error!',
                        error
                    })
                })
            })

        }else{
            await User.updateOne({_id}, {$set: newUser})
            .then(async result => {

                await saveHistory(_id, 'accInfos', 'personal', `Update an account: ${_id}-${Object.keys(newUser).join('-')} | ${new Date()}`)

                res.status(200).json({
                    msg: "success",
                    request: {
                        type: 'GET',
                        url: req.hostname + '/users/' + _id
                    }
                })
            })
            .catch(error => {
                console.log(error)
                res.status(500).json({
                    msg: 'Server error!',
                    error
                })
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            msg: 'Server error!',
            error
        })
    })
}

exports.delete =  async (req, res, next) => {
    const {roles} = req.userData
    const {userId: _id} = req.params

    if(roles != 'admin'){
        return res.status(403).json({
            msg: `You don't have the permission!`
        })
    }

    if(!_id){
        return res.status(404).json({
            msg: 'UserID is required!'
        })
    }

    await User.findById(_id)
    .then(async user => {
        if(!user){
            return res.status(404).json({
                msg: 'User not found!'
            })
        }

        if(user.roles === 'admin'){
            return res.status(404).json({
                msg: `You don't have the permission!`
            })
        }

        await User.deleteOne({_id})
        .then(async result => {

            await saveHistory(req.userData._id, 'accInfos', 'manage', `Delete an account: ${_id}-${user.name}-${user.email} | ${new Date()}`)
            await saveHistory(_id, 'accInfos', 'manage', `Account has been deleted by: ${_id}-${user.name}-${user.email} | ${new Date()}`)

            res.status(200).json({
                msg: 'success'
            })
        })
        .catch(error => {
            res.status(500).json({
                msg: 'Server error!',
                error
            })
        })
    })
    .catch(error => {
        res.status(500).json({
            msg: 'Server error!',
            error
        })
    })
}

// --------------------------------------------------------------------

exports.confirmation = async (req, res, next) => {
    const {verifyToken: token} = req.params

    if(!token){
        return res.status(404).json({
            msg: 'Invalid token!'
        })
    }

    try {
        const decoded = jwt.verify(token, jwtKey)
        const {_id} = decoded

        await User.findOne({_id})
        .then(async user => {
            if(!user) {
                return res.status(404).json({
                    msg: 'User not found!'
                })
            }

            if(user.isVerified){
                return res.status(200).json({
                    msg: 'success'
                })
            }

            user.isVerified = true

            await user.save(async error => {
                if(error) {
                    return res.status(500).json({
                        msg: 'Server error!',
                        error
                    })
                }

                await saveHistory(_id, 'accInfos', 'manage', `Confirm this account | ${new Date()}`)

                res.status(200).json({
                    msg: 'success'
                })
            })
        })
        .catch(error => {
            res.status(500).json({
                msg: 'Server error!',
                error
            })
        })

    } catch (error) {
        res.status(404).json({
            msg: 'Token has expires. Please click resend confirmation email!'
        })
    }
}

exports.resend = async (req, res, next) => {
    const {email} = req.body

    if(!email) {
        res.status(404).json({
            msg: 'Email is required!'
        })
    }

    await User.findOne({email})
    .then(async user => {
        if(!user) {
            return res.status(404).json({
                msg: 'Email not found!'
            })
        }

        if(user.isVerified) {
            return res.status(200).json({
                msg: 'success'
            })
        }

        const token = jwt.sign( {_id: user._id}, jwtKey, {
            expiresIn: tokenLife
        })

        sendMail(req, user.email, token, 'confirmation')

        await saveHistory(user._id, 'accInfos', 'manage', `Resend confirm email: ${user._id}-${user.name}-${user.email} | ${new Date()}`)

        res.status(201).json({
            msg: "success"
        })
    })
    .catch(error => {
        res.status(500).json({
            msg: 'Server error!',
            error
        })
    })
}

exports.login = (req, res, next) => {
    const {email, password} = req.body

    if(!email || !password){
        return res.status(404).json({
            msg: 'Email and password are required!'
        })
    }

    User.find({email})
    .then(user => {
        if(user.length < 1){
            return res.status(404).json({
                msg: 'Auth failed!'
            })

        }else{
            bcrypt.compare(password, user[0].password, (error, matched) => {
                if(error){
                    return res.status(404).json({
                        msg: 'Auth failed!'
                    })

                }else{
                    if(matched){
                        const { email, _id, isVerified, name, cash, slugName, roles } = user[0]
                        const payloadToken = { _id, roles, name, cash, slugName, email }
                        const token = jwt.sign( payloadToken, jwtKey, {
                            expiresIn: tokenLife
                        })
                        const refreshToken = jwt.sign(payloadToken, jwtKey, {
                            expiresIn: refreshTokenLife
                        })

                        if(!isVerified) {
                            return res.status(401).json({
                                msg: "Your account has not been verified!"
                            })
                        }

                        res.status(200).json({
                            msg: 'success',
                            token,
                            refreshToken
                        })

                    }else{
                        res.status(404).json({
                            msg: 'Auth failed!'
                        })
                    }
                }
            })
        }
    })
    .catch(error => {
        res.status(500).json({
            msg: 'Server error!',
            error
        })
    })
}

exports.refresh = (req, res, next) => {
    const { refreshToken } = req.body

    if(!refreshToken){
        return res.status(404).json({
            msg: 'RefreshToken is required!'
        })
    }

    try {
        const decoded = jwt.verify(refreshToken, jwtKey)
        const { _id, roles, name, cash, slugName, email} = decoded
        const user = {_id, roles, name, cash, slugName, email}

        const token = jwt.sign(user, jwtKey, {
            expiresIn: tokenLife,
        })

        res.status(200).json({
            msg: 'success',
            token
        })

    } catch (error) {
        res.status(401).json({
            msg: 'Refresh token expires. Please login!'
        })
    }
}

exports.recovery = async (req, res, next) => {
    const {email} = req.body

    if(!email) {
        return res.status(404).json({
            msg: 'Email is required!'
        })
    }

    await User.findOne({email})
    .then(async user => {
        if(!user) {
            return res.status(404).json({
                msg: 'Email not found!'
            })
        }

        await bcrypt.hash(email, 10)
        .then(async hashed => {
            user.passwordResetToken = hashed
            user.passwordResetExpires = Date.now() + 7200000 // 2h

            await user.save()
            .then(async newUser => {

                sendMail(req, newUser.email, newUser.passwordResetToken, 'recovery')
                await saveHistory(user._id, 'accInfos', 'manage', `Send password reset token: ${user._id}-${user.email} | ${new Date()}`)

                res.status(200).json({
                    msg: 'success'
                })
            })
            .catch(error => {
                res.status(500).json({
                    msg: 'Server error!',
                    error
                })
            })
        })
    })
    .catch(error => {
        res.status(500).json({
            msg: 'Server error!',
            error
        })
    })
}

exports.forgot = async (req, res, next)  => {
    const {newPassword, passwordResetToken} = req.body

    if(!newPassword || ! passwordResetToken){
        return res.status(404).json({
            msg: 'newPassword and passwordResetToken are required!'
        })
    }

    await User.findOne({
        passwordResetToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    })
    .then(async user => {
        if(!user){
            return res.status(404).json({
                msg: 'User not found or password reset token expires!'
            })
        }

        await bcrypt.hash(newPassword, 10)
        .then(async hashed => {
            user.password = hashed
            user.passwordResetToken = ''
            user.passwordResetExpires = Date.now()

            await user.save()
            .then(async user => {

                await saveHistory(user._id, 'accInfos', 'manage', `Recovery password: ${user._id}-${user.name}-${user.email} | ${new Date()}`)
                res.status(200).json({
                    msg: 'success'
                })
            })
            .catch(error => {
                res.status(500).json({
                    msg: 'Server error!',
                    error
                })
            })
        })
    })
    .catch(error => {
        res.status(500).json({
            msg: 'Server error!',
            error
        })
    })
}