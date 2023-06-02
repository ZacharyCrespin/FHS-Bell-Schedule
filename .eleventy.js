module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/icons")
  eleventyConfig.addPassthroughCopy("src/_redirects")
  eleventyConfig.addPassthroughCopy("src/favicon.ico")
  eleventyConfig.addPassthroughCopy("src/main.css")
  eleventyConfig.addPassthroughCopy("src/manifest.json")
  eleventyConfig.addPassthroughCopy("src/robots.txt")
  
  eleventyConfig.addFilter('stringify', function (obj) {
    return JSON.stringify(obj);
  });

  return {
    dir: {
      input: "src",
      output: "public"
    }
  };
}
