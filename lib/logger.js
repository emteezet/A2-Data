/**
 * Logger utility for structured and color-coded console output.
 * Levels: info, success, warn, error, debug
 */

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
};

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    SUCCESS: 2,
    WARN: 3,
    ERROR: 4,
};

// Set default level based on environment
const currentLevel = process.env.NODE_ENV === "production" ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

class Logger {
    formatMessage(level, message, metadata = null) {
        const timestamp = new Date().toISOString();
        const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : "";
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    }

    info(message, metadata = null) {
        if (currentLevel <= LOG_LEVELS.INFO) {
            console.log(`${colors.blue}${this.formatMessage("INFO", message, metadata)}${colors.reset}`);
        }
    }

    success(message, metadata = null) {
        if (currentLevel <= LOG_LEVELS.SUCCESS) {
            console.log(`${colors.green}${colors.bright}${this.formatMessage("SUCCESS", message, metadata)}${colors.reset}`);
        }
    }

    warn(message, metadata = null) {
        if (currentLevel <= LOG_LEVELS.WARN) {
            console.warn(`${colors.yellow}${this.formatMessage("WARN", message, metadata)}${colors.reset}`);
        }
    }

    error(message, error = null, metadata = null) {
        if (currentLevel <= LOG_LEVELS.ERROR) {
            const errDetails = error ? (error.stack || error.message || error) : "";
            console.error(`${colors.red}${colors.bright}${this.formatMessage("ERROR", message, metadata)}${colors.reset}`);
            if (errDetails) console.error(`${colors.red}${errDetails}${colors.reset}`);
        }
    }

    debug(message, metadata = null) {
        if (currentLevel <= LOG_LEVELS.DEBUG) {
            console.debug(`${colors.dim}${colors.cyan}${this.formatMessage("DEBUG", message, metadata)}${colors.reset}`);
        }
    }
}

export const logger = new Logger();
