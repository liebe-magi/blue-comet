/**
 * Logger utility
 * A simple logger that wraps console output and allows for output control based on environment
 */

/**
 * Definition of log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Determine if the current environment is a production environment
 * In the future, this could be configured using environment variables
 */
const isProduction = (): boolean => {
  // Using a safer detection method as the process object might be undefined
  return typeof window !== 'undefined' && window.location?.hostname !== 'localhost';
};

/**
 * Function to output error logs
 * @param message Log message
 * @param optionalParams Additional parameters
 */
export const logError = (message: string, ...optionalParams: unknown[]): void => {
  // Output errors even in production environment
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${message}`, ...optionalParams);
};

/**
 * Function to output warning logs
 * @param message Log message
 * @param optionalParams Additional parameters
 */
export const logWarn = (message: string, ...optionalParams: unknown[]): void => {
  // Output warnings even in production environment
  // eslint-disable-next-line no-console
  console.warn(`[WARN] ${message}`, ...optionalParams);
};

/**
 * Function to output info logs
 * @param message Log message
 * @param optionalParams Additional parameters
 */
export const logInfo = (message: string, ...optionalParams: unknown[]): void => {
  // Don't output info logs in production environment
  if (!isProduction()) {
    // eslint-disable-next-line no-console
    console.info(`[INFO] ${message}`, ...optionalParams);
  }
};

/**
 * Function to output debug logs
 * @param message Log message
 * @param optionalParams Additional parameters
 */
export const logDebug = (message: string, ...optionalParams: unknown[]): void => {
  // Don't output debug logs in production environment
  if (!isProduction()) {
    // eslint-disable-next-line no-console
    console.debug(`[DEBUG] ${message}`, ...optionalParams);
  }
};

/**
 * Object that combines logger functions
 */
export const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
};
