# EA Modelling Tools JavaScript

Modelling Tools for use with Enterprise Architect

## Naming conventions for files and folders

Folder and file names must not contain any whitespaces and must only 
contain lower case characters. A hyphen must be used to separate 
words in a folder or file name. Scripts that are not executable 
themselves but are included by other scripts must have a name that 
starts with an underscore, e.g. `_model-utils`.

## Documentation of scripts

In order to be able to create a meaningful 
[README file containing the documentation of all scripts](src/README.md), 
each executable script must be documented using 
[JSdoc](https://en.wikipedia.org/wiki/JSDoc). The following code 
snippet illustrates this.

```js

/**
 * Description of what this script does.
 *
 * The description can span multiple lines.
 *
 * @summary Optional summary, especially useful when the description is long. Remove this line when the summary is not needed.
 */
function main() {
	// logic of function main	
}

main();
```

## Supported JavaScript features

Enterprise Architect embeds the [SpiderMonkey](https://spidermonkey.dev/)
JavaScript engine, see also the [website of Sparx](https://www.sparxsystems.com/search/sphider/search.php?query=%22script+engine+support%22+spidermonkey&type=and&category=-1&results=50&tab=5&search=1).

However, because the code that parses the scripts and extracts the 
documentation is based on [Rhino](https://github.com/mozilla/rhino) 
(an open-source implementation of JavaScript written in Java), that 
does not yet support all features in [ECMAScript](
https://en.wikipedia.org/wiki/ECMAScript) edition 6 (2015), the use of
 certain features will result in an error in the documentation 
extraction and must therefore be avoided. See also this 
[compatibility table showing Rhino ES2015 support](
https://mozilla.github.io/rhino/compat/engines.html).
