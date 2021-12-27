var sass = require("sass");
var path = require("path");

const processMainSassFile = ({
	includePaths,
	sourceMap,
	outputStyle,
	sassLocation,
	outPath,
	sassIndexFile,
	outFilePath,
	outFileName,
}) => {
	let fileName = path.basename(sassIndexFile, ".sass");
	fileName = path.basename(fileName, ".scss");
	let finalOutFileName = fileName;
	if (fileName === "_index") {
		finalOutFileName = outFileName;
	}
	return sass.renderSync({
		includePaths: includePaths,
		file: sassLocation + sassIndexFile,
		outputStyle: outputStyle,
		sourceMap: sourceMap,
		sourceMapContents: sourceMap,
		outFile: outFilePath + outPath + finalOutFileName + ".css", // path.join(process.cwd(), path.basename(outFile)),
	});
	// handleSassResult(result, domain, "style");
};

const processTemplateSassFile = (domain) => {};

module.exports = { processMainSassFile };
