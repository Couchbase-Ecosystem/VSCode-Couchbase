Use the **match** property to run a match query. The Search Service searches for an exact match to the specified term inside the Search index's default field.

You can set a specific field to search with the field property.

You can change the matching behavior by using the fuzziness property.

You cannot include spaces inside the string you provide to the **match** property without specifying the operator property, which tells the Search Service how to interpret the string.

→ [Analytics Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#analytic-queries)