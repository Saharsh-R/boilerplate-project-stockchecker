'use strict';

const fetch = require("node-fetch");


require('dotenv').config()
let mongoose = require("mongoose");
mongoose.pluralize(null);
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify: false});
const ipSchema = new mongoose.Schema({
  ip: String
})


async function getStock(stock){
  const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
  const {symbol, latestPrice} = await response.json()
  // console.log(symbol, latestPrice)
  return {stock: symbol, price: latestPrice}
}

async function createLike(ip, stock){
  let Ip = await mongoose.model(stock, ipSchema)
  await Ip.findOne({ip}, async function (err, data)  {
    if ( ! err) {
      if (!data) {
        let newip = new Ip({ip})
        await newip.save((err, data) => {
          if (! err){
            // console.log(data)
          }
        })
      } else{
        // console.log('already present')
      }
    }
  }) 
}

async function getNumber(stock){
  let Ip = await mongoose.model(stock, ipSchema)
  const answer = await Ip.countDocuments({})
  
  // console.log(stock, answer)
  return answer
}

// console.log('manual', getNumber('GOOG'))
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get( async function (req, res){
     
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
      // console.log(clientIp)
      let inputStock = req.query.stock
      let inputLike = req.query.like
      if (Array.isArray(inputStock)){

        const data1 = await getStock(inputStock[0])
        let stock1 = await data1.stock
        let price1 = await data1.price
        if (!stock1){
          return res.send('First stock not valid')
        }

        const data2 = await getStock(inputStock[1])
        let stock2 = await data2.stock
        let price2 = await data2.price
        if (!stock2){
          return res.send('Second stock not valid')
        }

        if (inputLike){
          await createLike(clientIp, stock1)
          await createLike(clientIp, stock2)
          
        }

        const likes1 = await getNumber(stock1)
        const likes2 = await getNumber(stock2)
        await sleep(1500)
        return res.json({stockData: [
          {
            stock: stock1,
            price: price1,
            rel_likes: likes1 - likes2
          },
          {
            stock: stock2,
            price: price2,
            rel_likes: likes2 - likes1
          }
        ]})


        
      } else {
        // console.log('=================samll ============')
        let {stock, price} = await getStock(inputStock)
        if (!stock){
          return res.send('Not valid stock')
        }
        // console.log(stock)
        if (inputLike){
          await createLike(clientIp, stock)
        }
        const likes = await getNumber(stock)
        // console.log(likes)

        return res.json({stockData: {stock, price, likes}})

      }
    });
    
};
