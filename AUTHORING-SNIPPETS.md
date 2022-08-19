# Adding a language to the extension. 

This tutorial assumes that you have already downloaded the repo and have it open in VS Code. 

## File preperation

Firstly, we want to create a new folder in our `/snippets` directory. This folder will store the snippets that you have made. The name of the folder indicates what language the snippets will be for. Inside this folder we will create JSON files that further group the snippets by categories. 

For example, we have a folder for the Java SDK snippets, and in that folder, JSON files for kvops, analytics, full text search etc.

For this tutorial we're going to create a new Java snippet, so you need to create the file `/snippets/java/tutorial.json`.

## Snippet Layout

In this file we want to open a pair of curly brackets, each snippet will be an object within these curly brackets. 

Then we want to write the name of our snippet. For a snippet called "Hello Couchbase" we want an object that looks like the following:

```
"Hello Couchbase":{
    "prefix":[],
    "body":[],
    "description:""
}
```

### Prefix
Prefix is an array of strings, these strings are what users should type to activate your snippet. Its stored in an array because you can have multiple strings that users can type to bring up the snippet. However, in our extension we currently only have one per snippet. For this tutorial we will use the prefix "hello".

### Body
Body is also an array of strings, each string represents a line of code that will be printed. Usually, I would write the code in a separate file that matches the language, e.g. a .java file to write java snippets. 
Find any speach marks in this code and place a backslash before it. 
Then surround each line of code with speech marks to turn them into strings.
Add commas at the end all strings bar the last.

For example, If we take this code:
```
public static void main(String[] args) {
    System.out.println("Hello Couchbase");
}
```

It should end up like this:
```
"public static void main(String[] args) {",
"    System.out.println(\"Hello Couchbase\");",
"}"
```

#### Placeholders
Then find any sections for placeholders and insert them. The [VS Code documentation](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax) shows all of them, but in this example I'll use a named placeholder.

The following snippet body would allow the user to tab into "Hello Couchbase" and change it with whatever they wanted:
```
"public static void main(String[] args) {",
"    System.out.println(\"${1:Hello Couchbase}\");",
"}"
```

Place this into our existing JSON file, it should now look something like this:

```
{
    "Hello Couchbase": {
        "prefix": [
            "hello"
        ],
        "body": [
            "public static void main(String[] args) {",
            "    System.out.println(\"${1:Hello Couchbase}\");",
            "}"
        ],
        "description:""
    }
}
```

### Description

Now, lets give our snippet a description. We will use "Print a string to the console"

## Adding a contribute

You want to navigate to `package.json`. Under contributes you should see a section for snippets. Each json file will need its own snippet contribution. It should look like this:

```
{
  "language": "java",
  "path": ".snippets/java/tutorial.json"
}
```

A lot of languages are supported by VS Code by default, you can find the list of the default ones [here](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers).

## Testing
You can test your snippet by pressing F5, this should open up a new debugging VS Code window with the extension running. If we type hello we can see that it shows our code. Hopefully everything looks good, but if it doesn't you can navigate back to the original window, make any changes, and reload the debugging window to check again.

## Packaging
Using `vsce package` in the console should create a vsix file containing the snippets. 
