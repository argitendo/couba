import { createLogger, format as _format, transports as _transports } from 'winston';

const logger = createLogger({
  // Log only if level is less than (meaning more severe) or equal to this
  level: "info",
  // Use timestamp and printf to create a standard log format
  format: _format.combine(
    _format.timestamp(),
    _format.printf(
      (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
    )
  ),
  // Log to the console and a file
  transports: [
    new _transports.Console(),
  ],
});

export default logger;
