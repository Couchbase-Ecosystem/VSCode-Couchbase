# Developing

The extension uses the Couchbase Node SDK to interact with Couchbase clusters along with some HTTP endpoints. The Couchbase Node SDK includes some C++ native code for efficentcy and comes bundled with binding files that allows the Node process to execute the C++ functions. However, because VSCode runs under Electron, these bindings need to be rebuilt for the extension to use the C++ functions.

*Note*: In the future, the Couchbase Node SDK may be updated to bundle electron binding files.

### Building a binding file

1. Install node dependencies to get the Couchbase Node SDK - `npm install`
2. Rebuild the binding and copy to a local directory - `npm run rebuild`

The rebuild command does the following:
- Update the Couchbae SDK CMakeLists.txt to disable OpenSSL linking (see OpenSSL note below)
- Rebuild the binding file for Electron
- Copy the binding file to a build directory in the extension


### Building binding files for packaging

We need to create binding files for a matrix of platforms (darwin, windows, linux) and architectures (x64, x86, arm64). For now these need to be built manually and added to a local directory with the following structure:

`lib/binding/node-v106-${platform}-${arch}/couchbase_impl.node`

We're currently building for Node 16.14, so an Apple M1 binding file would look like:

`lib/binding/node-v106-darwin-arm64/couchbase_impl.node`

*Note*: In the future, CI could be used to build this matrix and compose the binding files into the correct structure.


### OpenSSL static vs dynaminc linking

Normally the Couchbase Node SDK relies on the application host to have OpenSSL installed and the SDK will dynamically link to it. However, Electron utilises BoringSSL instead and dynamic binding doesn't seem to work correctly. To build a binding file that works, we instead have to disable dynamic OpenSSL linking in the Couchbase Node SDK to it's staticaly linked instead.

We should not have to statically link OpenSSL and BoringSSL should have the same API surface & be interchangeable for OpenSSL. Issue #97 is tracking investigation into resolve this.
