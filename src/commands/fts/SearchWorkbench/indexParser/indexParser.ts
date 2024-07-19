export class SearchIndexParser {
    static extractPropertiesMap(index: any): Map<string, string> {
        const rootNode = index;
        const propertiesMap = new Map<string, string>();
        const typesNode = rootNode?.params?.mapping?.types;

        if (typesNode && typeof typesNode === "object") {
            for (const [_, typeValue] of Object.entries(typesNode)) {
                if (
                    typeValue &&
                    typeof typeValue === "object" &&
                    "properties" in typeValue
                ) {
                    const propertiesNode = (typeValue as any).properties;
                    this.extractProperties(propertiesNode, "", propertiesMap);
                }
            }
        }
        return propertiesMap;
    }

    private static extractProperties(
        node: any,
        parentKey: string,
        propertiesMap: Map<string, string>,
    ) {
        if (node && typeof node === "object") {
            for (const [key, value] of Object.entries(node)) {
                if (typeof value === "object" && value) {
                    if ("properties" in value) {
                        const newParentKey = parentKey
                            ? `${parentKey}.${key}`
                            : key;
                        this.extractProperties(
                            value.properties,
                            newParentKey,
                            propertiesMap,
                        );
                    } else if ("fields" in value) {
                        for (const fieldNode of value.fields as any[]) {
                            const type = fieldNode.type?.toString() || "";
                            const fieldName = fieldNode.name?.toString() || key;
                            const finalKey = parentKey
                                ? `${parentKey}.${fieldName}`
                                : fieldName;
                            propertiesMap.set(finalKey, type);
                        }
                    } else if ("type" in value) {
                        const type = value.type?.toString() || "";
                        const finalKey = parentKey
                            ? `${parentKey}.${key}`
                            : key;
                        propertiesMap.set(finalKey, type);
                    }
                }
            }
        }
    }

    static isIndexDynamic(index: any): boolean {
        const rootNode = index;
        return rootNode?.params?.mapping?.index_dynamic || false;
    }

    static isCollectionDynamicallyIndexed(
        index: any,
        collection: string,
    ): boolean {
        const rootNode = index;
        return rootNode?.params?.mapping?.types?.[collection]?.dynamic || false;
    }

    static getDefaultField(index: any): string {
        const rootNode = index;
        return rootNode?.params?.mapping?.default_field || "";
    }

    static listCollections(index: any): string[] {
        const rootNode = index;
        const typesNode = rootNode?.params?.mapping?.types;
        return typesNode ? Object.keys(typesNode) : [];
    }
}
