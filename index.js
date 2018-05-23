var postcss = require('postcss');
var syntax = require('postcss-scss');
var valueParser = require('postcss-value-parser');
var Color = require("color");

module.exports = function({css, format, transformer, logger}) {

  console.log('Squirm got',{css, format, transformer, logger});

  return new Promise(function(resolve){

  let scanner = postcss.plugin('scanner', function(opts) {

    opts = opts || {};

    return function(root, result) {
      root.walkRules(function(rule) {
        rule.walkDecls(function(decl, i) {
          if(decl.value){
          var parsed = valueParser(decl.value); // parse declaration value (ex: linear-gradient(to bottom, rgb(79, 133, 187) 0%,rgb(79, 133, 187) 100%);) into object
            parsed.walk(function(node) {
            if(node.type === 'word' && node.value.match(/^#[a-zA-Z0-9]{3,6}$/)){
              let color = Color(node.value);
              if(logger) logger({color})

              if(transformer){
                color = transformer({color,rule,decl,node});
                if(format) color = color[format]();

                let transformed = color.toString();
                function replacer(match, p1, offset, string) {
                  return parseFloat(p1).toFixed(2);
                }
                transformed = transformed.replace(/([0-9]\.[0-9]{3,})/g,replacer)


                node.value = transformed
              }
            }
            else if (node.type === 'function'){
              if ( ['rgb', 'rgba', 'hsl', 'hsla', 'hsv', 'hsva', 'hwb', 'hwba', 'cmyk', 'cmyka'].includes(node.value) ){
                let words = node.nodes.filter(node=>node.type==='word');
                let synthetic = `${node.value}(${ words.map(i=>i.value).join(',') })`;
                let color = Color(synthetic);
                if(logger) logger({color})
                if(transformer){
                  color = transformer({color,rule,decl,node});
                  let dumpName = node.value;
                  dumpName = dumpName.replace(/a$/,'');

                  let transformed = color[dumpName]()
                  if(format) transformed = transformed[format]();

                  transformed = transformed.toString();
                  function replacer(match, p1, offset, string) {
                    return parseFloat(p1).toFixed(2);
                  }
                  transformed = transformed.replace(/([0-9]\.[0-9]{3,})/g,replacer)

                  node.type = 'word';
                  node.value = transformed;
                }
              } // rgb, rgba...
            } // node type ... if (node.type === 'function...
          }); // parsed.walk
          if(transformer){

            decl.value = parsed.toString();

          }
        } // if value
        }); // walkDecls
      }); // walkRules
    };
  });

  postcss([ scanner({}) ])
  .process(css, { from:'style.css', syntax: syntax })
  .then(function (result){ resolve(result.css) });

  }); // Promise
} // module exports
