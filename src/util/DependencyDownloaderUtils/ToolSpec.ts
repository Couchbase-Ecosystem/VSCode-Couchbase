import { Type } from './CBTool';

class ToolSpec {
    constructor(
        private url: string,
        private installationPath: string,
        private toolsMap: Map<Type, string>
    ) {}

    getUrl(): string {
        return this.url;
    }

    getInstallationPath(): string {
        return this.installationPath;
    }

    getToolsMap(): Map<Type, string> {
        return this.toolsMap;
    }
}

export default ToolSpec;