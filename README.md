# VSCode-Couchbase README

Welcome to the official Visual Studio Code extension for Couchbase!

This extension is designed to provide a seamless experience for Couchbase Server users who want to work within the popular Visual Studio Code editor. 

# Requirements
This extension requires OpenSSL to be installed on your system in order to install successfully. 

For Windows:
- Download the latest version of OpenSSL from https://slproweb.com/products/Win32OpenSSL.html and follow the installation instructions.

For Debian or Ubuntu-based distros::
- Run `sudo apt-get install openssl`

For Red Hat, CentOS or Fedora-based distros:
-  Run `sudo dnf install openssl` (on newer Fedora versions), OR `sudo yum install openssl` (on older Fedora/Red Hat/CentOS versions)

For Mac:
- Run `brew install openssl` using Homebrew, or download the latest version of OpenSSL from https://www.openssl.org/source/ and follow the installation instructions.

> :warning:  **WARNING**:  DO NOT upgrade cmake-js to 7.x or it will break Windows builds. Please use 6.x instead. 

## Contributions & Community

*This is not an officially supported Couchbase project, however we welcome contributions from the community via GitHub features such as the Issues tab.*

*You are also welcome to post on [our forum](https://forums.couchbase.com/c/php-sdk) or join our [Discord](https://discord.com/invite/sQ5qbPZuTh) server.*

Please visit our [CONTRIBUTING.md](CONTRIBUTING.md) for information on contributing to this project.


## Features

This Visual Studio Code extension has two features.

1. A Database Browser

2. Snippets 

## Database Browser

The purpose of this extension is to offer an uninterrupted and smooth experience for those who use Couchbase database and prefer using the widely-used Visual Studio Code editor.

This feature is giving the user freedom to work with couchbase cluster in Visual Studio.

It also allow you to create SQL++ Query Notebook which helps in composing and documenting SQL++ queries easily. 

## Snippets

These are useful when developing with supported Couchbase SDKs. These are: 
 * Java - [Link to Documentation](https://docs.couchbase.com/java-sdk/current/hello-world/overview.html), 
 * .NET - [Link to Documentation](https://docs.couchbase.com/dotnet-sdk/current/hello-world/overview.html), 
 * Node.js/Typescript - [Link to Documentation](https://docs.couchbase.com/nodejs-sdk/current/hello-world/overview.html), 
 * Python - [Link to Documentation](https://docs.couchbase.com/python-sdk/current/hello-world/overview.html),
 * Go - [Link to Documentation](https://docs.couchbase.com/go-sdk/current/hello-world/overview.html).
 * Ottoman - [Link to Documentation](https://ottomanjs.com/guides/quick-start.html).

Please visit [SNIPPETS.md](SNIPPETS.md) to see a list of our snippets with descriptions and documentation for each of them.

### Authoring Snippets

For more information about creating snippets for a new language, or editing the current snippets, please see [AUTHORING-SNIPPETS.md](AUTHORING-SNIPPETS.md) 


## How to Install from GitHub

Please visit the [releases tab](https://github.com/couchbaselabs/VSCode-Couchbase/releases) and download the most recent release. Once you've downloaded that:

1. In Visual Studio Code navigate to the extensions tab, and click 'install from vsix',
2. Select the vsix file that you just downloaded.

If you would like to package it yourself here, download the source code and run the following commands:

1. `npm install -g vsce`,
2. `vsce package`,
3. In Visual Studio Code navigate to the extensions tab, and click 'install from vsix',
4. Select the vsix file that you generated in step 2. 

Feel free to read our [GETTING-STARTED.md](GETTING-STARTED.md) for more information.

## License
Apache Software License Version 2.  See individual files for details.
