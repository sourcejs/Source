# On Collaborative Development.

This document represents SourceJS team development agreements.

## Patches welcome

First of all: as a potential contributor, your changes and ideas are welcome. Please do not ever hesitate to ask a question or send a PR.

## Code reviews

All changes must be code reviewed. For non-maintainers this is obvious, since you can't commit anyway. But even for maintainers, we want all changes to get at least one review, preferably from someone who knows the areas the change touches. For non-trivial changes we may want two or even more reviewers. Most PRs will find reviewers organically. Except for rare cases, such as trivial changes (e.g. typos, comments) or emergencies (e.g. broken builds), maintainers should not merge their own changes.
Any maintainer or core contributor who wants to review a PR but does not have time immediately may put a kind of hold on a PR simply by saying so on the PR discussion and offering an ETA.

## Branches and versions

Stable project version is on master branch. Upcoming version is on release candidate (RC) branch, which is forked from master and is used to be a base for development. Each release bumps version according to [Semantic Versions specification](http://semver.org/).

## Single feature (issue, etc.) contribution guide for maintainers.

* Create new branch which is forked from current Release Candidate branch.
* Name it according to the next template:
`[developer second name | nickname]/[issue number | task | feature | changeslist name]`. E.g. `smith/search-redesign`.
* Develop and test your code changes. Atomic commits and informative commit messages are required.
E.g. If you decide to implement code linting task, the list of commit messages can looks like that:
 - Code linting task configuration is added. Nested node modules are added (see package.json).
 - Some fixes are implemented due to code linting result.
 - A couple of additional options are added into linting config.
 - * merge branch master into smith/code-linting.
 - Missing parameter is added, some trivial fixes are implemented due to CR feedback.
* Merge RC branch into yours, if your changes are implemented.
* Create Pull Request from your branch into Release Candidate branch. Please don't forget that PR description should be useful and informative. It is very important for release notes.
* Approved PR should be merged into current RC branch. Squashed commits are possible but they aren't preferable.
* Merged feature branch should be removed from remote repo.

## Basic agreement points.
* Branch naming template: `[developers second name | nickname]/[issue number | task | feature | changes list name]`.
* Atomic commits and informative commit messages.
* Version bumps according to [specification](http://semver.org/).
* Using Pull Requests to apply changes.
* PR description should be useful and informative. It is very important for release notes.
* Release candidate branches usage for changes and tests.
* Github releases and tags usage for each changes list (for RC branches).

### Example:
* Current version is `0.4.0` (branch: `master`)
* Upcoming version is `0.4.1` (branch: `rc0.4.1`, initially forked from master).
* Several developers create their own feature-branches (`rc0.4.1` forks) to implement some features (resolve a couple of issues, etc.).E.g. `smith/code-linting`, `somePerson/middleware-polishing`.
* Then changes are implemented they create PR from `nickname/feature` branch to `rc0.4.1`. Last commit in each of brunches is the merge of the RC branch into current one.
* Accepted PRs are merged into rc0.4.1. After that merged features are removed from remote repo.
* Then the RC branch is ready it becomes a kind of beta, which can be tested or used to create some demos, etc. Some fixes are possible if needed.
* New release should be marked by tag with release notes. Release notes text can be formed from PR descriptions.


If you have any related questions, contact Robert Haritonov [@operatino](https://github.com/operatino) please.
