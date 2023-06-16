const pluginWebc = require("@11ty/eleventy-plugin-webc");
const filesMinifier = require("@sherby/eleventy-plugin-files-minifier");
const downloader = require('11ty-external-file-downloader');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginWebc, {
		components: [
			"./src/_components/**/*.webc"
		]
	});
  eleventyConfig.addPlugin(filesMinifier);
  eleventyConfig.addPlugin(downloader, {
    urls: [
      'https://analytics.zacharyc.site/analytics.js'
    ],
    directory: 'public'
  });

  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./src/js/");

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
    templateFormats: ["njk", "webc", "md"],
  };
}
