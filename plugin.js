var valueParser = require('postcss-value-parser');
var Color = require("color");
var colornames = require('colornames')



module.exports = function({ transformer, format, logger }) {

  // transformer: function that transforms colors
  // format: format to apply to colors after conversion: 'rgb', 'rgba', 'hsl', 'hsla', 'hsv', 'hsva', 'hwb', 'hwba', 'cmyk', 'cmyka'
  // logger: logs colors {color}

  return function(root, result) {
    root.walkRules(function(rule) {
      rule.walkDecls(function(decl, i) {
        if(decl.value){
          var parsed = valueParser(decl.value); // parse declaration value (ex: linear-gradient(to bottom, rgb(79, 133, 187) 0%,rgb(79, 133, 187) 100%);) into object
          parsed.walk(function(node) {
          try {
            if(node.type === 'word' && node.value.match(/^#[a-zA-Z0-9]{3,6}$/)){
              let color = Color(node.value);
              if(logger) logger({color})
              if(transformer){
                color = transformer({color,rule,decl,node});

                if(format) color = color[format]();
                let transformed = color.string(); // Calling .string() with a number rounds the numbers to that decimal place. It defaults to 1.
                node.value = transformed;

              }
            }
            else if (node.type === 'word' && colornames(node.value)){
              let color = Color(node.value);
              if(logger) logger({color})
              if(transformer){

                color = transformer({color,rule,decl,node});
                if(format) color = color[format]();
                let transformed = color.string(); // Calling .string() with a number rounds the numbers to that decimal place. It defaults to 1.
                node.value = transformed

              }
            } // if node type simple
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
                  transformed = color.string(); // Calling .string() with a number rounds the numbers to that decimal place. It defaults to 1.


                  node.type = 'word';
                  node.value = transformed;
                }
              } // rgb, rgba...
            } // node type ... if (node.type === 'function...
          }catch(e){
            console.log(e.message)
          }
        }); // parsed.walk
        if(transformer){
          decl.value = parsed.toString();
        }
      } // if value
      }); // walkDecls
    }); // walkRules
  };
};
