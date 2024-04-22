import { IQueryContext } from "../../../types/IQueryContext";
import { MemFS } from "../../../util/fileSystemProvider";
import UntitledSearchJsonDocumentService from "./controller";

export class SearchWorkbench {
    private _untitledSearchJsonDocumentService: UntitledSearchJsonDocumentService;
    public editorToContext: Map<string, IQueryContext>;

    constructor() {
        this._untitledSearchJsonDocumentService =
            new UntitledSearchJsonDocumentService();
        this.editorToContext = new Map<string, IQueryContext>();
    }
    openSearchWorkbench(memFs: MemFS) {
        this._untitledSearchJsonDocumentService.newQuery(memFs);
    }
}
