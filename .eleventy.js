const generateSass = require("./src/generate-sass");

module.exports = function (eleventyConfig, options) {
	return generateSass(eleventyConfig, options);
};
