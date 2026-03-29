function checkNotNegative(numberField) {

    if(!numberField || numberField.length === 0) {
        return async(req, res, next) => next();
    }

    return async (req, res, next) => {
        let number = req.body[numberField];

        if(number === undefined || number === null) {
            return res.status(400).json({ error: `${numberField} not provided` })
        }

        if(typeof number === 'string') {
            number = +number
        }

        if(typeof number != 'number') {
            return res.status(400).json({ error: `${numberField} is not a number or string` })
        }

        if(number < 0) {
            return res.status(400).json({ error: `${numberField} is not >= 0` })
        }

        next();
    };
}

module.exports = checkNotNegative;