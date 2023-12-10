const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.createUser = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    console.log(req.body);
    const isNewUser1 = await User.isThisEmailInUse(email);
    const isNewUser2 = await User.isThisUsernameInUse(username);
    if (!isNewUser1 || !isNewUser2) 
        return res.json({
            success: false,
            message: 'This email/username is already in use, try sign-in',
        });
    const user = await User({
        firstName,
        lastName,
        username,
        email,
        password,
    });
    await user.save();
    res.json({ success: true, user });
};

exports.userSignIn = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user)
        return res.json({
            success: false,
            message: 'user not found, with the given username!',
        });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
        return res.json({
            success: false,
            message: 'username / password does not match!',
        });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d',
    });

    let oldTokens = user.tokens || [];

    if (oldTokens.length) {
        oldTokens = oldTokens.filter(t => {
            const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
            if (timeDiff < 86400) {
                return t;
            }
        });
    }

    await User.findByIdAndUpdate(user._id, {
        tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
    });

    const userInfo = {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
    };

    res.json({ success: true, user: userInfo, token });
};

exports.userSignOut = async (req, res) => {
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: 'Authorization fail!' });
        }

        const tokens = req.user.tokens;

        const newTokens = tokens.filter(t => t.token !== token);

        await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
        res.json({ success: true, message: 'Sign out successfully!' });
    }
};