Query String queries let you express more complex queries with a special syntax. You can reduce the properties you need to specify for a Search query with Query String syntax.

If you do not add any additional Query String syntax to a query, the Search Service interprets the query as a match query.

- **^** : If you use multiple clauses in a query, you can use the ^ operator to assign the relative importance to a clause.
- **>, >=, < and ≤** : You can run two types of range queries with the later than (>), later than or equal to (>=), earlier than (<), and earlier than or equal to (≤) operators:
- **\\** : Use a backslash character (\\) to escape characters in a Query String query.
- **{field-name}** : Set the field in a document where the Search Service should search for your query by adding a field name and a colon to the start of a search term. Use dot notation for the field name. For example, `parentField.childField`.
- **+** and **-** : Use the + and - operators before a clause in a Query String query to run a boolean query. The + operator adds the clause to the MUST list of a boolean query. The - operator adds the clause to the MUST_NOT list of a boolean query.

→ [Query String Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#query-string-query-syntax)