function checkDate(dateField, enforceExistence=true) {

    if(!dateField || dateField.length === 0) {
        throw new Error("dateField required.");
    }

    return (req, res, next) => {
        const date = req.body[dateField];

        if(date === undefined || date === null) {

            // Some cases we don't need to check a data, ignore if it doesn't exist
            if(!enforceExistence) {
                next();
                return;
            }
            return res.status(400).json({ error: `${dateField} not provided` })
        }

        // Date is expected to be in format YYYY-MM-DD
        if( !/^\d{4}-\d{2}-\d{2}$/.test(date) ) {
            return res.status(400).json({ error: `${dateField} is not in the correct format (YYYY-MM-DD)` })
        }

        // Validate actual date
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ error: `${dateField} is not a valid date` });
        }

        next();
    };
}

module.exports = checkDate;