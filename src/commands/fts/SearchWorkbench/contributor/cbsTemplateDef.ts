export class cbsTemplateDef {
    key: string;
    desc: string;
    attrs: string[];

    constructor(key: string, desc: string, attrs: string[]) {
        this.key = key;
        this.desc = desc;
        this.attrs = attrs;
    }
}
