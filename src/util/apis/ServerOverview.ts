import { AutoCompactionSettings } from "./AutoCompactionSettings";
import { BucketName } from "./BucketName";
import { StorageTotals } from "./StorageTotals";
import { CBNode } from "./CBNode";
export class ServerOverview {
  private name: string = '';
  private nodes: CBNode[] = [];
  private bucketNames: BucketName[] = [];
  private rebalanceStatus: string = '';
  private autoCompactionSettings?: AutoCompactionSettings;
  private balanced?: boolean;
  private memoryQuota?: number;
  private indexMemoryQuota?: number;
  private ftsMemoryQuota?: number;
  private cbasMemoryQuota?: number;
  private eventingMemoryQuota?: number;
  private storageTotals?: StorageTotals;

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getNodes(): CBNode[] {
    return this.nodes;
  }

  public setNodes(nodes: CBNode[]): void {
    this.nodes = nodes;
  }

  public getBucketNames(): BucketName[] {
    return this.bucketNames;
  }

  public setBucketNames(bucketNames: BucketName[]): void {
    this.bucketNames = bucketNames;
  }

  public getRebalanceStatus(): string {
    return this.rebalanceStatus;
  }

  public setRebalanceStatus(rebalanceStatus: string): void {
    this.rebalanceStatus = rebalanceStatus;
  }

  public getAutoCompactionSettings(): AutoCompactionSettings | undefined {
    return this.autoCompactionSettings;
  }

  public setAutoCompactionSettings(autoCompactionSettings: AutoCompactionSettings): void {
    this.autoCompactionSettings = autoCompactionSettings;
  }

  public getBalanced(): boolean | undefined {
    return this.balanced;
  }

  public setBalanced(balanced: boolean): void {
    this.balanced = balanced;
  }

  public getMemoryQuota(): number | undefined {
    return this.memoryQuota;
  }

  public setMemoryQuota(memoryQuota: number): void {
    this.memoryQuota = memoryQuota;
  }

  public getIndexMemoryQuota(): number | undefined {
    return this.indexMemoryQuota;
  }

  public setIndexMemoryQuota(indexMemoryQuota: number): void {
    this.indexMemoryQuota = indexMemoryQuota;
  }

  public getFtsMemoryQuota(): number | undefined {
    return this.ftsMemoryQuota;
  }

  public setFtsMemoryQuota(ftsMemoryQuota: number): void {
    this.ftsMemoryQuota = ftsMemoryQuota;
  }

  public getCbasMemoryQuota(): number | undefined {
    return this.cbasMemoryQuota;
  }

  public setCbasMemoryQuota(cbasMemoryQuota: number): void {
    this.cbasMemoryQuota = cbasMemoryQuota;
  }

  public getEventingMemoryQuota(): number | undefined {
    return this.eventingMemoryQuota;
  }

  public setEventingMemoryQuota(eventingMemoryQuota: number): void {
    this.eventingMemoryQuota = eventingMemoryQuota;
  }

  public getStorageTotals(): StorageTotals | undefined {
    return this.storageTotals;
  }

  public setStorageTotals(storageTotals: StorageTotals): void {
    this.storageTotals = storageTotals;
  }
}