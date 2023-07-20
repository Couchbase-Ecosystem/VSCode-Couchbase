import { IKeyValuePair } from "../types/IKeyValuePair";

export class OverviewGeneral {
    public Cluster: IKeyValuePair[] | null;
    public Quota: IKeyValuePair[] | null;
    public RAM: IKeyValuePair[] | null;
    public Storage: IKeyValuePair[] | null;
    constructor(
        Cluster: IKeyValuePair[] | null,
        Quota: IKeyValuePair[] | null,
        RAM: IKeyValuePair[] | null,
        Storage: IKeyValuePair[] | null
      ) {
        this.Cluster = Cluster;
        this.Quota = Quota;
        this.RAM = RAM;
        this.Storage = Storage;
      }
}