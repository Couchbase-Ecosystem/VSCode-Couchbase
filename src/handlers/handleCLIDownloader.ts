import {
    CBTools,
    ToolStatus,
    Type as CBToolsType,
} from "../util/DependencyDownloaderUtils/CBTool";
import OSUtil from "../util/DependencyDownloaderUtils/OSUtils";
import {
    createFolder,
    makeFilesExecutable,
} from "../util/DependencyDownloaderUtils/fileUtils";
import ToolSpec from "../util/DependencyDownloaderUtils/ToolSpec";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import decompress from "decompress";
import { logger } from "../logger/logger";
import DependenciesUtil from "./dependenciesUtil";

class DependenciesDownloader {
    private readonly TOOL_SHELL = "shell";
    private readonly TOOL_IMPORT_EXPORT = "import_export";
    private readonly ALL_TOOLS = "all_tools";
    private readonly TOOL_MDB_MIGRATE = "cb_migrate";

    private getToolInstallPath(toolKey: string): string {
        if (toolKey === this.TOOL_SHELL) {
            return "cbshell";
        } else if (toolKey === this.TOOL_IMPORT_EXPORT) {
            return "cbimport_export";
        } else if (toolKey === this.TOOL_MDB_MIGRATE) {
            return "cbmigrate";
        } else if (toolKey === this.ALL_TOOLS) {
            return "cbtools";
        } else {
            throw new Error("Not Implemented yet");
        }
    }

    private getToolsMap(toolKey: string, os: string): Map<CBToolsType, string> {
        const suffix = os.includes("mac") || os.includes("linux") ? "" : ".exe";
        const pathPrefix = "bin" + path.sep;

        const map = new Map<CBToolsType, string>();

        if (toolKey === this.TOOL_SHELL) {
            map.set(CBToolsType.SHELL, "cbsh" + suffix);
        } else if (toolKey === this.TOOL_IMPORT_EXPORT) {
            map.set(
                CBToolsType.CB_IMPORT,
                path.join(pathPrefix, "cbimport" + suffix)
            );
            map.set(
                CBToolsType.CB_EXPORT,
                path.join(pathPrefix, "cbexport" + suffix)
            );
        } else if (toolKey === this.TOOL_MDB_MIGRATE) {
            map.set(CBToolsType.CB_MIGRATE, "cbmigrate" + suffix);
        } else if (toolKey === this.ALL_TOOLS) {
            map.set(
                CBToolsType.CBC_PILLOW_FIGHT,
                path.join(pathPrefix, "cbc-pillowfight" + suffix)
            );
            map.set(
                CBToolsType.MCTIMINGS,
                path.join(pathPrefix, "mctimings" + suffix)
            );
        } else {
            throw new Error("Not implemented yet");
        }

        return map;
    }

