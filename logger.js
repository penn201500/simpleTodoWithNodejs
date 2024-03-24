const winston = require("winston");
require('winston-daily-rotate-file')

const transport = new winston.transports.DailyRotateFile({
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
})

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
        transport
    ]
});

if (process.env.NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}

module.exports = logger;