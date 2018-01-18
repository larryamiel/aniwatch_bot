// Modules
const Twit = require('twit');
const qs = require('querystring');
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const h2p = require('html2plaintext');
const bodyParser = require('body-parser');
const fs = require('fs');

const config = require('./config');
const util = require('./util');

// Global Variables
let url = 'https://ww4.gogoanime.io/';

// Twit Middle Ware
var T = new Twit( config );

// Query
function query() {

    let previousAnimeList = JSON.parse(fs.readFileSync('util.json')).previous;

    console.log(previousAnimeList);

    request(url, ( err, res, body ) => {
        if(!err) {

            // Get Body
            $ = cheerio.load(body);

            // Title and Episode
            $('ul.items li').each(function(){

                var title = $(this).find('p.name a').html();
                var episode = $(this).find('p.episode').html();

                // Change Previous Anime
                if( !previousAnimeList.includes(title + ' ' + episode) ){

                    // Update
                    previousAnimeList.push(title + ' ' + episode);

                    if(previousAnimeList.length > 20){
                        previousAnimeList.splice(0, 1);
                    }

                    var object = {
                        "previous": previousAnimeList
                    }

                    // Write to util.json
                    fs.writeFile('util.json', JSON.stringify(object, null, 2), (err)=>{
                        if(err) {
                            throw err;
                        }
                        else {
                            console.log('SAVED');
                        }
                    });

                    // Update Message
                    var message = title + ' ' + episode + ' is now Available! #anime #aniwatch #winteranime';

                    // Log Message
                    console.log(message);
                    
                    // Tweet Message
                    tweet( message );

                }
                else {
                    console.log('No New Anime Update');
                }

            });

        }
        else {

            // Log Error
            console.log('Error : ' + err);

        }
    });
}

// Tweet
function tweet( message ) {
    
    var data = { 
        status: message
    }

    T.post('statuses/update', data, (err, data, res) => {
        if( !err ) {
            console.log('Success : Tweet Sent!');
        }
        else {
            console.log('Error : ' + err);
        }
    });

}

// Query Every 5 Minutes
query();
setInterval( query, 1000 * 60 * 15 );