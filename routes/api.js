'use strict';

const fetch = require("node-fetch");


require('dotenv').config()
let mongoose = require("mongoose");
mongoose.pluralize(null);
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify: false});
const ipSchema = new mongoose.Schema({
  ip: String
})

// create schema
// Database = mongoose.model('ipadd', )

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get( async function (req, res){
     
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
      console.log(clientIp)
      let {stock, like} = req.query
      if (Array.isArray(stock)){

        fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock[0]}/quote`)
          .then(res => res.json())
          .then(data => {
            if (typeof data == 'string'){
              return res.send('First stock is not valid')
            } else {

              fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock[1]}/quote`)
                .then(res => res.json())
                .then(data2 => {
                  if (typeof data2 == 'string'){
                    return res.send('Second stock is not valid')
                  } else {

                    return res.send({stockData: [
                      {
                        stock: data.symbol,
                        price: data.latestPrice,
                        rel_likes: 0
                      },
                      {
                        stock: data2.symbol,
                        price: data2.latestPrice,
                        rel_likes: 0
                      }
                    ]})
                  }
                })
                .catch(e => console.error(e))
            }
          })
          .catch(e => console.error(e))
        
      } else {

        fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
          .then(res => res.json())
          .then(async function (data) {
            if (typeof data == 'string'){
              return res.send('Please enter a valid stock')
            } else {
              let Ip = mongoose.model(data.symbol, ipSchema)


              if (like) {
                await Ip.findOne({ip: clientIp}, async function (err, data)  {
                  if ( ! err) {
                    if (!data) {
                      let newip = new Ip({ip: clientIp})
                      await newip.save((err, data) => {
                        if (! err){
                          console.log(data)
                        }
                      })
                    }
                  }
                })
              }

              Ip.countDocuments((err, number) => {

                return res.send({stockData: {
                  stock: data.symbol,
                  price: data.latestPrice,
                  likes: number
                }})

              })
              
            }
          })
          .catch(e => console.error(e))
      }
    });
    
};
