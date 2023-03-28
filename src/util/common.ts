export function abbreviateCount(count: number): string {
    if (count < 1000) {
        return count.toString();
    } else if (count < 1000000) {
        return (count / 1000).toFixed(1) + "k";
    } else if (count < 1000000000) {
        return (count / 1000000).toFixed(1) + "m";
    } else {
        return (count / 1000000000).toFixed(1) + "b";
    }
}