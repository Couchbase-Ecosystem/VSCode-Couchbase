import { logger } from "../../../logger/logger";

export const availableActions = ["Data Import", "Send Feedback", "Data Export", "DDL Export", "Open Query Editor", "Open SQL++ Notebook"];

export const jsonParser = async (text: string) => {
    const jsonObjects: object[] = [];
    const regex = /{[^{}]*}/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        try {
            jsonObjects.push(JSON.parse(match[0]));
        } catch (error) {
            logger.error('Failed to parse JSON: ' + error);
        }
    }
    return jsonObjects;
};