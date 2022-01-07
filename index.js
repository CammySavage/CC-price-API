/*Crypto price API
uses: axios, cheerio, express (currency converter although it isn't implemented yet)

searches through website using cheerio and axios to find what we want and assigns it to keys.
Coins kept in an array. Run with an express local server.


RUN:
node index.js
localhost:3000/api/price-feed
 */


const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const cc = require('currency-converter-lt')

async function getPriceFeed() {
  try {
    const siteurl = 'https://coinmarketcap.com/'

    const { data } = await axios({
      method: "GET",
      url: siteurl,
     })
     //allows passing of a html string and search through dom
     const $ = cheerio.load(data)
     const elmSelector = '#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr'
     const keys = [
       'rank',
       'name',
       'price',
       '24h',
       '7d',
       'marketCap',
       'volume',
       'circulatingSupply'
     ]
     const coinArray = []

     //uses the selector from the element on cmc.com to focus on crypto info
     $(elmSelector).each((parentIdx, parentElm) => {
       let keyIdx = 0
       const coinObj = {}

       // gets the first 10 results on the page that match
       if(parentIdx <= 9) {
         $(parentElm).children().each((childIdx, childElm) => {
           let tdValue = $(childElm).text()

           //Executes on name and volume keys
           if (keyIdx === 1 || keyIdx === 6) {
             //selects the first child of the p elem to ommit other text
              tdValue = $('p:first-child', $(childElm).html()).text()
          }

          //I want to convert this from USD to GBP, but i need to learn more about promises to implement
          if (keyIdx === 2) {
            amountToConvert = parseInt($(childElm).text())
            let currencyConverter = new cc({from: "USD", to: "GBP", amount: amountToConvert})
            let tdValue = currencyConverter.convert().then((response) => {
              console.log(response)
            })
          }

           //Gets rid of blank spaces between blocks of info
           if(tdValue) {
             //Uses the keys defined above to create coinObj
             coinObj[keys[keyIdx]] = tdValue
             keyIdx++
           }
         })
        //adds the coins data to the output list
        coinArray.push(coinObj)
       }
     })
     return coinArray
  } catch(err) {
    console.error(err)
  }
}


//initialises express local web server
const app = express()

app.get('/api/price-feed', async (req, res) => {
  try {
    const priceFeed = await getPriceFeed()

    return res.status(200).json({
      result: priceFeed,
    })
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    })
  }
})

app.listen(3000, () => {
  console.log('running on port 3000')
})
