var exports = module.exports = {};

exports.analyse = function(){

    var gramophone = require('gramophone'),
                fs = require('fs'),
                _ = require("lodash");

    var completeDMcorpus = fs.readFile('./corpus.txt', 'utf8', function (err, data) {
      if (err) throw err;
      console.log("All text data received. Analysing...");
      keywordAnalyse(data);
    });

    function keywordAnalyse(words){
        var wordArray = gramophone.extract(words, {score: true, limit: 80})
        var longWords = _.filter(wordArray, function(w){
            return w.term.length > 4
        })
        console.log(longWords)
    }

}
