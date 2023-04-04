export class Logger {
    public static log(message: string): void {
        const logEntry = `[Log - ${new Date().toISOString()}] ${message}`;
        console.log(logEntry);
    }
    public static error(message: string): void {
        const errorEntry = `[Error - ${new Date().toISOString()}] ${message}`;
        console.error(errorEntry);
    }
    public static handleError(error: Error): void {
        this.error(`Unhandled error: ${error.message}`);
        console.error(error);
    }
}