import * as path from "path";
import * as fs from "fs";
import { logger } from "../logger/logger";
import { config } from "./versionConfig";

class DependenciesUtil {
    public static readonly VERSION_FILE = config.VERSION_FILE;

    public static readonly CBMIGRATE_KEY = config.CBMIGRATE_KEY;
    public static readonly TOOLS_KEY = config.TOOLS_KEY;
    public static readonly SHELL_KEY = config.SHELL_KEY;
    public static readonly CBIMPORT_EXPORT_KEY = config.CBIMPORT_EXPORT_KEY;

    public static readonly TOOLS_VERSION = config.TOOLS_VERSION;

    public static readonly CBMIGRATE_VERSION = config.CBMIGRATE_VERSION;
    public static readonly SHELL_VERSION = config.SHELL_VERSION;
    public static readonly CBIMPORT_EXPORT_VERSION =
        config.CBIMPORT_EXPORT_VERSION;

    public static createVersioningFile(directoryPath: string): void {
        const filePath = path.join(
            directoryPath,
            DependenciesUtil.VERSION_FILE
        );
        if (!fs.existsSync(filePath)) {
            DependenciesUtil.constructVersionFile(filePath);
        }
    }

    private static constructVersionFile(filePath: string) {
        // Temporarily setting tools version here as we are not using these tools as of now
        const propertiesContent = `${DependenciesUtil.TOOLS_KEY}=${DependenciesUtil.TOOLS_VERSION}\n${DependenciesUtil.SHELL_KEY}=\n${DependenciesUtil.CBIMPORT_EXPORT_KEY}=\n${DependenciesUtil.CBMIGRATE_KEY}=\n`;

        try {
            fs.writeFileSync(filePath, propertiesContent, {
                encoding: "utf-8",
            });
            logger.info("CB Tool Versions file created successfully.");
        } catch (e) {
            console.error("Failed to create the config file, error: ", e);
            throw e;
        }
    }

    public static getPropertyValue(
        directoryPath: string,
        propertyName: string
    ): string | null {
        const filePath = path.join(
            directoryPath,
            DependenciesUtil.VERSION_FILE
        );
        try {
            const fileContent = fs.readFileSync(filePath, {
                encoding: "utf-8",
            });
            if (fileContent) {
                const properties =
                    DependenciesUtil.parseVersionFile(fileContent);
                const value = properties[propertyName];
                return value && value.trim() ? value : null;
            } else {
                return null;
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    public static setPropertyValue(
        directoryPath: string,
        propertyName: string,
        value: string
    ) {
        const filePath = path.join(
            directoryPath,
            DependenciesUtil.VERSION_FILE
        );
        try {
            const fileContent = fs.readFileSync(filePath, {
                encoding: "utf-8",
            });
            let lines = fileContent.split(/\r?\n/);

            const updatedLines = lines.map((line) => {
                if (line.startsWith(propertyName + "=")) {
                    return `${propertyName}=${value}`;
                }
                return line;
            });
            fs.writeFileSync(filePath, updatedLines.join("\n"), {
                encoding: "utf-8",
            });
        } catch (e) {
            console.error("Error occurred while setting the property value", e);
            return null;
        }
    }

    private static parseVersionFile(
        fileContent: string
    ): Record<string, string> {
        const properties: Record<string, string> = {};
        fileContent.split("\n").forEach((line) => {
            const index = line.indexOf("=");
            if (index > -1) {
                const key = line.substring(0, index).trim();
                const value = line.substring(index + 1).trim();
                properties[key] = value;
            }
        });
        return properties;
    }

    public static deleteFolder(folderPath: string): void {
        try {
            fs.rmdirSync(folderPath, { recursive: true });
        } catch (error) {
            logger.error(
                `An error occurred while deleting the folder: ${folderPath}, error: ${error}`
            );
        }
    }
}

export default DependenciesUtil;
