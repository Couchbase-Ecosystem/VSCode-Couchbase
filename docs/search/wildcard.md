Use the **wildcard** property to run a wildcard query.

Set the property to a regular expression that includes a wildcard character in the middle or end of a search term:

→ Use **?** to allow a match to any single character.

→ Use **\*** to allow a match to zero or many characters.

For example, you could set the **wildcard** property to "inter*" to return matches for "interview", "interject", "internal", and so on.

You cannot place the wildcard character at the start of the search term.

If you use the **wildcard** property, the Search Service does not use any analyzers on the contents of your query text.

→ [Non-Analytics Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#non-analytic-queries)