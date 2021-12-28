var sass = require("sass");
var fs = require("fs");
var path = require("path");
var build = require("./sass-build");
var write = require("./write-sass");

const pluginDefaults = {
	domainName: "http://localhost:8080",
	includePaths: ["**/*.{scss,sass}", "!node_modules/**"],
	sassLocation: path.normalize(
		path.join(__dirname, "../../../", "src/_sass/")
	),
	sassIndexFile: "_index.sass",
	outDir: path.normalize(path.join(__dirname, "../../../", "docs")),
	outPath: "/assets/css/",
	outFileName: "style",
	sourceMap: true,
	perTemplateFiles: false,
	cacheBreak: false,
	outputStyle: "compressed",
	watchSass: true,
};
// https://bryanlrobinson.com/blog/creating-11ty-plugin-embed-svg-contents/

module.exports = function (eleventyConfig, options = {}) {
	const pluginConfig = Object.assign(pluginDefaults, options);
	//console.log("Eleventy Sass Plugin Info", pluginConfig);
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
			template
				? `${pluginConfig.perTemplateFiles}-${template}.css`
				: "style.css",
			cacheBreakString,
			typeof append !== "string" || append == "undefined" ? "" : append,
			typeof id !== "string" || id == "undefined" ? "" : id
		);
	});
};
