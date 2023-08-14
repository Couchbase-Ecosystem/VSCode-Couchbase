const path = require('path');
const TOOL_SHELL = "shell";
const TOOL_IMPORT_EXPORT = "import_export";
const ALL_TOOLS = "all_tools";
const fs = require('fs')

const OS = {
    MACOS_64: "macos_64",
    MACOS_ARM: "macos_arm",
    WINDOWS_64: "windows_64",
    WINDOWS_ARM: "windows_arm",
    LINUX_64: "linux_64",
    LINUX_ARM: "linux_arm"
};

const Type = {
    SHELL: "SHELL",
    CB_IMPORT: "CB_IMPORT",
    CB_EXPORT: "CB_EXPORT",
    CBC_PILLOW_FIGHT: "CBC_PILLOW_FIGHT",
    MCTIMINGS: "MCTIMINGS"
};

const ToolStatus = {
    NOT_AVAILABLE: "NOT_AVAILABLE",
    DOWNLOADING: "DOWNLOADING",
    AVAILABLE: "AVAILABLE"
};

class CBTool {
    constructor() {
        this.status = null;
        this.path = "";
    }
}

const tools = new Map(Object.values(Type).map(type => [type, new CBTool()]));

function getToolInstallPath(toolKey) {
    if (toolKey === TOOL_SHELL) {
        return "cbshell";
    } else if (toolKey === TOOL_IMPORT_EXPORT) {
        return "cbimport_export";
    } else if (toolKey === ALL_TOOLS) {
        return "cbtools";
    } else {
        throw new Error("Not implemented yet");
    }
}

function getToolsMap(toolKey, os) {
    let suffix = "";
    let path = "bin" + require('path').sep;

    const unixBased = [
        OS.MACOS_64,
        OS.MACOS_ARM,
        OS.LINUX_64,
        OS.LINUX_ARM
    ].includes(os);

    if (!unixBased) {
        suffix = ".exe";
    }

    const map = new Map();

    if (toolKey === TOOL_SHELL) {
        map.set(Type.SHELL, "cbsh" + suffix);
    } else if (toolKey === TOOL_IMPORT_EXPORT) {
        map.set(Type.CB_IMPORT, path + "cbimport" + suffix);
        map.set(Type.CB_EXPORT, path + "cbexport" + suffix);
    } else if (toolKey === ALL_TOOLS) {
        map.set(Type.CBC_PILLOW_FIGHT, path + "cbc-pillowfight" + suffix);
        map.set(Type.MCTIMINGS, path + "mctimings" + suffix);
    } else {
        throw new Error("Not implemented yet");
    }

    return map;
}


function getToolSpec(url, toolKey, os) {
    return {
        url: url,
        installPath: getToolInstallPath(toolKey),
        toolsMap: getToolsMap(toolKey, os)
    };
}

