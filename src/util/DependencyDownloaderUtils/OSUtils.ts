class OSUtil {
    static MACOS_ARM = "macos-arm";
    static MACOS_64 = "macos-64";
    static WINDOWS_ARM = "windows-arm";
    static WINDOWS_64 = "windows-64";
    static LINUX_ARM = "linux-arm";
    static LINUX_64 = "linux-64";
    private static usersOS: string | undefined;

    static getOSArch(): string {
        if (!this.usersOS) {
            const os = require('os');
            const platform = os.platform();
            const arch = os.arch();

            if (platform.includes("darwin")) {
                if (arch.includes("arm")) {
                    this.usersOS = OSUtil.MACOS_ARM;
                } else {
                    this.usersOS = OSUtil.MACOS_64;
                }
            } else if (platform.includes("win")) {
                if (arch.includes("arm")) {
                    this.usersOS = OSUtil.WINDOWS_ARM;
                } else {
                    this.usersOS = OSUtil.WINDOWS_64;
                }
            } else {
                if (arch.includes("arm")) {
                    this.usersOS = OSUtil.LINUX_ARM;
                } else {
                    this.usersOS = OSUtil.LINUX_64;
                }
            }
        }
        return this.usersOS;
    }

    static isMacOS(): boolean {
        return (this.getOSArch() === OSUtil.MACOS_64 || this.getOSArch() === OSUtil.MACOS_ARM);
    }

    static isWindows(): boolean {
        return (this.getOSArch() === OSUtil.WINDOWS_64 || this.getOSArch() === OSUtil.WINDOWS_ARM);
    }
}

export default OSUtil;
