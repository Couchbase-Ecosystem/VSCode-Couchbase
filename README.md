# VSCode-Couchbase README

This is a Visual Studio Code extension for Couchbase.  At the moment it is work in progress.

*This is not an officially supported Couchbase project, however we welcome contributions from the community via GitHub features such as the Issues tab.*

*You are also welcome to post on [our forum](https://forums.couchbase.com/c/php-sdk) or join our [Discord](https://discord.com/invite/sQ5qbPZuTh) server.*

## How to Install

Please visit the [releases tab](https://github.com/couchbaselabs/VSCode-Couchbase/releases) and download the most recent release. Once you've downloaded that:

1. In Visual Studio Code navigate to the extensions tab, and click 'install from vsix',
2. Select the vsix file that you just downloaded.

If you would like to package it yourself here, download the source code and run the following commands:

1. `npm install -g vsce`,
2. `vsce package`,
3. In Visual Studio Code navigate to the extensions tab, and click 'install from vsix',
4. Select the vsix file that you generated in step 2. 

Feel free to read our [Getting Started](GETTING-STARTED.md) guide for more information.

## Contributing

Please visit our [CONTRIBUTING.md](CONTRIBUTING.md) for information on contributing to this project.

## Features

This Visual Studio Code extension has two features.

1. A Database Browser

2. Snippets 

## Snippets

These are useful when developing with supported Couchbase SDKs. These are: 
 * Java - [Link to Documentation](https://docs.couchbase.com/java-sdk/current/hello-world/overview.html), 
 * .NET - [Link to Documentation](https://docs.couchbase.com/dotnet-sdk/current/hello-world/overview.html), 
 * Node.js - [Link to Documentation](https://docs.couchbase.com/nodejs-sdk/current/hello-world/overview.html), 
 * Python - [Link to Documentation](https://docs.couchbase.com/python-sdk/current/hello-world/overview.html),
 * Go - [Link to Documentation](https://docs.couchbase.com/go-sdk/current/hello-world/overview.html).

Please visit [SNIPPETS.md](SNIPPETS.md) to see a list of our snippets with descriptions and documentation for each of them.

### Authoring Snippets

For more information about creating snippets for a new language, or editing the current snippets, please see [AUTHORING-SNIPPETS.md](AUTHORING-SNIPPETS.md) 

## Database Browser

This is a work in progress.

## License
Apache Software License Version 2.  See individual files for details.
