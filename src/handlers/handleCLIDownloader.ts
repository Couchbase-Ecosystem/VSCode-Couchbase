import { CBTools, ToolStatus, Type } from "../util/DependencyDownloaderUtils/CBTool";
import OSUtil from "../util/DependencyDownloaderUtils/OSUtils";
import { createFolder, makeFilesExecutable } from "../util/DependencyDownloaderUtils/fileUtils";
import ToolSpec from "../util/DependencyDownloaderUtils/ToolSpec";
import * as path from 'path';
import * as fs from 'fs';
import axios from "axios";
import decompress from 'decompress';
import * as child_process from 'child_process';
import * as vscode from 'vscode';

class DependenciesDownloader {
    private readonly TOOL_SHELL = 'shell';
    private readonly TOOL_IMPORT_EXPORT = 'import_export';
    private readonly ALL_TOOLS = 'all_tools';

    private getToolInstallPath(toolKey: string): string {
        if (toolKey === this.TOOL_SHELL) {
            return 'cbshell';
        } else if (toolKey === this.TOOL_IMPORT_EXPORT) {
            return 'cbimport_export';
        } else if (toolKey === this.ALL_TOOLS) {
            return 'cbtools';
        } else {
            throw new Error('Not Implemented yet');
        }
    }

    private getToolsMap(toolKey: string, os: string): Map<Type, string> {
        const suffix = os.includes('mac') || os.includes('linux') ? '' : '.exe';
        const pathPrefix = 'bin' + path.sep;

        const map = new Map<Type, string>();

        if (toolKey === this.TOOL_SHELL) {
            map.set(Type.SHELL, 'cbsh' + suffix);
        } else if (toolKey === this.TOOL_IMPORT_EXPORT) {
            map.set(Type.CB_IMPORT, path.join(pathPrefix, 'cbimport' + suffix));
            map.set(Type.CB_EXPORT, path.join(pathPrefix, 'cbexport' + suffix));
        } else if (toolKey === this.ALL_TOOLS) {
            map.set(Type.CBC_PILLOW_FIGHT, path.join(pathPrefix, 'cbc-pillowfight' + suffix));
            map.set(Type.MCTIMINGS, path.join(pathPrefix, 'mctimings' + suffix));
        } else {
            throw new Error('Not implemented yet');
        }

        return map;
    }

