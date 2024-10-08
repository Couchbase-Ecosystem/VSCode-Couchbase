export function fmtByte(bytes: number): string {
  if (bytes === -1) {
    return "NA";
  }
  const sizeInMB: number = bytes / (1024.0 * 1024.0);
  if (sizeInMB >= 1024) {
    const sizeInGB: number = sizeInMB / 1024.0;
    return `${sizeInGB.toFixed(2)} Gb`;
  } else {
    return `${sizeInMB.toFixed(2)} Mb`;
  }
}

export function fmtDouble(value: number | null): string | null {
  if (value === null) {
    return null;
  } else {
    return value.toFixed(3);
  }
}

export function formatDuration(seconds: number | null): string | null {
  if (seconds === null) {
    return null;
  }

  let minutes: number = Math.floor(seconds / 60);
  let hours: number = Math.floor(minutes / 60);
  let days: number = Math.floor(hours / 24);

  minutes = minutes % 60;
  hours = hours % 24;

  return `${days} days ${hours} hours ${minutes} minutes`;
}

export function formatNumber(number: number): string {
  if (number === -1) {
    return "NA";
  }
  const formatter = new Intl.NumberFormat('en-us', {
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(number);
}

export function mbToGb(sizeInMb: number): string {
  if (sizeInMb === -1) {
    return "NA";
  } if (sizeInMb < 1024) {
    return `${sizeInMb} Mb`;
  } else {
    const sizeInGb: number = sizeInMb / 1024.0;
    return `${sizeInGb.toFixed(2)} Gb`;
  }
}

export function formatServices(services: string): string {
  return services
    .replace(/backup/gi, "Backup")
    .replace(/eventing/gi, "Eventing")
    .replace(/fts/gi, "Search")
    .replace(/index/gi, "Index")
    .replace(/kv/gi, "Data")
    .replace(/cbas/gi, "Analytics")
    .replace(/n1ql/gi, "Query");
}