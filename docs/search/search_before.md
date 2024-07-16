Use **search_before** with **from**/**offset** and sort to control pagination in search results.

Give a value for each string or JSON object in the **sort** array to the **search_before** array. The Search Service starts search result pagination before the document with those values.

You must provide the values in the same order that they appear in the **sort** array.

For example, if you had a set of 10 documents to sort based on _id values of 1-10, with **from** set to 2 and **search_before** set to 8, documents 2-6 appear on the same page.

---

**Note**: If you use **search_before** in a search request, you can't use **search_after**. Both properties are included in the example code to show the correct syntax.

→ [Search Request Json Documentation](https://docs.couchbase.com/server/current/search/search-request-params.html)