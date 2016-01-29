//Saves body text and href from all headlines on DailyMail front page,
// then console logs a word frequency analysis

var request = require('request'), //module for http requests
    cheerio = require('cheerio'), // module for jQuery-ish parsing
    fs = require('fs'),
    async = require('async'),
    _ = require("lodash"), // like underscore, util lib
    frequency = require('./frequencyanalysis.js'),
    url = "http://www.dailymail.co.uk/home/index.html",
    allLinks = [];

//1. Gets all the links from DM homepage
request(url, function(err, resp, body) {
    console.log("Scraping has started...");
    if (resp.statusCode == 200 && !err) {
        var $ = cheerio.load(body);
        //Get links from main content section
        $('#content h2 a').each(function(){
            var link = {};
            link.title = $(this).text();
            link.href = $(this).attr('href');
            allLinks.push(link);
        })
        //Get links from sidebar of shame
        $('.puff ul li a').each(function(){
            var link = {};
            link.title = $(this).children('.pufftext').text()
                .replace("\n          \n          \n          ", ""); //removes weird text formatting
            link.href = $(this).attr('href');
            allLinks.push(link);
        })
    } //End if
    fs.writeFile("./dmheadlines.json", JSON.stringify(allLinks, null, ' '), function(err) { //use fs to write to a file
        if(err) {
            return console.error(err);
        }else{
            console.log("Headlines saved...");
            console.log(allLinks.length + " pages found.");
            scrapeLinks(allLinks);
        }
    }); //End write
}) //End request

//2.Visit URL for each page and scrape body text.
function scrapeLinks(links){
    var linksSubset = links.slice(0,450) //change to all links.
    var downloadPageJobs = _.map(linksSubset, function(link){
        var job = function(callback) {
            console.log("Downloading " + link.href)
            getPageText("http://www.dailymail.co.uk/" + link.href, function(err, text){
                writeTextToFile(text)
                callback()
            });
        }
        return job
    })
    //4.Call frequency.analyse when download process is complete
    async.parallelLimit(downloadPageJobs, 5, function(err){
        console.log("Finished processing downloadPageJobs!")
        frequency.analyse();
    })
}

//Scrapes body paragraph text from a DM page
function getPageText(pageURL, callback){
    var textBody = "";
    request(pageURL, function(err, resp, body){
        if (resp.statusCode == 200 && !err) {
            var $ = cheerio.load(body);
            $('p.mol-para-with-font').each(function(){
                textBody += $(this).text();
                textBody += " ";
            });
            callback(err, textBody) //callback fires at completed request
        }//end if
    })//end request
}

//3.Write (append) scraped text to a file progressively
function writeTextToFile(textData){
    fs.appendFile("./corpus.txt", textData+"\n", function(err){
        if(err){
            return console.error(err);
        }else{
            console.log("Page text saved.");
        }
    });
}
