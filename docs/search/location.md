Set the geo location value to use as the center of the search radius for your query.

If you use **location** as an object, you must set two values:

→ **lon**: The longitude of the geo location to use as the center of the search radius.

→ **lat**: The latitude of the geo location to use as the center of the search radius.

If you use **location** as an array, your array must contain a longitude value followed by a latitude value. For example, [-2.235143, 53.482358], where -2.235143 is the longitude.

→ [Distance/Radius-Based Geopoint Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#geopoint-queries-distance)