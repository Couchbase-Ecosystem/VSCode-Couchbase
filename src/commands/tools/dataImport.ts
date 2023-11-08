import {
    CBTools,
    Type as CBToolsType,
} from "../../util/DependencyDownloaderUtils/CBTool";
import { getActiveConnection } from "../../util/connections";
import * as vscode from "vscode";
import * as path from "path";
import { Memory } from "../../util/util";
import { Constants } from "../../util/constants";
import { logger } from "../../logger/logger";
import { getLoader } from "../../webViews/loader.webview";
import { getDatasetAndCollection } from "../../webViews/tools/dataImport/getDatasetAndCollection.webview";
import * as fs from "fs";
import { getScopes } from "../../pages/Tools/DataExport/dataExport";
import { getKeysAndAdvancedSettings } from "../../webViews/tools/dataImport/getKeysAndAdvancedSettings.webview";
import { CBImport } from "../../tools/CBImport";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";
import * as readline from "readline";
import * as csv from "csv-parse";
import { v4 as uuidv4 } from "uuid";
import { getSummary } from "../../webViews/tools/dataImport/getSummary.webview";

interface IDataImportWebviewState {
    webviewPanel: vscode.WebviewPanel;
}
export class DataImport {
    cachedJsonDocs: string[] = [];
    cachedCsvDocs: Map<string, string[]> = new Map();
    PREVIEW_SIZE: number = 6;
    JSON_FILE_EXTENSION: string = ".json";
    CSV_FILE_EXTENSION: string = ".csv";
    JSON_FILE_FORMAT: string = "json";
    CSV_FILE_FORMAT: string = "csv";
    datasetField: string = "";
    format: string = "";
    readonly UUID_FLAG = "#UUID#";
    readonly MONO_INCR_FLAG = "#MONO_INCR#";
    readonly WORDS_WITH_PERCENT_SYMBOLS_REGEX = "%(\\w+)%";

    protected readonly possibleScopeFields: string[] = [
        "cbms",
        "scope",
        "cbs",
        "type",
        "category",
    ];
    protected readonly possibleCollectionFields: string[] = [
        "cbmc",
        "collection",
        "cbc",
        "subtype",
        "subcategory",
    ];
    protected readonly possibleKeyFields: string[] = [
        "cbmid",
        "id",
        "uuid",
        "name",
        "cbmk",
        "key",
        "cbk",
    ];

    protected fileFormat: string = "";
    constructor() {}

    // Functions to fetch key previews
    protected cleanString(input: string): string {
        const firstOpenBracket = input.indexOf("{");
        const lastCloseBracket = input.lastIndexOf("}");

        if (
            firstOpenBracket === -1 ||
            lastCloseBracket === -1 ||
            firstOpenBracket > lastCloseBracket
        ) {
            return input;
        }

        return input.substring(firstOpenBracket, lastCloseBracket + 1);
    }

    protected isValidBrackets(s: string): boolean {
        const stack: string[] = [];

        if (!s.includes("{") || !s.includes("}")) {
            return false;
        }

        for (const c of s) {
            if (c === "{") {
                stack.push(c);
            } else if (
                c === "}" &&
                (stack.length === 0 || stack.pop() !== "{")
            ) {
                return false;
            }
        }

        return stack.length === 0;
    }

