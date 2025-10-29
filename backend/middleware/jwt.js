const jwt = require("jsonwebtoken");

const generatetoken = (userId, res) => {
    const token = jwt.sign({
        userId
    }, process.env.Secret_key, { expiresIn: '1d' }
    );
    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

}

module.exports = generatetoken;