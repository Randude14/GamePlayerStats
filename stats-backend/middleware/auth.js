const jwt = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next) {
    // Get token from header
    const token = req.query['x-auth-token'];

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.player = decoded.player;

        next();
    } catch (err) {
        res.status(401).json({msg: 'Token is not valid'})
    }

}


module.exports = auth;