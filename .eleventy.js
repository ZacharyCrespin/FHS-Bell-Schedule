module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/icons")
  eleventyConfig.addPassthroughCopy("src/favicon.ico")
  eleventyConfig.addPassthroughCopy("src/main.css")
  eleventyConfig.addPassthroughCopy("src/robots.txt")
  
  return {
    dir: {
      input: "src",
      output: "public"
    }
  };
}