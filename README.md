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
	
## Theming
MyWiki ships with a default theme. If you want to build your own theme, use this HTML structure as a reference:
```HTML
<!DOCTYPE html>
<html>
    <head>
        <title>${navData.title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">

        <style>
			/* YOUR STYLES WILL BE INSERTED HERE */
        </style>
    </head>
    <body>
		<header>
			<!--YOUR HEADER WILL BE INSERTED HERE-->
		</header>
	
        <nav>
            <li><a href="path/to/file.html" class="active">File 1</a></li>
			<li><a href="path/to/file.html" class="">File 2</a></li>
        </nav>

        <main>
			<!--CONTENT WILL BE INSERTED HERE-->
        </main>
    </body>
</html>
```