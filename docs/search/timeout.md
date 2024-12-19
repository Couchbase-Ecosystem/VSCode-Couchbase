Set the maximum time, in milliseconds, that a Search query can execute on a Search index partition.

If the query time exceeds the **timeout**, the Search Service cancels the query. The query might return partial results if any index partitions responded before the timeout.