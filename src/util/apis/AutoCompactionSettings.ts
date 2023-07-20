import { Fragmentation } from "./Fragmentation";

export class AutoCompactionSettings {
    public parallelDBAndViewCompaction?: boolean;
    public magmaFragmentationPercentage?: number;
    public databaseFragmentationThreshold?: Fragmentation;
    public viewFragmentationThreshold?: Fragmentation;
    public indexCompactionMode?: string;
    public indexFragmentationThreshold?: Fragmentation;
  

  }
  