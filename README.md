# Eleventy Plugin Dart-Sass

## Install

As a dependency:

`npm i eleventy-plugin-dart-sass`

As a devDependency:

`npm i --dev eleventy-plugin-dart-sass`

### Peer Dependency

This is a plugin for [Eleventy](https://www.11ty.dev/) and requires that it also be installed in your project.

## Usage

In your site's `.eleventy.js` file:

```js
eleventyConfig.addPlugin(require("eleventy-plugin-dart-sass"), opts)
```

## Options

The `opts` object can contain:

| Name             | Description                                                                                                                        | Default                                            |
|------------------|------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| domainName       | Used by Sass to build source maps and understand links for your templates.                                                         | "http://localhost:8080"                            |
| includePaths     | An array of paths to include for checking Sass files to watch and build from.                                                      | [" ** /*.{scss,sass}", "!node_modules/ ** "]       |
| sassLocation     | Absolute path to your Sass files (usually in your Eleventy site project)                                                           | `${absoluteDirectory/path/to/eleventy}/src/_sass/` |
| sassIndexFile    | The main file at the base of your Sass file structure. The one with nothing but @use statements.                                   | "_index.sass"                                      |
| outDir           | The directory Eleventy renders your site into.                                                                                     | `${absoluteDirectory/path/to/eleventy}/docs`       |
| outPath          | The file path from the base of your site's render target folder (the outDir above)                                                 | "/assets/css/"                                     |
| outFileName      | Name you wish to render your main Sass files out to. (The output file generated from `sassIndexFile`.) Does not include file name. | "style"                                            |
| sourceMap        | If you wish to render source maps, be a good citizen of the web and leave it true!                                                 | true                                               |
| perTemplateFiles | If you wish to split the rendering of your styles into per-template sub files, here's where you pass the prefix.                   | false                                              |
| cacheBreak       | Pass a string here to add a cache-break paramater to the rendering of CSS URLs in your templates.                                  | false                                              |
| outputStyle      | What style of Sass compression you want to output files in.                                                                        | "compressed"                                       |
| watchSass        | Use this bool to instruct Eleventy to include your Sass directory from `sassLocation` in the set of folders to watch.              | true                                               |

### Default Paths assumed in your Eleventy Site

This plugin builds default paths as follows:

`sassLocation`:
```js
path.normalize(
		path.join(__dirname, "../../../", "src/_sass/")
	)
```

`outDir`:
```js
path.normalize(path.join(__dirname, "../../../", "docs")),
```

This assumes that the plugin resides in the `node_modules` folder of your `Eleventy` website project. It assumes that your render path for your `Eleventy` site is `docs` within your project folder. Finally it assumes that your project sits its Sass files in `src/_sass`.

The defaults assume that, after this plugin is added to the project, an Eleventy project has a minimum folder structure with these types of files in it (`posts` folder is common, but optional):

```
├── node_modules
|   ├── eleventy-plugin-dart-sass
├── src
|   ├── _sass
|   |   ├── _index.sass
|   |   ├── more-style.scss
|   |   ├── included.sass
|   |   └── template-post.sass
|   └── posts
├── docs
└── .eleventy.js
```

#### Overriding default configuration paths

You can pass any path into the configuration you'd like. If so, you can free form your project directory structure to work however you'd like.

##### WARNING

**If you pass your own path into the configuration object for either `outDir` or `sassLocation` or both the plugin won't normalize that path for you.**

**You must pass absolute paths into these option properties**

### Domain Name

For reasons I've yet to figure out, source maps only work in most browsers with full URLs. Relative URLs seem to fail on most browsers. Additionally, we provide a Eleventy shortcode that allows you to pull rendered CSS URLs into your templates. If you do not want to use either of these features you can ignore the `domainName` property or pass it an empty string. You should have source maps though. It's the right thing to do!

### Dart-Sass Native Options

The following options are directly passed into Dart Sass and you can read about them there:

- [includePath](https://sass-lang.com/documentation/js-api/interfaces/LegacyFileOptions#includePaths)
- [outputStyle](https://sass-lang.com/documentation/js-api/interfaces/LegacyFileOptions#outputStyle)
- [sourceMap](https://sass-lang.com/documentation/js-api/interfaces/LegacyFileOptions#sourceMap)
- [sourceMapContents](https://sass-lang.com/documentation/js-api/interfaces/LegacyFileOptions#sourceMapContents) - set to the same value as `sourceMap`.

### Per Template Files

The Eleventy Dart Sass plugin provides you with a nifty tool to practice CSS [code splitting](https://developer.mozilla.org/en-US/docs/Glossary/Code_splitting).

This lets you load template-specific CSS on the specific templates that needs it, shrinking the overall amount the user needs to download at one time.

If you pass a value to `perTemplateFiles`, it is considered as a prefix for files in your Sass folder that should be rendered as separate files from your main `_index.sass` file.

So if you pass `perTemplateFiles` the value of `template-` and have a project structure like this:

```
├── node_modules
|   ├── eleventy-plugin-dart-sass
├── src
|   ├── _sass
|   |   ├── _index.sass
|   |   ├── more-style.scss
|   |   ├── included.sass
|   |   └── template-post.sass
|   └── posts
├── docs
└── .eleventy.js
```

with the default settings in the plugin, after your rendering process is complete, your file structure will look as follows:

```
├── node_modules
|   ├── eleventy-plugin-dart-sass
├── src
|   ├── _sass
|   |   ├── _index.sass
|   |   ├── more-style.scss
|   |   ├── included.sass
|   |   └── template-post.sass
|   └── posts
├── docs
|   ├── assets
|   |   ├── css
|   |   |   ├── style.css
|   |   |   ├── style.css.map
|   |   |   ├── template-post.css
|   |   |   └── template-post.css.map
└── .eleventy.js
```

### Watch Sass

The configuration of this plugin will cause it to rebuild Sass files whenever a build process is initiated. However, your Sass file may not trigger rebuild of the Sass files on `watch` mode if the Sass files are not in the set of target folders Eleventy is watching. When `watchSass` is set to `true` it takes your `sassLocation` property value and adds it to Eleventy's watch targets using `addWatchTarget`.

### Cache Break

The `cacheBreak` property can take a value that will be passed into the shortcode at build time to be appended to your CSS files. This is useful if you set it to `cacheBreak: "?cb=" + Date.now()`. Now the date in milliseconds will be added as a URL parameter to all your CSS files that you set in templates using the Dart-Sass shortcode.

## Dart-Sass Shortcode

This plugin provides an Eleventy shortcode named `sassFile` to allow you to call your newly created CSS URLs in your templates. The shortcode takes three arguments: `template`, `append`, and `id`.

### template

The template argument is passed when you are rendering a template-specific CSS file. It takes the passed argument and appends `perTemplateFiles` from the plugin configuration into the CSS URL name.

### append

The Append argument allows you to add an arbitrary string to the end of the URL. It is anticipated that you will append URL params, if you need them. You may want to do so like `"?somArg=abc"`.

### id

If you want to assign an ID value to the `link` HTML tag.

### Example use

Here's an example from a Nunjucks template file of how this might be used:

```liquid
{% sassFile false, "?v=" + site.github.build_revision %}
{% if templateName %}
    {% sassFile templateName, "?v=" + site.github.build_revision, "template-post-stylesheet" %}
{% endif %}
```

And this will render as:

```html
<link rel="stylesheet" href="https://fightwithtools.dev/assets/css/style.css?v=1628665517" id="">
<link rel="stylesheet" href="https://fightwithtools.dev/assets/css/template-post.css?v=1628665517" id="template-post-stylesheet">
```

## Current Dart Sass Version Note

This plugin's dependency on Sass is currently set to `"~1.45.1"`. This means only patch updates will be used, but no changes to Sass beyond version `1.45`. This is because of their intent to depreciate `renderSync` which is currently in use in this plugin. I don't anticipate this causing issues, however, it is on the to-do list to fix. PRs that resolve this problem would be appreciated!

## Eleventy Compatibility

Works with versions of Eleventy `>=0.11`

## Contributing

This plugin is maintained in its GitHub repository. All PRs and Issues filed to that repo are welcome and will be reviewed. The GitHub repo includes a test suite and it is recommended that you run tests before filing a PR to make sure you maintain the basic functionality of this plugin.

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