function getDownloadList(os) {
    const map = new Map();

    if (os === OS.MACOS_64) {
        map.set(TOOL_SHELL, getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-apple-darwin.zip", TOOL_SHELL, OS.MACOS_64));
        map.set(TOOL_IMPORT_EXPORT, getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-macos_x86_64.zip", TOOL_IMPORT_EXPORT, OS.MACOS_64));
        map.set(ALL_TOOLS, getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-macos_64.zip", ALL_TOOLS, OS.MACOS_64));
    } else if (os === OS.MACOS_ARM) {
        map.set(TOOL_SHELL, getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-aarch64-apple-darwin.zip", TOOL_SHELL, OS.MACOS_ARM));
        map.set(TOOL_IMPORT_EXPORT, getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-macos_arm64.zip", TOOL_IMPORT_EXPORT, OS.MACOS_ARM));
        map.set(ALL_TOOLS, getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-macos_arm.zip", ALL_TOOLS, OS.MACOS_ARM));
    } else if (os === OS.WINDOWS_64) {
        map.set(TOOL_SHELL, getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-pc-windows-msvc.zip", TOOL_SHELL, OS.WINDOWS_64));
        map.set(TOOL_IMPORT_EXPORT, getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-windows_amd64.zip", TOOL_IMPORT_EXPORT, OS.WINDOWS_64));
        map.set(ALL_TOOLS, getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-windows_64.zip", ALL_TOOLS, OS.WINDOWS_64));
    } else if (os === OS.WINDOWS_ARM) {
        map.set(TOOL_SHELL, getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-pc-windows-msvc.zip", TOOL_SHELL, OS.WINDOWS_ARM));
        map.set(TOOL_IMPORT_EXPORT, getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-windows_amd64.zip", TOOL_IMPORT_EXPORT, OS.WINDOWS_ARM));
        map.set(ALL_TOOLS, getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-windows_64.zip", ALL_TOOLS, OS.WINDOWS_ARM));
    } else if (os === OS.LINUX_64) {
        map.set(TOOL_SHELL, getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-x86_64-unknown-linux-gnu.tar.gz", TOOL_SHELL, OS.LINUX_64));
        map.set(TOOL_IMPORT_EXPORT, getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-linux_x86_64.tar.gz", TOOL_IMPORT_EXPORT, OS.LINUX_64));
        map.set(ALL_TOOLS, getToolSpec("https://intellij-plugin-dependencies.s3.us-east-2.amazonaws.com/7.2.0-linux_64.zip", ALL_TOOLS, OS.LINUX_64));
    } else if (os === OS.LINUX_ARM) {
        map.set(TOOL_SHELL, getToolSpec("https://github.com/couchbaselabs/couchbase-shell/releases/download/v0.75.1/cbsh-aarch64-unknown-linux-gnu.tar.gz", TOOL_SHELL, OS.LINUX_ARM));
        map.set(TOOL_IMPORT_EXPORT, getToolSpec("https://packages.couchbase.com/releases/7.2.0/couchbase-server-tools_7.2.0-linux_aarch64.tar.gz", TOOL_IMPORT_EXPORT, OS.LINUX_ARM));
    } else {
        throw new Error("OS not supported.");
    }

    return map;
}

function getOSArch() {
   let usersOS = '';
        const os = require('os');
        const platform = os.platform();
        const arch = os.arch();

        if (platform.includes("darwin")) {
            if (arch.includes("arm")) {
                usersOS = "macos-arm";
            } else {
                usersOS = "macos-64";
            }
        } else if (platform.includes("win")) {
            if (arch.includes("arm")) {
                usersOS = "windows-arm";
            } else {
                usersOS = "windows-64";
            }
        } else {
            if (arch.includes("arm")) {
                usersOS = "linux-arm";
            } else {
                usersOS = "linux-64";
            }
        }
    
    return usersOS;
}

function isMacOS() {
    return (getOSArch() === "macos-64" || getOSArch() === "macos-arm");
}

function isWindows() {
    return (getOSArch() === "windows-64" || getOSArch() === "windows-arm");
}

function downloadDependencies() {
    const toolsPath = path.join('/', "couchbase-intellij-plugin", "tools");
    // createFolder(toolsPath);
    try {
        if (!fs.existsSync(toolsPath)) {
          fs.mkdirSync(toolsPath);
        }
      } catch (err) {
        console.error(err);
      }
    const os = getOSArch();
    const downloads = getDownloadList(os);

    const shell = downloads.get(TOOL_SHELL);
    const shellPath = path.join(toolsPath, shell.getInstallationPath());
    if (tools[Type.SHELL].status === ToolStatus.NOT_AVAILABLE
        && !isInstalled(toolsPath, downloads.get(TOOL_SHELL), Type.SHELL)) {
        // avoiding 2 threads to install the same thing at the same time
        console.log("Downloading CB Shell. The feature will be automatically enabled when the download is complete.");
        tools[Type.SHELL].status = (ToolStatus.DOWNLOADING);
        downloadAndUnzip(shellPath, shell);
    } else {
        console.debug("CBShell is already installed");
        setToolActive(ToolStatus.AVAILABLE, shellPath, shell);
    }

    const cbImport = downloads.get(TOOL_IMPORT_EXPORT);
    const cbImportDir = path.join(toolsPath, cbImport.getInstallationPath());
    if (tools[Type.CB_IMPORT].status === ToolStatus.NOT_AVAILABLE
        && !isInstalled(toolsPath, downloads.get(TOOL_IMPORT_EXPORT), Type.CB_EXPORT)) {
        // avoiding 2 threads to install the same thing at the same time
        console.log("Downloading CB Import/Export. The feature will be automatically enabled when the download is complete.");
        tools[Type.CB_EXPORT].status = (ToolStatus.DOWNLOADING);
        tools[Type.CB_IMPORT].status = (ToolStatus.DOWNLOADING);
        downloadAndUnzip(cbImportDir, cbImport);
    } else {
        Log.debug("CB Import/Export is already installed");
        setToolActive(ToolStatus.AVAILABLE, cbImportDir, cbImport);
    }

    const cbTools = downloads.get(ALL_TOOLS);
    const toolsDir = path.join(toolsPath, getInstallationPath());
    if (tools[Type.CBC_PILLOW_FIGHT].status === ToolStatus.NOT_AVAILABLE
        && !isInstalled(toolsPath, downloads.get(ALL_TOOLS), Type.CBC_PILLOW_FIGHT)) {
        console.log("Downloading CB tools. The feature will be automatically enabled when the download is complete.");
        tools[Type.CBC_PILLOW_FIGHT].status = (ToolStatus.DOWNLOADING);
        tools[Type.MCTIMINGS].status = (ToolStatus.DOWNLOADING);
        downloadAndUnzip(toolsDir, cbTools);
    } else {
        console.log("CB Tools are already installed");
        setToolActive(ToolStatus.AVAILABLE, toolsDir, cbTools);
    }
}

function setToolActive(status, path, spec) {
    for (const [key, value] of spec.getToolsMap().entries()) {
        tools[key].path = (path + path.sep + value);
        tools[key].status = (status);
    }
}

function downloadAndUnzip(targetDir, spec) {
    Promise.resolve().then(() => {
        try {
            
            const fileName = spec.getUrl().substring(spec.getUrl().lastIndexOf("/") + 1);
            const localFilePath = path.join(targetDir, fileName);
            const website = new URL(spec.getUrl());
            const rbc = website.openStream();
            const fos = fs.createWriteStream(localFilePath);

            rbc.pipe(fos);

            fos.on('finish', () => {
                unzipFile(localFilePath, targetDir);
                makeFilesExecutable(new File(targetDir));
                setToolActive(ToolStatus.AVAILABLE, targetDir, spec);
            });

            fos.on('error', (err) => {
                setToolActive(ToolStatus.NOT_AVAILABLE, null, null);
                Log.error(err);
            });
        } catch (e) {
            setToolActive(ToolStatus.NOT_AVAILABLE, null, null);
            Log.error(e);
            console.error(e);
        }
    });
}

function isInstalled(pluginPath, spec, type) {
    const toolPath = path.join(pluginPath, spec.installPath, spec.toolsMap.get(type));
    return fs.existsSync(toolPath);
}

downloadDependencies();