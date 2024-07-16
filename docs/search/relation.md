Set how the Search Service should return a match for a GeoJSON Point search.

Your selected **relation** type determines which shapes return a match for your query.

You can use the following string values in the **relation** property: **intersects**, **contains** and **within**

These values have different meanings according to the shape. Please check docs for more.

→ [Point GeoJSON Query Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html#geojson-queries-point)