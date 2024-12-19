import * as childProcess from 'child_process';
import { CBTools, ToolStatus, Type } from '../util/DependencyDownloaderUtils/CBTool';

export class SdkDoctorRunner {
    static async run(
        host: string,
        ssl: boolean,
        bucket: string,
        username: string,
        password: string,
        outputCallback: (line: string) => void
    ): Promise<void> {
        try {
            const sdkDoctorTool = CBTools.getTool(Type.SDK_DOCTOR);
            if (sdkDoctorTool.status !== ToolStatus.AVAILABLE) {
                throw new Error('SDK Doctor is not available. Please ensure it is installed.');
            }

            const sdkDoctorExecutable = sdkDoctorTool.path;
            const clusterUrl = SdkDoctorRunner.adjustClusterProtocol(host, ssl);
            const args = [
                'diagnose',
                `${clusterUrl}/${bucket}`,
                '-u', username,
                '-p', password
            ];

            const process = childProcess.spawn(sdkDoctorExecutable, args);

            process.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                lines.forEach((line: string) => {
                    if (line.trim()) {
                        outputCallback(line.trim());
                    }
                });
            });

            process.stderr.on('data', (data) => {
                console.error(`SDK Doctor error: ${data}`);
            });

            await new Promise<void>((resolve, reject) => {
                process.on('close', (code) => {
                    if (code !== 0) {
                        console.warn(`SDK Doctor exited with code ${code}`);
                    }
                    resolve();
                });

                process.on('error', (err) => {
                    reject(err);
                });
            });

        } catch (error) {
            console.error('Error while running the SDK Doctor', error);
        }
    }

    private static adjustClusterProtocol(host: string, ssl: boolean): string {
        const protocol = ssl ? 'couchbases://' : 'couchbase://';
        return host.startsWith('couchbase://') || host.startsWith('couchbases://') 
            ? host 
            : `${protocol}${host}`;
    }
}