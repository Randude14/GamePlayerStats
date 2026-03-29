function checkNotNegative(numberField) {

    if(!numberField || numberField.length === 0) {
        throw new Error("numberField required.");
    }

    return (req, res, next) => {
        let number = req.body[numberField];

        if(value === undefined || value === null) {
            return res.status(400).json({ error: `${numberField} not provided` })
        }

        if(typeof value === 'string') {
            value = value(value)
        }

        if (!value.isFinite(value)) {
            return res.status(400).json({ error: `${field} must be a valid value` });
        }

        if(value < 0) {
            return res.status(400).json({ error: `${numberField} is not >= 0` })
        }

        req.body[numberField] = value;

        next();
    };
}

module.exports = checkNotNegative;