var sass = require("sass");
var fs = require("fs");
var path = require("path");
var build = require("./sass-build");
var write = require("./write-sass");

const doSassProcessing = (domain) => {
	console.log(
		"Generate Sass with domain",
		domain,
		"target file",
		`${domain}/assets/css/style.css`,
		"cwd",
		process.cwd()
	);
	const outFile = "/assets/css/style.css";
	const sassTemplateFiles = fs.readdirSync(path.resolve(`./src/_sass`));
	const templateFiles = sassTemplateFiles.filter((sassFile) => {
		console.log("sassFile", sassFile);
		var sassName = sassFile;
		if (sassName.includes("template-")) {
			console.log("Sass File ");
			return true;
		} else {
			return false;
		}
	});
	templateFiles.forEach((file) => {
		var templateOutFile =
			"/assets/css/" + path.basename(file, ".sass") + ".css";
		console.log("Sass Outfile: ", templateOutFile);
		var templateResult = sass.renderSync({
			includePaths: [
				"src/_sass/*.{scss,sass}",
				"**/*.{scss,sass}",
				"!node_modules/**",
			],
			file: "src/_sass/" + file,
			outputStyle: "compressed",
			//sourceMap: `${domain}/assets/css/style.css.map`,
			sourceMap: true,
			sourceMapContents: true,
			outFile: path.join(process.cwd(), path.basename(templateOutFile)),
			// outFile: `${domain}/assets/css/style.css`,
			// sourceMapRoot: `${domain}/assets/css/`,
		});
		handleSassResult(templateResult, domain, path.basename(file, ".sass"));
	});
	var result = sass.renderSync({
		includePaths: ["**/*.{scss,sass}", "!node_modules/**"],
		file: "src/_sass/_index.sass",
		importer: function (url, prev, done) {
			// ...
		},
		outputStyle: "compressed",
		//sourceMap: `${domain}/assets/css/style.css.map`,
		sourceMap: true,
		sourceMapContents: true,
		outFile: path.join(process.cwd(), path.basename(outFile)),
		// outFile: `${domain}/assets/css/style.css`,
		// sourceMapRoot: `${domain}/assets/css/`,
	});
	handleSassResult(result, domain, "style");
	return result;
};

const pluginDefaults = {
	domainName: "http://localhost:8080",
	includePaths: ["**/*.{scss,sass}", "!node_modules/**"],
	sassLocation: path.join(path.resolve("../../"), "src/_sass/"),
	sassIndexFile: "_index.sass",
	outDir: path.join(path.resolve("../../"), "docs"),
	outPath: "/assets/css/",
	outFileName: "style",
	sourceMap: true,
	perTemplateFiles: "template-",
	cacheBreak: false,
	outputStyle: "compressed",
	watchSass: true,
};
// https://bryanlrobinson.com/blog/creating-11ty-plugin-embed-svg-contents/

module.exports = function (eleventyConfig, options = {}) {
	const pluginConfig = Object.assign(pluginDefaults, options);
	console.log("Eleventy Sass Plugin Info", pluginConfig);
	if (pluginConfig.watchSass) {
		eleventyConfig.addWatchTarget(pluginConfig.sassLocation);
	}
	pluginConfig.outFilePath = `${pluginConfig.domainName}${pluginConfig.outPath}`;
	eleventyConfig.on("beforeBuild", () => {
		const sassMainString = build.processMainSassFile(pluginConfig);
		const resultOfMainWrite = write.handleSassResult(
			sassMainString,
			pluginConfig.domainName,
			pluginConfig.outFileName,
			pluginConfig.outDir + pluginConfig.outPath
		);
		if (pluginConfig.perTemplateFiles) {
			const sassTemplateFiles = fs.readdirSync(pluginConfig.sassLocation);
			const templateFiles = sassTemplateFiles.filter((sassFile) => {
				if (sassFile.includes(pluginConfig.perTemplateFiles)) {
					return true;
				} else {
					return false;
				}
			});
			templateFiles.forEach((file) => {
				const templateData = {
					sassIndexFile: file,
				};
				const templateConfig = Object.assign(
					{ ...pluginConfig },
					templateData
				);
				const sassMainString =
					build.processMainSassFile(templateConfig);
				const resultOfTemplateWrite = write.handleSassResult(
					sassMainString,
					templateConfig.domainName,
					templateConfig.sassIndexFile,
					templateConfig.outDir + pluginConfig.outPath
				);
			});
		}
	});
	const cssLink = (cssUrl, sheetName, cacheBreak, append, id) => {
		return `<link rel="stylesheet" href="${cssUrl}${sheetName}${cacheBreak}${append}" id="${id}"></link>\n`;
	};

	// eleventyConfig.addGlobalData("sass", pluginConfig);

	eleventyConfig.addShortcode("sassFile", (template, append, id) => {
		var templateUrl = pluginConfig.domainName + pluginConfig.outPath;
		let cacheBreakString = "";
		if (pluginConfig.cacheBreak) {
			if (pluginConfig.cacheBreak === true) {
				cacheBreakString = "?dt=" + Date.now();
			} else {
				cacheBreakString = pluginConfig.cacheBreak;
			}
		}
		return cssLink(
			templateUrl,
			template ? `template-${template}.css` : "style.css",
			cacheBreakString,
			append,
			typeof id !== "string" || id == "undefined" ? "" : id
		);
	});
};
