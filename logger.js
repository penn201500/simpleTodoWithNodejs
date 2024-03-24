const winston = require("winston");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: {service: "Todo App"},
    transports: [
        //
        // - Write all logs with level `info` and below to `app.log`
        // - Write all logs with level `error` and below to `error.log`.
        //
        new winston.transports.File({filename: "error.log", level: "error"}),
        new winston.transports.File({filename: "app.log"})
    ]
});

if (process.env.NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}

module.exports = logger;