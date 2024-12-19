**type** defines the shape of the GeoJson Query

The allowed values are the following:

→ **"Point"**: Use a GeoJSON Point query to search for a single latitude and longitude coordinate that intersects or is contained inside a GeoJSON shape in your documents

→ **"LineString"**: Use a GeoJSON LineString query to search for a line of coordinates that intersects or is contained inside a GeoJSON shape in your documents

→ **"Polygon"**: Use a GeoJSON Polygon query to search for a defined area that intersects, is contained inside, or surrounds a GeoJSON shape in your documents

→ **"MultiPoint"**: Use a GeoJSON MultiPoint query to search for multiple coordinate points that intersect or are contained inside a GeoJSON shape in your documents

→ **"MultiLineString"**: Use a GeoJSON MultiLineString query to search for multiple LineStrings that intersect or are contained inside a GeoJSON shape in your documents

→ **"MultiPolygon"**: Use a GeoJSON MultiPolygon query to search for a group of defined Polygons that intersect, are contained inside, or surround a GeoJSON shape in your documents

→ **"GeometryCollection"**: Use a GeoJSON GeometryCollection query to search for a group of defined Points, LineStrings, or Polygons that intersect, are contained inside, or surround a GeoJSON shape in your documents

→ **"Circle"**: Use a GeoJSON Circle query to search in a radius around a single latitude and longitude coordinate

→ **"Envelope"**: Use a GeoJSON Envelope query to search in a bounded rectangle, based on a pair of coordinates that define the minimum and maximum longitude and latitude: