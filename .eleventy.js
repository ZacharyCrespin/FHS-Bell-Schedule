const filesMinifier = require("@sherby/eleventy-plugin-files-minifier");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(filesMinifier);

  eleventyConfig.addPassthroughCopy("src/fonts")
  eleventyConfig.addPassthroughCopy("src/icons")
  eleventyConfig.addPassthroughCopy("src/_redirects")
  eleventyConfig.addPassthroughCopy("src/favicon.ico")
  eleventyConfig.addPassthroughCopy("src/google9280d1828cb7dc65.html")
  eleventyConfig.addPassthroughCopy("src/manifest.json")
  eleventyConfig.addPassthroughCopy("src/robots.txt")
  eleventyConfig.addPassthroughCopy("src/sitemap.xml")

  eleventyConfig.addFilter('stringify', function (obj) {
    return JSON.stringify(obj);
  });

  return {
    dir: {
      input: "src",
      output: "public"
    },
    templateFormats: ["njk", "md"],
  };
}
