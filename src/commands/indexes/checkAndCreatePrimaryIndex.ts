import * as vscode from 'vscode';
import { logger } from '../../logger/logger';
import { Commands } from '../extensionCommands/commands';

export const checkAndCreatePrimaryIndex = async (elementData: any) => {
    const answer = await vscode.window.showWarningMessage(
        "If you are NOT in a production environment we recommend you to create a Primary Index for it to view documents inside the collection. Would you like to create one?",
        { modal: true },
        "Yes",
        "No"
    );
    if (answer === "Yes") {
        await elementData.connection.cluster?.query(
            `CREATE PRIMARY INDEX ON \`${elementData.bucketName}\`.\`${elementData.scopeName}\`.\`${elementData.collectionName}\` USING GSI`
        );
        logger.info(`Created Primay Index on ${elementData.bucketName} ${elementData.scopeName} ${elementData.collectionName} USING GSI`);
        vscode.commands.executeCommand(Commands.refreshCollection, elementData.parentNode);
    }
};