    private readAndProcessPartialDataFromDataset = async () => {
        try {
            const datasetPath: string = this.datasetField;
            if (datasetPath.endsWith(this.JSON_FILE_EXTENSION)) {
                if (this.format === "list") {
                    const jsonList = await this.sampleElementFromJsonArrayFile(
                        datasetPath
                    );
                    if (jsonList) {
                        for (let element of jsonList) {
                            this.cachedJsonDocs.push(this.cleanString(element));
                        }
                    } else {
                        logger.error(
                            "Failed to read data from json array dataset"
                        );
                        return;
                    }
                } else if (this.format === "lines") {
                    const jsonLines = await this.sampleElementFromJsonLinesFile(
                        datasetPath
                    );
                    if (jsonLines) {
                        for (let element of jsonLines) {
                            this.cachedJsonDocs.push(this.cleanString(element));
                        }
                    } else {
                        logger.error(
                            "Failed to read data from json array dataset"
                        );
                        return;
                    }
                }
            } else {
                const headers = await this.sampleElementFromCsvFile(
                    datasetPath,
                    1
                );
                if (headers === null) {
                    return;
                }
                for (
                    let lineNumber = 2;
                    lineNumber < 2 + this.PREVIEW_SIZE;
                    lineNumber++
                ) {
                    const data = await this.sampleElementFromCsvFile(
                        datasetPath,
                        lineNumber
                    );
                    if (data === null) {
                        continue;
                    }

                    for (
                        let headersIndex = 0;
                        headersIndex < headers.length;
                        headersIndex++
                    ) {
                        let cachedCsv = this.cachedCsvDocs.get(
                            headers[headersIndex]
                        );
                        if (!cachedCsv) {
                            cachedCsv = new Array(this.PREVIEW_SIZE);
                        }
                        cachedCsv[lineNumber - 2] = data[headersIndex];
                        this.cachedCsvDocs.set(
                            headers[headersIndex],
                            cachedCsv
                        );
                    }
                }
            }
        } catch (err) {
            logger.error(err);
        }
    };

    async updateKeyPreview(keyType: string, keyExpr: string): Promise<string> {
        if (
            (this.fileFormat === this.JSON_FILE_FORMAT &&
                this.cachedJsonDocs.length === 0) ||
            (this.fileFormat === this.CSV_FILE_FORMAT &&
                this.cachedCsvDocs.size === 0)
        ) {
            await this.readAndProcessPartialDataFromDataset();
            // Wait 500ms extra to cache everything
            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
        }

        const previewContent: string[] = [];
        let monoIncrValue = 1;

        if (keyType === "fieldValue") {
            const fieldName = keyExpr;
            if (this.fileFormat === this.JSON_FILE_FORMAT) {
                for (
                    let i = 0;
                    i < Math.min(this.cachedJsonDocs.length, this.PREVIEW_SIZE);
                    i++
                ) {
                    const jsonObject = JSON.parse(this.cachedJsonDocs[i]);
                    if (jsonObject.hasOwnProperty(fieldName)) {
                        previewContent.push(jsonObject[fieldName].toString());
                    }
                }
            } else if (
                this.fileFormat === this.CSV_FILE_FORMAT &&
                this.cachedCsvDocs.get(fieldName) !== null
            ) {
                for (
                    let i = 0;
                    i < Math.min(this.cachedCsvDocs.size, this.PREVIEW_SIZE);
                    i++
                ) {
                    let currentContext = this.cachedCsvDocs.get(fieldName);
                    if (currentContext) {
                        previewContent.push(currentContext[i].toString());
                    }
                }
            }
        } else if (keyType === "customExpression") {
            if (this.fileFormat === this.JSON_FILE_FORMAT) {
                const expression = keyExpr;
                const pattern = new RegExp(
                    this.WORDS_WITH_PERCENT_SYMBOLS_REGEX,
                    "g"
                );
                let matches: string[] = [];

                let match;

                while ((match = pattern.exec(expression)) !== null) {
                    // match[1] contains the captured word (the part between % symbols)
                    if (match[1] === "") {
                        break;
                    }
                    matches.push(match[1]);
                }
                const fieldNamesList: string[] = [];
                matches.forEach((match) => {
                    fieldNamesList.push(match.replace(/%/g, ""));
                });

                for (
                    let i = 0;
                    i < Math.min(this.cachedJsonDocs.length, this.PREVIEW_SIZE);
                    i++
                ) {
                    const jsonObject = JSON.parse(this.cachedJsonDocs[i]);
                    let keyBuilder = expression;

                    fieldNamesList.forEach((fieldName) => {
                        if (jsonObject.hasOwnProperty(fieldName)) {
                            keyBuilder = keyBuilder.replace(
                                new RegExp(`%${fieldName}%`, "g"),
                                jsonObject[fieldName].toString()
                            );
                        }
                    });

                    keyBuilder = keyBuilder.replace(
                        new RegExp(this.UUID_FLAG, "g"),
                        uuidv4()
                    );
                    keyBuilder = keyBuilder.replace(
                        new RegExp(this.MONO_INCR_FLAG, "g"),
                        monoIncrValue.toString()
                    );
                    monoIncrValue++;

                    previewContent.push(keyBuilder);
                }
            } else if (this.fileFormat === this.CSV_FILE_FORMAT) {
                const expression = keyExpr;
                const pattern = new RegExp(
                    this.WORDS_WITH_PERCENT_SYMBOLS_REGEX,
                    "g"
                );
                let matches: string[] = [];

                let match;

                while ((match = pattern.exec(expression)) !== null) {
                    // match[1] contains the captured word (the part between % symbols)
                    if (match[1] === "") {
                        break;
                    }
                    matches.push(match[1]);
                }
                const fieldNamesList: string[] = [];
                matches.forEach((match) => {
                    fieldNamesList.push(match.replace(/%/g, ""));
                });

                for (
                    let i = 0;
                    i < Math.min(this.cachedCsvDocs.size, this.PREVIEW_SIZE);
                    i++
                ) {
                    let keyBuilder = expression;

                    fieldNamesList.forEach((fieldName) => {
                        const keyContent = this.cachedCsvDocs.get(fieldName);
                        if (keyContent) {
                            keyBuilder = keyBuilder.replace(
                                new RegExp(`%${fieldName}%`, "g"),
                                keyContent[i].toString()
                            );
                        }
                    });

                    keyBuilder = keyBuilder.replace(
                        new RegExp(this.UUID_FLAG, "g"),
                        uuidv4()
                    );
                    keyBuilder = keyBuilder.replace(
                        new RegExp(this.MONO_INCR_FLAG, "g"),
                        monoIncrValue.toString()
                    );
                    monoIncrValue++;

                    previewContent.push(keyBuilder);
                }
            }
        } else {
            // Random UUID case
            for (let i = 0; i < this.PREVIEW_SIZE; i++) {
                previewContent.push(uuidv4()); // Shows Random UUID, May not represent real values
            }
        }
        return previewContent.join("\n");
    }

