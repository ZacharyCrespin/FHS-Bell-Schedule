const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebc);

  eleventyConfig.addPassthroughCopy("src/icons")
  eleventyConfig.addPassthroughCopy("src/favicon.ico")
  eleventyConfig.addPassthroughCopy("src/favicon.png")
  eleventyConfig.addPassthroughCopy("src/favicon.svg")
  eleventyConfig.addPassthroughCopy("src/robots.txt")
  
  return {
    dir: {
      input: "src",
      output: "public"
    }
  };
}