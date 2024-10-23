enum ToolStatus {
    NOT_AVAILABLE = "NOT_AVAILABLE",
    DOWNLOADING = "DOWNLOADING",
    AVAILABLE = "AVAILABLE"
}

class CBTool {
    status: ToolStatus = ToolStatus.NOT_AVAILABLE;
    path: string = "";

    isAvailable(): boolean {
        return this.status === ToolStatus.AVAILABLE;
    }
}


export enum Type {
    SHELL = "SHELL",
    CB_IMPORT = "CB_IMPORT",
    CB_EXPORT = "CB_EXPORT",
    CBC_PILLOW_FIGHT = "CBC_PILLOW_FIGHT",
    MCTIMINGS = "MCTIMINGS",
    CB_MIGRATE = "CB_MIGRATE",
    SDK_DOCTOR = "SDK_DOCTOR"
}



class CBTools {
    static tools: Map<Type, CBTool> = new Map<Type, CBTool>(
        Object.values(Type).map(type => [type, new CBTool()])
    );

    static getTool(type: Type): CBTool {
        return CBTools.tools.get(type)!;
    }
}


export { CBTools, ToolStatus };
