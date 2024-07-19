Use the **operator** property to modify the behavior of a match query:

→ **"and"**: Any spaces between terms in the match property are interpreted as the AND operator. Documents must match all of the terms in the query.

→ **"or"**: Any spaces between terms in the match property are interpreted as the OR operator. Documents must match at least one of the terms in the query.

For example, if you set a **match** property to the value "good great" and the **operator** property to "and", the Search Service only returns matches for documents that contain good and great.

If you set the **operator** property to "or", a document only needs to contain one of the terms from the **match** property: good or great.

→ [Additional Query Object Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#additional-query-properties)