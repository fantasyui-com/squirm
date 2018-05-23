var postcss = require('postcss');
var syntax = require('postcss-scss');
var plugin = require("./plugin.js");
module.exports = function({css, transformer, format, logger}) {
  const scanner = postcss.plugin('scanner', plugin);
  return new Promise(function(resolve, reject){
    postcss([ scanner({transformer, format, logger}) ])
    .process(css, { from:'old.css', to:'new.css', syntax: syntax })
    .then(function (result){
      //console.log(result)
      resolve(result.css)
    })
    .catch(function (error){
      console.log(error.message)
      reject(error)
    });
  }); // Promise
} // module exports
