Use the **ctl** object to make sure that the Search Service runs your Search query against the latest version of the documents in your database.

The **ctl** object and its properties cause the Search Service to run your query against the latest version of a document written to a vBucket. The Search Service uses a consistency vector to synchronize the last document write to a vBucket from the Data Service with the Search index.

→ [Ctl Object Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#ctl)