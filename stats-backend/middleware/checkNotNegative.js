function checkNotNegative(numberField, enforceExistence=true) {

    if(!numberField || numberField.length === 0) {
        throw new Error("numberField required.");
    }

    return (req, res, next) => {
        let value = req.body[numberField];

        if(value === undefined || value === null) {

            // Some cases we don't need to check the number, ignore if it doesn't exist
            if(!enforceExistence) {
                next();
                return;
            }
            return res.status(400).json({ error: `${numberField} not provided` })
        }

        if(typeof value === 'string') {
            value = Number(value)
        }

        if (!isFinite(value)) {
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