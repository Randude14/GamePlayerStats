
// Extends the base errors class with an included status code for services to communicate what happened to controllers
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = AppError;