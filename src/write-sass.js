var fs = require("fs");
var path = require("path");

const handleSassResult = (resultOfRenderSync, domain, filename, outDir) => {
	const result = resultOfRenderSync;
	let cleanFileName = path.basename(filename, ".sass");
	cleanFileName = path.basename(cleanFileName, ".scss");
	cleanFileName = path.basename(cleanFileName, ".css");
	console.log("Sass renderSync result", result);
	var fullCSS = result.css.toString();
	var map = JSON.parse(result.map);
	map.sourceRoot = domain;
	var newSources = map.sources.map((source) => {
		return "sass/" + source;
	});
	map.sources = newSources;
	result.map = JSON.stringify(map, null, "\t");
	var fullMap = result.map.toString();
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir, { recursive: true });
	}
	var writeResult = fs.writeFileSync(
		path.join(outDir, `${cleanFileName}.css`),
		fullCSS
	);
	var writeMapResult = fs.writeFileSync(
		path.join(outDir, `${cleanFileName}.css.map`),
		fullMap
	);
	console.log(
		"Sass file write result",
		path.join(outDir, `${cleanFileName}.css`),
		writeResult,
		"Sass map write result",
		path.join(outDir, `${cleanFileName}.css.map`),
		writeMapResult
	);
};

module.exports = { handleSassResult };
