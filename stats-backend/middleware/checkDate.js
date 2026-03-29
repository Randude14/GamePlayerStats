function checkDate(dateField) {

    if(!dateField || dateField.length === 0) {
        return null;
    }

    return async (req, res, next) => {
        const date = req.body[dateField];

        if(!date || date.length === 0) {
            return res.status(400).json({ error: `${dateField} not provided` })
        }

        // Date is expected to be in format YYYY-MM-DD
        if( !/^\d{4}-\d{2}-\d{2}$/.test(date) ) {
            return res.status(400).json({ error: `${dateField} is not in the correct format (YYYY-MM-DD)` })
        }

        next();
    };
}

module.exports = checkDate;