export interface JsonNode {
    parent?: JsonNode | null;
    children?: JsonNode[];
}

export class JsonObject implements JsonNode {
    parent?: JsonNode | null;
    children: JsonNode[] = [];

    constructor(parent?: JsonNode | null) {
        this.parent = parent;
    }
}

export class JsonArray implements JsonNode {
    parent?: JsonNode | null;
    children: JsonNode[] = [];


    constructor(parent?: JsonNode | null) {
        this.parent = parent;
    }
}

export class JsonProperty implements JsonNode {
    parent?: JsonNode | null;
    key: string;  
    value: any;  

    constructor(key: string, value: any, parent?: JsonNode | null) {
        this.key = key;
        this.value = value;
        this.parent = parent;
    }
}