    private getToolSpec(url: string, toolKey: string, os: string): ToolSpec {
        return new ToolSpec(url, this.getToolInstallPath(toolKey), this.getToolsMap(toolKey, os));
    }
    public getDownloadList(os: string): Map<string, ToolSpec> {
        const map = new Map<string, ToolSpec>();

        if (os === OSUtil.MACOS_64) {
            map.set(this.TOOL_SHELL, this.getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-apple-darwin.zip", this.TOOL_SHELL, OSUtil.MACOS_64));
            map.set(this.TOOL_IMPORT_EXPORT, this.getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-macos_x86_64.zip", this.TOOL_IMPORT_EXPORT, OSUtil.MACOS_64));
            map.set(this.ALL_TOOLS, this.getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-macos_64.zip", this.ALL_TOOLS, OSUtil.MACOS_64));
        } else if (os === OSUtil.MACOS_ARM) {
            map.set(this.TOOL_SHELL, this.getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-aarch64-apple-darwin.zip", this.TOOL_SHELL, OSUtil.MACOS_ARM));
            map.set(this.TOOL_IMPORT_EXPORT, this.getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-macos_arm64.zip", this.TOOL_IMPORT_EXPORT, OSUtil.MACOS_ARM));
            map.set(this.ALL_TOOLS, this.getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-macos_arm.zip", this.ALL_TOOLS, OSUtil.MACOS_64));
        } else if (os === OSUtil.WINDOWS_64) {
            map.set(this.TOOL_SHELL, this.getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-pc-windows-msvc.zip", this.TOOL_SHELL, OSUtil.WINDOWS_64));
            map.set(this.TOOL_IMPORT_EXPORT, this.getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-windows_amd64.zip", this.TOOL_IMPORT_EXPORT, OSUtil.WINDOWS_64));
            map.set(this.ALL_TOOLS, this.getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-windows_64.zip", this.ALL_TOOLS, OSUtil.WINDOWS_64));
        } else if (os === OSUtil.WINDOWS_ARM) {
            map.set(this.TOOL_SHELL, this.getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-pc-windows-msvc.zip", this.TOOL_SHELL, OSUtil.WINDOWS_ARM));
            map.set(this.TOOL_IMPORT_EXPORT, this.getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-windows_amd64.zip", this.TOOL_IMPORT_EXPORT, OSUtil.WINDOWS_ARM));
            map.set(this.ALL_TOOLS, this.getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-windows_64.zip", this.ALL_TOOLS, OSUtil.WINDOWS_ARM));
        } else if (os === OSUtil.LINUX_64) {
            map.set(this.TOOL_SHELL, this.getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-unknown-linux-gnu.tar.gz", this.TOOL_SHELL, OSUtil.LINUX_64));
            map.set(this.TOOL_IMPORT_EXPORT, this.getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-linux_x86_64.tar.gz", this.TOOL_IMPORT_EXPORT, OSUtil.LINUX_64));
            map.set(this.ALL_TOOLS, this.getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-linux_64.zip", this.ALL_TOOLS, OSUtil.LINUX_64));
        } else if (os === OSUtil.LINUX_ARM) {
            map.set(this.TOOL_SHELL, this.getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-aarch64-unknown-linux-gnu.tar.gz", this.TOOL_SHELL, OSUtil.LINUX_ARM));
            map.set(this.TOOL_IMPORT_EXPORT, this.getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-linux_aarch64.tar.gz", this.TOOL_IMPORT_EXPORT, OSUtil.LINUX_ARM));
        } else {
            throw new Error('OS not supported.');
        }
        return map;
    }


    public handleCLIDownloader = () => {
        const extensionPath = (path.join(__filename, "..", "cb-vscode-extension"));
        createFolder(extensionPath);
        const toolsPath = path.join(extensionPath, "tools");
        createFolder(toolsPath);
        let osArch = OSUtil.getOSArch();
        const downloads: Map<string, ToolSpec> = this.getDownloadList(osArch);

        const shell = downloads.get(this.TOOL_SHELL);
        if (shell === undefined){
            return;
        }
        const shellPath = path.join(toolsPath, shell.getInstallationPath());
        const shellTool = CBTools.getTool(Type.SHELL);
        const shellStatus = shellTool.status;
        const toolShellDownloadsMap = downloads.get(this.TOOL_SHELL);
        if (toolShellDownloadsMap === undefined){
            return;
        }
        console.log(shellPath, shellTool, shellStatus)
        if (shellStatus === ToolStatus.NOT_AVAILABLE && !this.isInstalled(toolsPath, toolShellDownloadsMap, Type.SHELL)) {
            // Avoiding 2 threads to install the same thing at the same time
            console.log("Downloading CB Shell.");
            shellTool.status = (ToolStatus.DOWNLOADING);
            this.downloadAndUnzip(shellPath, shell);
        } else {
            console.debug("CBShell is already installed");
            this.setToolActive(ToolStatus.AVAILABLE, shellPath, shell);
        }
    
    };

    private setToolActive(status: ToolStatus, path: string, spec: ToolSpec): void {
        for (const [key, value] of Object.entries(spec.getToolsMap())) {
            const toolType = Type[key as keyof typeof Type];
            if (toolType !== undefined) {
                CBTools.getTool(toolType).path = (`${path}/${value}`);
                CBTools.getTool(toolType).status = status;
            }
        }
    }

    public downloadAndUnzip(targetDir: string, spec: ToolSpec){
        try {
            createFolder(targetDir);
            const fileName = spec.getUrl().substring(spec.getUrl().lastIndexOf('/') + 1);
            const localFilePath = path.join(targetDir, fileName);
            axios.get(spec.getUrl(), { responseType: "stream" }).then((res)=> {
                const writeStream = fs.createWriteStream(localFilePath);
                res.data.pipe(writeStream);
                writeStream.on("finish", () => {
                    writeStream.close();
                    console.log("Download Completed!");
                    decompress(localFilePath, targetDir).then(()=>{
                        console.log("Unzipped Successfully");
                        fs.unlinkSync(localFilePath);
                        makeFilesExecutable(targetDir);
                        this.runFile(targetDir);
                    });
                 });
                
            });
            this.setToolActive(ToolStatus.AVAILABLE, targetDir, spec);
        } catch (e) {
            this.setToolActive(ToolStatus.NOT_AVAILABLE, '', spec);
            console.error(e);
        }
    }
    

    public isInstalled(pluginPath: string, spec: ToolSpec, type: Type): boolean {
        let toolsPathType = spec.getToolsMap().get(type);
        if (toolsPathType === undefined) {
            return false;
        }
        const toolPath = path.join(
            pluginPath,
            spec.getInstallationPath(),
            toolsPathType
        );
    
        return fs.existsSync(toolPath);
    }

    public runFile(targetDir:string) {
        const scriptPath = path.join(targetDir, 'cbsh');
        vscode.window.createTerminal("CBShell", `${scriptPath}`);
        // child_process.exec(`${scriptPath}`, (error, stdout,stderr) => {
        // console.log(`stdout: ${stdout}`);
        //     console.log(`stderr: ${stderr}`);
        //     if (error !== null) {
        //         console.log(`exec error: ${error}`);
        //     }
        // });
    }
}

export default DependenciesDownloader;
