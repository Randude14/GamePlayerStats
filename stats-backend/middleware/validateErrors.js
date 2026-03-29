const { validationResult } = require('express-validator');

// Validates errors thrown by the check and validation
function validateErrors() {
    return (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    };
}

module.exports = validateErrors;