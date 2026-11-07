
const errorHandler = (error, req, res, next) => {
    console.error("API Error:", error);

    const statusCode = error._statusCode || error.statusCode || 500;
    const errorCode = error._code || error.code;

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500
                ? "Internal server error"
                : error.message,
        ...(errorCode && { code: errorCode }),
    });
};

module.exports = errorHandler;