    // Functions to get default values for dynamic scopesAndCollections
    protected async getSampleElementContentSplit(
        datasetFieldText: string
    ): Promise<string[]> {
        let sampleElementContentSplit: string[] = [];

        if (this.JSON_FILE_FORMAT === this.fileFormat) {
            let sampleElement: string | null = null;
            if (this.format === "list") {
                const receivedElements =
                    await this.sampleElementFromJsonArrayFile(
                        datasetFieldText,
                        1
                    );
                if (receivedElements) {
                    sampleElement = receivedElements[0]; // Just need first element as sample
                } else {
                    logger.error("sample element not received");
                    throw new Error("Failed to retrieve sample JSON element.");
                }
            } else {
                const receivedElements =
                    await this.sampleElementFromJsonLinesFile(datasetFieldText);
                if (receivedElements) {
                    sampleElement = receivedElements[0]; // Just need first element as sample
                } else {
                    logger.error("sample element not received");
                    throw new Error("Failed to retrieve sample JSON element.");
                }
            }
            if (sampleElement) {
                sampleElementContentSplit = sampleElement.split(",");
            } else {
                logger.error("sample element not received");
                throw new Error("Failed to retrieve sample JSON element.");
            }
        } else if (this.CSV_FILE_FORMAT === this.fileFormat) {
            const sampleElement = await this.sampleElementFromCsvFile(
                datasetFieldText,
                1
            );
            if (sampleElement) {
                sampleElementContentSplit = sampleElement;
            }
        } else {
            throw new Error(`Unsupported file format: ${this.fileFormat}`);
        }

        logger.debug(
            "sampleElementContentSplit: " + sampleElementContentSplit.join(", ")
        );

        return sampleElementContentSplit;
    }

    protected async matchElements(
        jsonFieldsArr: string[],
        possibleFieldsArr: string[]
    ): Promise<string> {
        for (let x of jsonFieldsArr) {
            for (let y of possibleFieldsArr) {
                if (x.match(`"${y}"`)) {
                    return y;
                }
            }
        }
        return "";
    }

