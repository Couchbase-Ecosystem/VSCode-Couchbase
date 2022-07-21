# Getting Started

For now the database browser is unfinished, but feel free to use the snippets that are implemented. 

To install the VSIX file do the following:

1. Download the latest VSIX file, under the assets section, at our [releases page](https://github.com/couchbaselabs/VSCode-Couchbase/releases). 
    *Note: We are currently in pre release mode so there may be some bugs*

2. Open Visual Studio Code.

3. On the left side of the screen you will see a menu bar with an option to open the extensions menu, click this button.

4. You should now see the extensions menu. At the top right of this menu you should see an ellipsis menu icon, click this and select "Install from VSIX".

5. This should open a file explorer, locate the VSIX that you downloaded earlier and install it.  

6. Congratulations, you have now installed the Couchbase Visual Studio Code Extension. 

## Early Workflow Example

Let's connect to an existing cluster that has the `travel-sample` bucket present. We will use a get operation and run a query on this cluster. 

We will use the Couchbase Node.js SDK for this example, but if you are unfamiliar with it then feel free to use any of our other supported SDKs. The snippet shortcuts will be the same, but file extensions and code will be different from what is displayed. 

#### 1. Create and open a new file titled server.js
#### 2. Run the snippet @cbcon
This should create the following code

```
const couchbase = require('couchbase')

async function main() {
  const cluster = await couchbase.connect('connection-string', {
    username: 'Administrator',
    password: 'password',
  })

  // get a reference to our bucket
  const bucket = cluster.bucket('bucket-name')

  // get a reference to a collection
  const collection = bucket.scope('scope-name').collection('collection-name')
}
```

You should be able to tab through the values for `cluster`,`connection-string`, the username, the password, `bucket`, `bucket-name`, `collection`, `scope-name`, `collection-name`.

Set `connection-string`, the username, and password, to the appropriate values for your cluster.

Leave `cluster`, `bucket`, and `collection` as the defaults. 

Set `bucket-name` to 'travel-sample'.

Set `scope-name`, and `collection-name` to '_default'.

#### 3. Run the snippet @cbget at the bottom of our main function.
This should create the following code:

```
try {
    const result = await collection.get(key, { timeout: 1000 });
    document = result.value;
} catch (e) {
    if (e instanceof couchbase.DocumentNotFoundError) {
        console.log('Document not found...')
    } else {
        throw e
    }
}
```

You should be able to tab through the values for `collection`,`key`, and the timeout.

Leave `collection` and the values for timeout the same.

Set `key` to 'airline_10'

#### 4. Print the result of our get request.
Add the following code to the bottom of our main function:

```
console.log(document);
```


#### 5. Run the file.
Add the following code to the bottom of our document:

```
main();
```

In the command line, navigate to this directory and run:

```
node server.js
```

This should create the following output:

```
{
  id: 10,
  type: 'airline',
  name: '40-Mile Air',
  iata: 'Q5',
  icao: 'MLA',
  callsign: 'MILE-AIR',
  country: 'United States'
}
```
