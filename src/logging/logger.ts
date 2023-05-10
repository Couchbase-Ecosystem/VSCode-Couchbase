import { OutputChannel, window } from "vscode";
import { Level } from "./enum";
import { Constants } from "../util/constants";

class Logger {
    private outputChannel: OutputChannel;

    constructor() {
        this.outputChannel = window.createOutputChannel(`${Constants.extensionID}`);
    }

    debug(msg: any) {
        this.log(`${this.toString(msg)}`, Level.debug);
    }

    info(msg: any) {
        this.log(`${this.toString(msg)}`, Level.info);
    }

    warn(msg: any) {
        this.log(`${this.toString(msg)}`, Level.warn);
    }

    error(msg: any) {
        this.log(`${this.toString(msg)}`, Level.error);
    }

    output(msg: any) {
        this.outputChannel.appendLine(this.toString(msg));
    }

    showOutput() {
        this.outputChannel.show();
    }

    private toString(msg: any): string {
        return msg.toString();
    }

    private log(msg: string, level: Level) {
        const time = new Date().toLocaleString();
        msg = `[${time}][${Constants.extensionID}][${level}] ${msg}`;
        this.output(msg);
    }
}

export const logger: Logger = new Logger();