    private getToolSpec(url: string, toolKey: string, os: string): ToolSpec {
        return new ToolSpec(
            url,
            this.getToolInstallPath(toolKey),
            this.getToolsMap(toolKey, os)
        );
    }
    public getDownloadList(os: string): Map<string, ToolSpec> {
        const map = new Map<string, ToolSpec>();
        if (os === OSUtil.MACOS_64) {
            map.set(
                this.TOOL_SHELL,
                this.getToolSpec(
                    "https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-apple-darwin.zip",
                    this.TOOL_SHELL,
                    OSUtil.MACOS_64
                )
            );
            map.set(
                this.TOOL_IMPORT_EXPORT,
                this.getToolSpec(
                    "https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-macos_x86_64.zip",
                    this.TOOL_IMPORT_EXPORT,
                    OSUtil.MACOS_64
                )
            );
            map.set(
                this.ALL_TOOLS,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-macos_64.zip",
                    this.ALL_TOOLS,
                    OSUtil.MACOS_64
                )
            );
            map.set(
                this.TOOL_MDB_MIGRATE,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/cbmigrate/cbmigrate_0.0.1-beta_darwin_amd64.zip",
                    this.TOOL_MDB_MIGRATE,
                    OSUtil.MACOS_64
                )
            );
        } else if (os === OSUtil.MACOS_ARM) {
            map.set(
                this.TOOL_SHELL,
                this.getToolSpec(
                    "https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-aarch64-apple-darwin.zip",
                    this.TOOL_SHELL,
                    OSUtil.MACOS_ARM
                )
            );
            map.set(
                this.TOOL_IMPORT_EXPORT,
                this.getToolSpec(
                    "https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-macos_arm64.zip",
                    this.TOOL_IMPORT_EXPORT,
                    OSUtil.MACOS_ARM
                )
            );
            map.set(
                this.ALL_TOOLS,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-macos_arm.zip",
                    this.ALL_TOOLS,
                    OSUtil.MACOS_ARM
                )
            );
            map.set(
                this.TOOL_MDB_MIGRATE,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/cbmigrate/cbmigrate_0.0.1-beta_darwin_arm64.zip",
                    this.TOOL_MDB_MIGRATE,
                    OSUtil.MACOS_ARM
                )
            );
        } else if (os === OSUtil.WINDOWS_64) {
            map.set(
                this.TOOL_SHELL,
                this.getToolSpec(
                    "https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-pc-windows-msvc.zip",
                    this.TOOL_SHELL,
                    OSUtil.WINDOWS_64
                )
            );
            map.set(
                this.TOOL_IMPORT_EXPORT,
                this.getToolSpec(
                    "https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-windows_amd64.zip",
                    this.TOOL_IMPORT_EXPORT,
                    OSUtil.WINDOWS_64
                )
            );
            map.set(
                this.ALL_TOOLS,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-windows_64.zip",
                    this.ALL_TOOLS,
                    OSUtil.WINDOWS_64
                )
            );
            map.set(
                this.TOOL_MDB_MIGRATE,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/cbmigrate/cbmigrate_0.0.1-beta_windows_amd64.zip",
                    this.TOOL_MDB_MIGRATE,
                    OSUtil.WINDOWS_64
                )
            );
        } else if (os === OSUtil.WINDOWS_ARM) {
            map.set(
                this.TOOL_SHELL,
                this.getToolSpec(
                    "https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-pc-windows-msvc.zip",
                    this.TOOL_SHELL,
                    OSUtil.WINDOWS_ARM
                )
            );
            map.set(
                this.TOOL_IMPORT_EXPORT,
                this.getToolSpec(
                    "https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-windows_amd64.zip",
                    this.TOOL_IMPORT_EXPORT,
                    OSUtil.WINDOWS_ARM
                )
            );
            map.set(
                this.ALL_TOOLS,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-windows_64.zip",
                    this.ALL_TOOLS,
                    OSUtil.WINDOWS_ARM
                )
            );
            map.set(
                this.TOOL_MDB_MIGRATE,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/cbmigrate/cbmigrate_0.0.1-beta_windows_amd64.zip",
                    this.TOOL_MDB_MIGRATE,
                    OSUtil.WINDOWS_ARM
                )
            );
        } else if (os === OSUtil.LINUX_64) {
            map.set(
                this.TOOL_SHELL,
                this.getToolSpec(
                    "https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-unknown-linux-gnu.tar.gz",
                    this.TOOL_SHELL,
                    OSUtil.LINUX_64
                )
            );
            map.set(
                this.TOOL_IMPORT_EXPORT,
                this.getToolSpec(
                    "https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-linux_x86_64.tar.gz",
                    this.TOOL_IMPORT_EXPORT,
                    OSUtil.LINUX_64
                )
            );
            map.set(
                this.ALL_TOOLS,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-linux_64.zip",
                    this.ALL_TOOLS,
                    OSUtil.LINUX_64
                )
            );
            map.set(
                this.TOOL_MDB_MIGRATE,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/cbmigrate/cbmigrate_0.0.1-beta_linux_amd64.zip",
                    this.TOOL_MDB_MIGRATE,
                    OSUtil.LINUX_64
                )
            );
        } else if (os === OSUtil.LINUX_ARM) {
            map.set(
                this.TOOL_SHELL,
                this.getToolSpec(
                    "https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-aarch64-unknown-linux-gnu.tar.gz",
                    this.TOOL_SHELL,
                    OSUtil.LINUX_ARM
                )
            );
            map.set(
                this.TOOL_IMPORT_EXPORT,
                this.getToolSpec(
                    "https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-linux_aarch64.tar.gz",
                    this.TOOL_IMPORT_EXPORT,
                    OSUtil.LINUX_ARM
                )
            );
            map.set(
                this.TOOL_MDB_MIGRATE,
                this.getToolSpec(
                    "https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/cbmigrate/cbmigrate_0.0.1-beta_linux_arm64.zip",
                    this.TOOL_MDB_MIGRATE,
                    OSUtil.LINUX_ARM
                )
            );
        } else {
            throw new Error("OS not supported.");
        }
        return map;
    }

    public cleanOldVersions(
        extensionPath: string,
        toolsPath: string,
        downloads: Map<string, ToolSpec>
    ) {
        logger.info("Cleaning up older tools versions if update required");
        const shell: ToolSpec | undefined = downloads.get(this.TOOL_SHELL);
        if (shell == undefined) {
            return;
        }
        // Checks if CB shell is installed and requires update by comparing current version of tool with version config value
        if (
            this.isInstalled(toolsPath, shell, CBToolsType.SHELL) &&
            (
                DependenciesUtil.SHELL_VERSION !==
                DependenciesUtil.getPropertyValue(
                    extensionPath,
                    DependenciesUtil.SHELL_KEY
                )
            )
        ) {
            logger.info(
                "A new version of Couchbase Shell is available. Removing local version and downloading the new one"
            );
            DependenciesUtil.deleteFolder(
                toolsPath + path.sep + shell.getInstallationPath()
            );


        }
        const cbimport_export: ToolSpec | undefined = downloads.get(this.TOOL_IMPORT_EXPORT);
        if (cbimport_export == undefined) {
            return;
        }
        // Checks if CB Import/Export is installed and requires update by comparing current version of tool with version config value
        if (this.isInstalled(toolsPath, cbimport_export, CBToolsType.CB_EXPORT) && (DependenciesUtil.CBIMPORT_EXPORT_VERSION !== DependenciesUtil.getPropertyValue(extensionPath, DependenciesUtil.CBIMPORT_EXPORT_KEY))) {
            logger.info("A new version of Couchbase CB Import/Export is available. Removing local version and downloading the new one");
            DependenciesUtil.deleteFolder(
                toolsPath + path.sep + cbimport_export.getInstallationPath()
            );
        }
        const cbMigrate: ToolSpec | undefined = downloads.get(this.TOOL_MDB_MIGRATE);
        if (cbMigrate == undefined) {
            return;
        }
        // Checks if CB Migrate is installed and requires update by comparing current version of tool with version config value
        if (this.isInstalled(toolsPath, cbMigrate, CBToolsType.CB_MIGRATE) && (DependenciesUtil.CBMIGRATE_VERSION !== DependenciesUtil.getPropertyValue(extensionPath, DependenciesUtil.CBMIGRATE_KEY))) {
            logger.info("A new version of Couchbase CBMigrate is available. Removing local version and downloading the new one");
            DependenciesUtil.deleteFolder(
                toolsPath + path.sep + cbMigrate.getInstallationPath()
            );
        }
    }

    public handleCLIDownloader = () => {
        const extensionPath = path.join(
            __filename,
            "..",
            "cb-vscode-extension"
        );
        createFolder(extensionPath);
        DependenciesUtil.createVersioningFile(extensionPath);
        const toolsPath = path.join(extensionPath, "tools");
        createFolder(toolsPath);
        const osArch = OSUtil.getOSArch();
        const downloads: Map<string, ToolSpec> = this.getDownloadList(osArch);
        this.cleanOldVersions(extensionPath, toolsPath, downloads);
        // Installs the tools if not already installed
        this.manageShellInstallation(downloads, toolsPath, extensionPath);
        this.manageCbMigrateInstallation(downloads, toolsPath, extensionPath);
        this.manageDataImportExportInstallation(downloads, toolsPath, extensionPath);
    };

    private setToolActive(
        status: ToolStatus,
        path: string,
        spec: ToolSpec
    ): void {
        spec.getToolsMap().forEach((key, val) => {
            const toolType = CBToolsType[val as keyof typeof CBToolsType];
            if (toolType !== undefined) {
                CBTools.getTool(toolType).path = `${path}/${key}`;
                CBTools.getTool(toolType).status = status;
            }
        });
    }

    public downloadAndUnzip(targetDir: string, spec: ToolSpec, configFolder: string, key: string, value: string) {
        try {
            createFolder(targetDir);
            const fileName = spec
                .getUrl()
                .substring(spec.getUrl().lastIndexOf("/") + 1);
            const localFilePath = path.join(targetDir, fileName);
            axios.get(spec.getUrl(), { responseType: "stream" }).then((res) => {
                const writeStream = fs.createWriteStream(localFilePath);
                res.data.pipe(writeStream);
                writeStream.on("finish", () => {
                    writeStream.close();
                    decompress(localFilePath, targetDir).then(() => {
                        fs.unlinkSync(localFilePath);
                        makeFilesExecutable(targetDir);
                        //this.runFile(targetDir); // Uncomment runFile Function below if testing a specific CLI Tool is required
                    });
                });
            });
            this.setToolActive(ToolStatus.AVAILABLE, targetDir, spec);
            DependenciesUtil.setPropertyValue(configFolder, key, value)
        } catch (e) {
            this.setToolActive(ToolStatus.NOT_AVAILABLE, "", spec);
            logger.error(e);
        }
    }

    public isInstalled(
        pluginPath: string,
        spec: ToolSpec,
        type: CBToolsType
    ): boolean {
        const toolsPathType = spec.getToolsMap().get(type);
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

    public manageShellInstallation(
        downloads: Map<string, ToolSpec>,
        toolsPath: string,
        extensionPath: string
    ): void {
        const shell = downloads.get(this.TOOL_SHELL);
        if (shell === undefined) {
            return;
        }
        const shellPath = path.join(toolsPath, shell.getInstallationPath());
        const shellTool = CBTools.getTool(CBToolsType.SHELL);
        const shellStatus = shellTool.status;
        const toolShellDownloadsMap = downloads.get(this.TOOL_SHELL);
        if (toolShellDownloadsMap === undefined) {
            return;
        }
        if (
            shellStatus === ToolStatus.NOT_AVAILABLE &&
            !this.isInstalled(
                toolsPath,
                toolShellDownloadsMap,
                CBToolsType.SHELL
            )
        ) {
            // Avoiding 2 threads to install the same thing at the same time
            logger.info("Downloading CB Shell.");
            shellTool.status = ToolStatus.DOWNLOADING;
            this.downloadAndUnzip(shellPath, shell, extensionPath, DependenciesUtil.SHELL_KEY, DependenciesUtil.SHELL_VERSION);
        } else {
            logger.debug("CBShell is already installed");
            this.setToolActive(ToolStatus.AVAILABLE, shellPath, shell);
        }
    }

    public manageCbMigrateInstallation(
        downloads: Map<string, ToolSpec>,
        toolsPath: string,
        extensionPath: string
    ): void {
        const cbMigrate = downloads.get(this.TOOL_MDB_MIGRATE);
        if (cbMigrate === undefined) {
            return;
        }
        const cbMigratePath = path.join(
            toolsPath,
            cbMigrate.getInstallationPath()
        );
        const cbMigrateTool = CBTools.getTool(CBToolsType.CB_MIGRATE);
        const cbMigrateStatus = cbMigrateTool.status;
        const cbMigrateDownloadsMap = downloads.get(this.TOOL_MDB_MIGRATE);
        if (cbMigrateDownloadsMap === undefined) {
            return;
        }
        if (
            cbMigrateStatus === ToolStatus.NOT_AVAILABLE &&
            !this.isInstalled(
                toolsPath,
                cbMigrateDownloadsMap,
                CBToolsType.CB_MIGRATE
            )
        ) {
            // Avoiding 2 threads to install the same thing at the same time
            logger.info("Downloading CB Migrate.");
            cbMigrateTool.status = ToolStatus.DOWNLOADING;
            this.downloadAndUnzip(cbMigratePath, cbMigrate, extensionPath, DependenciesUtil.CBMIGRATE_KEY, DependenciesUtil.CBMIGRATE_VERSION);
        } else {
            logger.debug("CBMigrate is already installed");
            this.setToolActive(ToolStatus.AVAILABLE, cbMigratePath, cbMigrate);
        }
    }

    public manageDataImportExportInstallation(
        downloads: Map<string, ToolSpec>,
        toolsPath: string,
        extensionPath: string
    ): void {
        const cbImport: ToolSpec | undefined = downloads.get(
            this.TOOL_IMPORT_EXPORT
        );
        if (cbImport === undefined) {
            return;
        }
        const cbImportDir: string = path.join(
            toolsPath,
            cbImport.getInstallationPath()
        );
        const toolImpExportMap = downloads.get(this.TOOL_IMPORT_EXPORT);
        if (toolImpExportMap === undefined) {
            return;
        }
        if (
            CBTools.getTool(CBToolsType.CB_IMPORT).status ===
            ToolStatus.NOT_AVAILABLE &&
            !this.isInstalled(
                toolsPath,
                toolImpExportMap,
                CBToolsType.CB_EXPORT
            )
        ) {
            logger.info(
                "Downloading CB Import/Export. The feature will be automatically enabled when the download is complete."
            );

            const cbExportTool = CBTools.getTool(CBToolsType.CB_EXPORT);
            const cbImportTool = CBTools.getTool(CBToolsType.CB_IMPORT);

            cbExportTool.status = ToolStatus.DOWNLOADING;
            cbImportTool.status = ToolStatus.DOWNLOADING;

            this.downloadAndUnzip(cbImportDir, cbImport, extensionPath, DependenciesUtil.CBIMPORT_EXPORT_KEY, DependenciesUtil.CBIMPORT_EXPORT_VERSION);
        } else {
            logger.info("CB Import/Export is already installed");
            this.setToolActive(ToolStatus.AVAILABLE, cbImportDir, cbImport);
        }
    }

    // This is a test function, keeping this here to check for any specific downloaded CLI tool
    /* public runFile(targetDir:string) {
         const scriptPath = path.join(targetDir, 'cbsh');
         vscode.window.createTerminal("CBShell", `${scriptPath}`);
     }
    */
}

export default DependenciesDownloader;
