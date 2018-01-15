// Modules
const Twit = require('twit');
const qs = require('querystring');
const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const h2p = require('html2plaintext');
const bodyParser = require('body-parser');

const config = require('./config');

// Global Variables
let url = 'https://ww4.gogoanime.io/';
let previousAnime = '';

// Twit Middle Ware
var T = new Twit( config );

// Query
function query() {
    request(url, ( err, res, body ) => {
        if(!err) {

            // Get Body
            $ = cheerio.load(body);

            // Title and Episode
            var title = $('ul.items li p.name a').html();
            var episode = $('ul.items li p.episode').html();

            // Change Previous Anime
            if( previousAnime != title + ' ' + episode ){

                // Update
                previousAnime = title + ' ' + episode;

                // Update Message
                var message = previousAnime + ' is now Available!';

                // Log Message
                console.log(message);
                
                // Tweet Message
                tweet( message );

            }

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
setInterval( query, 1000 * 5 );