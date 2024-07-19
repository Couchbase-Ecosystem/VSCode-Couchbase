An array of coordinate floating point values that define the GeoJSON shape.

The Search Service uses the first value in the coordinates array as the longitude value.

#### Point Query
For a **Point** query, set the **coordinates** array to a single array with a longitude and latitude value

#### LineString Query
For a **LineString** query, the **coordinates** array can contain multiple coordinate point arrays.

#### Polygon Query

An array that contains an outer array, and arrays of 2 coordinate floating point values that define the GeoJSON Polygon shape.

The Search Service uses the first value in any nested **coordinates** array as the longitude value for the coordinate.

The Search Service also follows strict GeoJSON syntax, and expects exterior coordinates in a polygon to be in counterclockwise order.

#### MultiPoint Query
An array that contains arrays of 2 coordinate floating point values that define the GeoJSON MultiPoint shape.

#### MultiLineString Query

An array that contains nested arrays, each with their own nested arrays of 2 coordinate floating point values.

For example, the following coordinates array defines 2 LineStrings with start and end points:
"coordinates": [
[
[1.954764, 50.962097], [3.029578, 49.868547]
],
[
[3.029578, 49.868547], [-0.387444, 48.545836]
]
]
The innermost arrays define the individual points for a LineString in the MultiLineString shape.

#### MultiPolygon Query
An array that contains arrays that describe a GeoJSON Polygon shape.

Each inner array that describes a Polygon can contain multiple arrays with 2 coordinate floating point values. These innermost arrays describe the coordinates of the Polygon.

The Search Service also follows strict GeoJSON syntax, and expects exterior coordinates in a polygon to be in counterclockwise order

#### GeometryCollection Query

An array or array of arrays that describes a GeoJSON shape.

The exact structure of the arrays depends on the shape:

→ Point
→ LineString
→ Polygon
→ MultiPoint
→ MultiLineString
→ MultiPolygon

For any array that contains only floating point values, the Search Service uses the first value as the longitude.

The Search Service also follows strict GeoJSON syntax, and expects exterior coordinates in a polygon to be in counterclockwise order.

#### Circle Query
An array of coordinate floating point values that define the center point of the Circle.

Set the **coordinates** array to a single array with a longitude and latitude value.

#### Envelope Query

An array of 2 different arrays that contain coordinate floating point values.

The first **coordinates** nested array contains the minimum longitude and maximum latitude, or the top-left corner of the rectangle.

The second nested array contains the maximum longitude and minimum latitude, or the bottom-right corner.