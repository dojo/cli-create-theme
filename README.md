# @dojo/cli-create-theme

[![Build Status](https://travis-ci.org/dojo/cli-create-theme.svg?branch=master)](https://travis-ci.org/dojo/cli-create-theme)
[![codecov](https://codecov.io/gh/dojo/cli-create-theme/branch/master/graph/badge.svg)](https://codecov.io/gh/dojo/cli-create-theme)
[![npm version](https://badge.fury.io/js/dojo-cli-create-theme.svg)](http://badge.fury.io/js/dojo-cli-create-theme)

This package provides tooling support for theme generation in Dojo 2.

## Features

Adds a `dojo create theme` command which displays an interactive instruction to ask two questions:

* What Package to do you want to theme?
* Which of the theme files would you like to scaffold?

Upon successful execution of this command, `dojo create theme` creates a number of files for you in your app:

* `src/themes/theme.ts`
* `src/themes/widget/path/widget.m.css`

The latter CSS module comes ready with themable CSS selectors which you can fill in the styles for.

## How do I use this package?

Install `dojo/cli-create-theme` in a Dojo 2 app:

```sh
npm install --save-dev @dojo/cli-create-theme
```

Run the command: `dojo create theme`.

For example, if you have widgets which live in the folder: `node_modules/@dojo/widgets`, you can enter: `@dojo/widgets` as the answer to `What Package to do you want to theme?`.

## How do I contribute?

We appreciate your interest!  Please see the [Dojo 2 Meta Repository](https://github.com/dojo/meta#readme) for the Contributing Guidelines.

### Code Style

This repository uses [`prettier`](https://prettier.io/) for code styling rules and formatting. A pre-commit hook is installed automatically and configured to run `prettier` against all staged files as per the configuration in the projects `package.json`.

An additional npm script to run `prettier` (with write set to `true`) against all `src` and `test` project files is available by running:

```bash
npm run prettier
```

## Testing

Test cases MUST be written using [Intern](https://theintern.github.io) using the Object test interface and Assert assertion interface.

90% branch coverage MUST be provided for all code submitted to this repository, as reported by istanbul’s combined coverage results for all supported platforms.

To test locally in node run:

`grunt test`

To test against browsers with a local selenium server run:

`grunt test:local`

To test against BrowserStack or Sauce Labs run:

`grunt test:browserstack`

or

`grunt test:saucelabs`

## Licensing information

© 2018 [JS Foundation](https://js.foundation/) & contributors. [New BSD](http://opensource.org/licenses/BSD-3-Clause) and [Apache 2.0](https://opensource.org/licenses/Apache-2.0) licenses.
