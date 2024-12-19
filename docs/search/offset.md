Set an offset value to change where pagination starts for search results, based on the Search query's Sort Object.

For example, if you set a **size** value of 5 and a **from** value of 10, the Search query returns results 11 through 15 on a page.

If you provide both the **from** and **offset** properties, the Search Service uses the **from** value.

→ [Search Request Json Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html)