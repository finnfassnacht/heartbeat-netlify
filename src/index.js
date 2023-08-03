const nominatim = require('nominatim-client');
const express = require("express");
const serverless = require("serverless-http");
const data = require("./em-num.json")
const app = express();
app.use(express.static("www"));
app.use(express.json());
const router = express.Router();
function em_num(usercountry){
    let i = 0
    while (i < data.length) {
        let country = (data[i]["code"]);
        if (country == usercountry){
            let police = (data[i]["police"]);
            let ambulance = (data[i]["ambulance"]);
            let fire = (data[i]["fire"]);
            return([ambulance,fire,police])
        }
        i++;
    }
}
router.post("/cords", (req,res) => {
    const client = nominatim.createClient({
        useragent: "Heartbeat",             // The name of your application
        referer: 'https://nominatim.openstreetmap.org/',  // The referer link
      });
    async function re_addrs() {
        var client_data = (req.body);
        const query = {
        lat: client_data.lat,
        lon: client_data.lon
        };
        console.log(query)
        result = await client.reverse(query)
        let country = result.address.country
        let country_code = result.address.country_code
        let house_num = result.address.house_number
        let street = result.address.road
        let town = result.address.town
        if (town == undefined){
            town = result.address.city
        }
        let suburb = result.address.suburb
        let emnum = em_num(country_code)
        let data = {
            "num":house_num,
            "street":street,
            "town":town,
            "suburb":suburb,
            "country":country,
            "emnum":emnum
        }
        for (let key in data){
            if (data[key] === undefined){
                data[key] = "--"
            }
        }
        console.log(data)
        res.send(data)
    }
    re_addrs()
});
app.use(`/.netlify/functions/index`, router);

module.exports = app;
module.exports.handler = serverless(app);