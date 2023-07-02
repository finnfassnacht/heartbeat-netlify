const nominatim = require('nominatim-client');
const express = require("express");
const serverless = require("serverless-http");
const app = express();
app.use(express.static("www"));
app.use(express.json());
const router = express.Router();
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
        res.send(result)
        console.log(result)
    }
    re_addrs()
});
app.use(`/.netlify/functions/index`, router);

module.exports = app;
module.exports.handler = serverless(app);