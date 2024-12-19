export class SystemStats {
    public cpu_utilization_rate?: number;
    public cpu_stolen_rate?: number;
    public swap_total?: number;
    public swap_used?: number;
    public mem_total?: number;
    public mem_free?: number;
    public mem_limit?: number;
    public cpu_cores_available?: number;
    public allocstall?: bigint;
  }