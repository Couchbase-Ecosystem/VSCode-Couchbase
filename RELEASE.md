# RELEASE

To create a new release for this extension the following steps need to be followed. 

1. Open a terminal,
2. Navigate to the repo directory,
3. Use Git checkout to navigate to the main branch,
4. Open package.json and change the value of the `version` key to be the release number,
    e.g. `1.0.0` for release v1.0.0.
5. Commit and Push all changes that will be in the release,
6. Create a new tag using `git tag <tag name>`
    e.g. `git tag v1.0.0` would create a tag, and subsequently a release, labelled v1.0.0.
7. Run `git push origin --tags`, this will trigger a github action that should build the release.