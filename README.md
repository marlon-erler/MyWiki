# MyWiki

## Install
```
npm install -g mywiki
```

MyWiki is a minimalist wiki builder based on markdown. Here's how it works:

1. Create markdown files
	- All files must be in the exact same directory, no nesting
	- The first line will be treated as headline, use the `===` headline instead of `#`
2. Create other files (optional)
	- `wiki-header.html` will be inserted into the otherwise empty `<header />` tag
	- `wiki-styles.css` will be used instead of the default theme if the file exists
3. Build
	- Run the `mywiki` command in the directory of the files
4. Done
	- The generated HTML will be in the `./dist` directory