    // Functions to detect validity of scopes and collections
    async sampleElementFromJsonLinesFile(
        filePath: string,
        sampleSize: number = this.PREVIEW_SIZE
    ): Promise<string[] | null> {
        return new Promise(async (resolve, reject) => {
            const fileStream = fs.createReadStream(filePath);
            let result: string[] = [];
            let elementCounter = 0;

            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });

            for await (const line of rl) {
                if (elementCounter < sampleSize) {
                    result.push(line);
                    elementCounter++;
                } else {
                    fileStream.destroy();
                    break;
                }
            }

            fileStream.on("close", () => {
                resolve(result);
            });

            fileStream.on("error", (error) => {
                logger.error(error);
                resolve(null);
            });
        });
    }

    async sampleElementFromJsonArrayFile(
        filePath: string,
        sampleSize: number = this.PREVIEW_SIZE
    ): Promise<string[] | null> {
        return new Promise((resolve, reject) => {
            let result: string[] = [];
            let elementCounter = 0;

            const jsonStream = fs
                .createReadStream(filePath, { encoding: "utf8" })
                .pipe(parser())
                .pipe(streamArray());

            jsonStream.on("data", ({ key, value }) => {
                if (elementCounter < sampleSize) {
                    result.push(JSON.stringify(value));
                    elementCounter++;
                } else {
                    jsonStream.destroy();
                }
            });

            jsonStream.on("close", () => {
                resolve(result);
            });

            jsonStream.on("error", (error) => {
                logger.error(error);
                resolve(null);
            });
        });
    }

    async sampleElementFromCsvFile(
        filePath: string,
        lineNumber: number
    ): Promise<string[] | null> {
        return new Promise((resolve, reject) => {
            let currentLine = 0;
            let result: string[] | null = null;
            fs.createReadStream(filePath)
                .pipe(csv.parse())
                .on("data", (row) => {
                    currentLine++;
                    if (currentLine === lineNumber) {
                        result = Object.values(row);
                        resolve(result);
                    }
                })
                .on("end", () => {
                    if (result === null) {
                        resolve([]);
                    }
                })
                .on("error", (err) => {
                    logger.error(err);
                    resolve([]);
                });
        });
    }

    checkFields = async (
        filePath: string,
        fieldText: string
    ): Promise<boolean> => {
        const pattern = /%(.*?)%/g;
        let match;

        while ((match = pattern.exec(fieldText)) !== null) {
            const fieldName = match[1];
            try {
                if (this.fileFormat === "json") {
                    let sampleElement: string | null = null;
                    if (this.format === "list") {
                        const receivedElements =
                            await this.sampleElementFromJsonArrayFile(filePath);
                        if (receivedElements) {
                            sampleElement = receivedElements[0];
                        }
                    } else {
                        const receivedElements =
                            await this.sampleElementFromJsonLinesFile(filePath);
                        if (receivedElements) {
                            sampleElement = receivedElements[0];
                        }
                    }

                    if (sampleElement) {
                        const jsonObject = JSON.parse(sampleElement);
                        if (!jsonObject.hasOwnProperty(fieldName)) {
                            return false;
                        }
                    } else {
                        logger.error("failed to read sample element");
                        return false;
                    }
                } else if (this.fileFormat === "csv") {
                    const headers = await this.sampleElementFromCsvFile(
                        filePath,
                        1
                    );
                    if (headers !== null && !headers.includes(fieldName)) {
                        return false;
                    }
                }
            } catch (e) {
                logger.error(e);
                return false;
            }
        }

        return true;
    };

    // Functions to detect Validity of dataset
    detectDatasetFormat = async (filePath: string): Promise<string | null> => {
        try {
            let currentPosition = 0;
            const startBuffer = await this.readFirstTwoNonEmptyCharacters(
                filePath
            );
            const endBuffer = await this.readLastTwoNonEmptyCharacters(
                filePath
            );

            const firstChar = startBuffer[0];
            const secondChar = startBuffer[1];

            const secondLastChar = endBuffer[0];
            const lastChar = endBuffer[1];
            logger.info(
                `chars ${firstChar} ${secondChar} ${secondLastChar} ${lastChar}`
            );
            if (
                firstChar === "[" &&
                secondChar === "{" &&
                secondLastChar === "}" &&
                lastChar === "]"
            ) {
                return "list";
            } else if (firstChar === "{" && lastChar === "}") {
                return "lines";
            }
            return null;
        } catch (err) {
            throw new Error("" + err);
        }
    };

    readLastTwoNonEmptyCharacters = async (
        filePath: string
    ): Promise<string> => {
        let buffer = Buffer.alloc(2); // Initialize a buffer to store the last two non-empty characters
        let bytesRead = 0;
        let lastTwoNonEmptyChars = "";

        const fd = await fs.promises.open(filePath, "r");
        const fileSize = (await fd.stat()).size;
        const chunkSize = Math.min(fileSize, 1024); // Adjust the chunk size as needed

        let position = fileSize - chunkSize;

        const chunk = Buffer.alloc(chunkSize);

        await fd.read(chunk, 0, chunkSize, position);

        for (let i = chunkSize - 1; i >= 0; i--) {
            const char = chunk.toString("utf8", i, i + 1);
            if (!/[\s\t\n]/.test(char) && char.charCodeAt(0) !== 0) {
                // If the character is not a space, tab, or newline, add it to the buffer
                buffer[1] = buffer[0]; // Shift the previous character
                buffer[0] = chunk[i]; // Store the current character

                bytesRead++;
                lastTwoNonEmptyChars = buffer.toString("utf8", 0, bytesRead);
            }

            if (bytesRead >= 2) {
                break;
            }
        }

        await fd.close();

        return lastTwoNonEmptyChars;
    };

    readFirstTwoNonEmptyCharacters = async (
        filePath: string
    ): Promise<string> => {
        const chunkSize = 1024; // Adjust the chunk size as needed
        let buffer = Buffer.alloc(2); // Initialize a buffer to store the first two non-empty characters
        let bytesRead = 0;

        const readStream = fs.createReadStream(filePath, {
            highWaterMark: chunkSize,
        });
        let closed = false;
        for await (const chunk of readStream) {
            for (let i = 0; i < chunk.length; i++) {
                const char = chunk.toString("utf8", i, i + 1);

                if (!/[\s\t\n]/.test(char)) {
                    // If the character is not a space, tab, or newline, add it to the buffer
                    buffer[bytesRead] = chunk[i]; // Store the current character
                    bytesRead++;

                    if (bytesRead >= 2) {
                        // We have found the first two non-empty characters, so close the stream
                        readStream.close();
                        closed = true;
                        break;
                    }
                }
            }
            if (closed) {
                break;
            }
        }
        return buffer.toString("utf8", 0, bytesRead);
    };

    validateDataset = async (datasetFilePath: string): Promise<string[]> => {
        let errors = [];
        // Check if dataset is not empty
        if (!datasetFilePath || datasetFilePath.trim() === "") {
            errors.push("Dataset is required.");
            return errors;
        }
        logger.debug("Dataset file path received: " + datasetFilePath);

        if (datasetFilePath.endsWith(this.JSON_FILE_EXTENSION)) {
            this.fileFormat = this.JSON_FILE_FORMAT;
        } else if (datasetFilePath.endsWith(this.CSV_FILE_EXTENSION)) {
            this.fileFormat = this.CSV_FILE_FORMAT;
        } else {
            errors.push("Please enter valid json or csv file only");
        }

        if (this.fileFormat === this.JSON_FILE_FORMAT) {
            let currentFormat: string | null = await this.detectDatasetFormat(
                datasetFilePath
            );

            if (currentFormat) {
                this.format = currentFormat;
                logger.info("detected format " + currentFormat);
            } else {
                this.format = "";
                logger.error("format not detected");
                errors.push("Please enter valid json file format only");
            }
        }
        return errors;
    };

    validateDatasetAndCollectionFormData = async (
        formData: any
    ): Promise<string> => {
        let errors: string[] = [];

        // Validate Dataset
        const datasetFilePath: string = formData.dataset;
        const datasetErrors = await this.validateDataset(datasetFilePath);
        for (let error of datasetErrors) {
            errors.push(error);
        }
        if (datasetErrors.length === 0) {
            this.datasetField = datasetFilePath;
        }

        // Check if bucket is not empty
        if (!formData.bucket) {
            errors.push("Bucket is required.");
        }

        // Perform different validation checks based on the value of scopesAndCollections
        switch (formData.scopesAndCollections) {
            case "SpecifiedCollection":
                // Check if scopesDropdown and collectionsDropdown are not empty
                if (
                    !formData.scopesDropdown ||
                    formData.scopesDropdown === ""
                ) {
                    errors.push("Scope is required for Specified Collection.");
                }
                if (
                    !formData.collectionsDropdown ||
                    formData.collectionsDropdown === ""
                ) {
                    errors.push(
                        "Collection is required for Specified Collection."
                    );
                }
                break;
            case "dynamicCollection":
                // Check if scopesDynamicField and collectionsDynamicField are not empty
                if (
                    !formData.scopesDynamicField ||
                    formData.scopesDynamicField.trim() === ""
                ) {
                    errors.push(
                        "Scope Field is required for Dynamic Collection."
                    );
                } else {
                    const checkFieldsResult = await this.checkFields(
                        datasetFilePath,
                        formData.scopesDynamicField
                    );
                    if (!checkFieldsResult) {
                        errors.push("Scope's field is not valid");
                    }
                }
                if (
                    !formData.collectionsDynamicField ||
                    formData.collectionsDynamicField.trim() === ""
                ) {
                    errors.push(
                        "Collection Field is required for Dynamic Collection."
                    );
                } else {
                    const checkFieldsResult = await this.checkFields(
                        datasetFilePath,
                        formData.collectionsDynamicField
                    );
                    if (!checkFieldsResult) {
                        errors.push("Collection's field is not valid");
                    }
                }

                // Regex check for field
                const regex = "^[\\w%\\-]+$";
                if (!String(formData.scopesDynamicField).match(regex)) {
                    errors.push("scope's field do not match regex");
                }

                if (!String(formData.collectionsDynamicField).match(regex)) {
                    errors.push("Collection's field do not match regex");
                }
                break;
            default:
                // No additional validation needed for 'defaultCollection'
                break;
        }
        // Return the array of error messages
        if (errors.length > 0) {
            return errors.join("<br>");
        }

        return "";
    };

    async validateKeysAndAdvancedSettingsFormData(
        formData: any
    ): Promise<string> {
        let errors: string[] = [];

        // Validate Keys (No hard check here, we allow any data to pass as it will fail eventually)
        if (formData.keyOptions === "fieldValue") {
            if (!formData.keyFieldName || formData.keyFieldName.trim() === "") {
                errors.push("Field name field is empty.");
            }
        } else if (formData.keyOptions === "customExpression") {
            if (
                !formData.customExpression ||
                formData.customExpression.trim() === ""
            ) {
                errors.push("Custom expression field is empty.");
            }
        }

        // Validate Advanced Settings
        if (
            formData.skipDocsOrRows &&
            String(formData.skipDocsOrRows) !== "" &&
            parseInt(String(formData.skipDocsOrRows)) < 0
        ) {
            // If skipFirstDocuments exists but are less than 0
            errors.push(
                "Skip first field does not contain a valid non-negative integer."
            );
        }

        if (
            formData.limitDocsOrRows &&
            String(formData.limitDocsOrRows) !== "" &&
            parseInt(String(formData.limitDocsOrRows)) < 0
        ) {
            // If limitDocsOrRows exists but are less than 0
            errors.push(
                "Import up to field does not contain a valid non-negative integer."
            );
        }

        if (
            !formData.threads ||
            !formData.threads.trim() ||
            parseInt(formData.threads) < 1
        ) {
            errors.push("threads cannot be undefined or less than 1");
        }

        // Return the array of error messages
        if (errors.length > 0) {
            return errors.join("<br>");
        }
        return "";
    }

    public dataImport = async (context: vscode.ExtensionContext) => {
        const connection = getActiveConnection();
        if (!connection) {
            return;
        }
        if (!CBTools.getTool(CBToolsType.CB_IMPORT).isAvailable()) {
            vscode.window.showErrorMessage(
                "CB Import is still loading, Please try again later"
            );
            return;
        }

        const dataImportWebviewDetails =
            Memory.state.get<IDataImportWebviewState>(
                Constants.DATA_IMPORT_WEBVIEW
            );
        if (dataImportWebviewDetails) {
            // data import webview already exists, Closing existing and creating new
            try {
                dataImportWebviewDetails.webviewPanel.dispose();
            } catch (e) {
                logger.error("Error while disposing data import webview: " + e);
            }
            Memory.state.update(Constants.DATA_IMPORT_WEBVIEW, null);
        }

        const currentPanel = vscode.window.createWebviewPanel(
            "dataImport",
            "Data Import",
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                enableForms: true,
            }
        );
        Memory.state.update(Constants.DATA_IMPORT_WEBVIEW, {
            webviewPanel: currentPanel,
        });
        currentPanel.iconPath = {
            dark: vscode.Uri.file(
                path.join(
                    __filename,
                    "..",
                    "..",
                    "images",
                    "dark",
                    "database-import.svg"
                )
            ),
            light: vscode.Uri.file(
                path.join(
                    __filename,
                    "..",
                    "..",
                    "images",
                    "light",
                    "database-import.svg"
                )
            ),
        };
        currentPanel.webview.html = getLoader("Data Import");

        // Get all buckets
        const buckets = await connection.cluster?.buckets().getAllBuckets();
        if (buckets === undefined) {
            vscode.window.showErrorMessage("Buckets not found");
            return;
        }
        const bucketNameArr: string[] = [];
        for (let bucket of buckets) {
            bucketNameArr.push(bucket.name);
        }

        try {
            currentPanel.webview.html = await getDatasetAndCollection(
                bucketNameArr,
                undefined,
                undefined
            );
            currentPanel.webview.onDidReceiveMessage(async (message) => {
                switch (message.command) {
                    // ADD cases here :)
                    case "vscode-couchbase.tools.dataImport.runImport": {
                        const keysAndAdvancedSettingsData =
                            message.keysAndAdvancedSettingsData;
                        const datasetAndCollectionData =
                            message.datasetAndCollectionData;

                        CBImport.import(
                            {
                                bucket: datasetAndCollectionData.bucket,
                                dataset: datasetAndCollectionData.dataset,
                                fileFormat: this.fileFormat,
                                format: this.format,
                                scopeCollectionExpression:
                                    datasetAndCollectionData.scopeCollectionExpression,
                                generateKeyExpression:
                                    keysAndAdvancedSettingsData.generateKeyExpression,
                                skipDocsOrRows:
                                    keysAndAdvancedSettingsData.skipDocsOrRows,
                                limitDocsOrRows:
                                    keysAndAdvancedSettingsData.limitDocsOrRows,
                                ignoreFields:
                                    keysAndAdvancedSettingsData.ignoreFields,
                                threads: keysAndAdvancedSettingsData.threads,
                                verbose: keysAndAdvancedSettingsData.verboseLog,
                            },
                            context
                        );

                        break;
                    }
                    case "vscode-couchbase.tools.dataImport.nextGetKeysAndAdvancedSettingsPage": {
                        const keysAndAdvancedSettingsformData = message.data;
                        const datasetAndCollectionData =
                            message.datasetAndCollectionData;
                        const validationError =
                            await this.validateKeysAndAdvancedSettingsFormData(
                                keysAndAdvancedSettingsformData
                            );
                        if (validationError === "") {
                            // Go to summary page
                            currentPanel.webview.html =
                                getLoader("Data Import");
                            currentPanel.webview.html = await getSummary(
                                datasetAndCollectionData,
                                keysAndAdvancedSettingsformData
                            );
                        } else {
                            currentPanel.webview.postMessage({
                                command:
                                    "vscode-couchbase.tools.dataImport.getKeysAndAdvancedSettingsPageFormValidationError",
                                error: validationError,
                            });
                        }
                        break;
                    }
                    case "vscode-couchbase.tools.dataImport.nextGetDatasetAndCollectionPage": {
                        let formData = message.data;
                        const keysAndAdvancedSettingsData =
                            message.keysAndAdvancedSettingsData;
                        const validationError =
                            await this.validateDatasetAndCollectionFormData(
                                formData
                            );
                        if (validationError === "") {
                            // NO Validation Error on Page 1, We can shift to next page
                            const elementSplit =
                                await this.getSampleElementContentSplit(
                                    formData.dataset
                                );
                            const defaultKeysValue = await this.matchElements(
                                elementSplit,
                                this.possibleKeyFields
                            );

                            currentPanel.webview.html =
                                getLoader("Data Import");
                            currentPanel.webview.html =
                                getKeysAndAdvancedSettings(
                                    formData,
                                    keysAndAdvancedSettingsData,
                                    defaultKeysValue
                                );
                        } else {
                            currentPanel.webview.postMessage({
                                command:
                                    "vscode-couchbase.tools.dataImport.getDatasetAndCollectionPageFormValidationError",
                                error: validationError,
                            });
                        }
                        break;
                    }
                    case "vscode-couchbase.tools.dataImport.getScopes": {
                        const scopes = await getScopes(
                            message.bucketId,
                            connection
                        );
                        if (scopes === undefined) {
                            vscode.window.showErrorMessage(
                                "Scopes are undefined"
                            );
                            break;
                        }

                        currentPanel.webview.postMessage({
                            command:
                                "vscode-couchbase.tools.dataImport.scopesInfo",
                            scopes: scopes,
                        });
                        break;
                    }
                    case "vscode-couchbase.tools.dataImport.getDatasetFile": {
                        const options: vscode.OpenDialogOptions = {
                            canSelectMany: false,
                            openLabel: "Choose Dataset File",
                            canSelectFiles: true,
                            canSelectFolders: false,
                        };

                        vscode.window
                            .showOpenDialog(options)
                            .then(async (fileUri) => {
                                if (fileUri && fileUri[0]) {
                                    const dataset = fileUri[0].fsPath;

                                    // understand first few documents, get fields and update default values
                                    // Firstly validate the dataset
                                    const errors = await this.validateDataset(
                                        dataset
                                    );
                                    if (errors.length === 0) {
                                        const elementSplit =
                                            await this.getSampleElementContentSplit(
                                                dataset
                                            );
                                        const defaultScopeValue =
                                            await this.matchElements(
                                                elementSplit,
                                                this.possibleScopeFields
                                            );
                                        const defaultCollectionValue =
                                            await this.matchElements(
                                                elementSplit,
                                                this.possibleCollectionFields
                                            );
                                        currentPanel.webview.postMessage({
                                            command:
                                                "vscode-couchbase.tools.dataImport.defaultScopeAndCollectionDynamicField",
                                            defaultScopeValue:
                                                defaultScopeValue.trim()
                                                    .length > 0
                                                    ? `%${defaultScopeValue}%`
                                                    : "",
                                            defaultCollectionValue:
                                                defaultCollectionValue.trim()
                                                    .length > 0
                                                    ? `%${defaultCollectionValue}%`
                                                    : "",
                                        });
                                    } else {
                                        logger.error(
                                            "error while reading dataset: \n " +
                                                errors.join("\n")
                                        );
                                    }

                                    currentPanel.webview.postMessage({
                                        command:
                                            "vscode-couchbase.tools.dataImport.datasetFile",
                                        dataset: dataset,
                                    });
                                }
                            });
                        break;
                    }
                    case "vscode-couchbase.tools.dataImport.getKeysBack": {
                        const datasetAndTargetData =
                            message.datasetAndTargetData;
                        const keysAndAdvancedSettingsData =
                            message.keysAndAdvancedSettingsData;
                        currentPanel.webview.html = getLoader("Data Import");
                        currentPanel.webview.html =
                            await getDatasetAndCollection(
                                bucketNameArr,
                                datasetAndTargetData,
                                keysAndAdvancedSettingsData
                            );
                        break;
                    }
                    case "vscode-couchbase.tools.dataImport.fetchKeyPreview": {
                        const keyType = message.keyType;
                        const keyExpr = message.keyExpr;
                        const preview = await this.updateKeyPreview(
                            keyType,
                            keyExpr
                        );
                        currentPanel.webview.postMessage({
                            command:
                                "vscode-couchbase.tools.dataImport.sendKeyPreview",
                            preview: preview,
                        });
                        break;
                    }
                    case "vscode-couchbase.tools.dataImport.onBackSummary": {
                        const datasetAndCollectionData =
                            message.datasetAndCollectionData;
                        const keysAndAdvancedSettingsData =
                            message.keysAndAdvancedSettingsData;
                        currentPanel.webview.html = getLoader("Data Import");
                        currentPanel.webview.html = getKeysAndAdvancedSettings(
                            datasetAndCollectionData,
                            keysAndAdvancedSettingsData
                        );
                        break;
                    }
                }
            });
        } catch (err) {
            logger.error(`Failed to open data export webview`);
            logger.debug(err);
            vscode.window.showErrorMessage(
                "Failed to open data export webview: " + err
            );
        }

        currentPanel.onDidDispose(() => {
            Memory.state.update(Constants.DATA_EXPORT_WEBVIEW, null);
        });
    };
}
