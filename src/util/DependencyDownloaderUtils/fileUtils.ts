import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';
import OSUtil from './OSUtils';
import { logger } from '../../logger/logger';

export const createFolder = (folderName: string) => {
      try {
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
        }
      } catch (err) {
        console.error(err);
      }
};

export function readLastLine(filePath: string): string {
    const file = fs.openSync(filePath, 'r');
    const lastByteIndex = fs.statSync(filePath).size - 1;
    const buffer = Buffer.alloc(1);

    let lastLine = '';
    let readByte: number;
    for (let filePointer = lastByteIndex; filePointer >= 0; filePointer--) {
        fs.readSync(file, buffer, 0, 1, filePointer);
        readByte = buffer[0];

        if (readByte === 0x0A) {
            if (filePointer === lastByteIndex) {
                continue;
            }
            break;
        } else if (readByte === 0x0D) {
            if (filePointer === lastByteIndex - 1) {
                continue;
            }
            break;
        }

        lastLine = String.fromCharCode(readByte) + lastLine;
    }

    fs.closeSync(file);
    return lastLine;
};

export function unzipFileSync(zipFilePath: string, destDir: string): void {
    const osName = OSUtil.getOSArch(); // TODO: Update this 

    const zipFilePathCanonical = path.resolve(zipFilePath);
    const destDirCanonical = path.resolve(destDir);

    let unzipCommand: string[];
    if (osName.includes('win')) {
        unzipCommand = ['powershell.exe', '-nologo', '-noprofile', '-command', `Expand-Archive -Path '${zipFilePathCanonical}' -DestinationPath '${destDirCanonical}' -Force`];
    } else if (osName.includes('nix') || osName.includes('mac') || osName.includes('nux')) {
        unzipCommand = ['unzip', '-o', '-q', zipFilePathCanonical, '-d', destDirCanonical];
    } else {
        throw new Error(`Unsupported operating system: ${osName}`);
    }

    const process = childProcess.spawnSync(unzipCommand[0], unzipCommand.slice(1), { shell: true });

    if (process.error) {
        throw new Error(`Error executing command: ${process.error.message}`);
    }

    if (process.stderr && process.stderr.length > 0) {
        console.error(process.stderr.toString('utf-8'));
    }

    if (process.status !== 0) {
        throw new Error(`Command exited with code: ${process.status}`);
    }

    fs.unlinkSync(zipFilePath);
};

export function makeFilesExecutable(directory: string): void {
    const osName = OSUtil.getOSArch();
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const filePath = path.join(directory, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        
        if (isDirectory) {
            makeFilesExecutable(filePath);
        } else {
            try {
                if (osName.includes('nix') || osName.includes('mac') || osName.includes('nux')) {
                    fs.chmodSync(filePath, '755');
                }
            } catch (error) {
                logger.error(`Could not set executable flag on file: ${filePath}`);
            }
        }
    }
}