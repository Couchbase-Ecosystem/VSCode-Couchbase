Set the geo location value to use as the top-left corner point of the rectangle search area.

If you use **top_left** as an object, you must set two values:

→ **lon**: The longitude of the geo location to use as the top-left corner of the rectangle.

→ **lat**: The latitude of the geo location to use as the top-left corner of the rectangle.

If you use **top_left** as an array, your array must contain a longitude value followed by a latitude value. For example, [-2.235143, 53.482358], where -2.235143 is the longitude.

→ [Rectangle-Based Geopoint Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#geopoint-queries-rectangle)