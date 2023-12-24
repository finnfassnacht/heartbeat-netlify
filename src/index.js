const nominatim = require('nominatim-client');
const express = require("express");
const serverless = require("serverless-http");
const data = require("./em-num.json")
const file = require("./data.json");
const newjson = file
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
function deg2rad(deg) {
    return deg * (Math.PI/180)
}
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}
function nearest(mycords){
    let cords = []
    let list = []
    let list2 = []
    // get cords
    for (let x = 0; x < newjson.length; x++){
      let coords_lat = (newjson[x]["cords"])
      let entry = coords_lat
      cords.push(entry)
     }
    // create a list with all distances
    for (let i = 0; i < cords.length; i++){
        let distance = getDistanceFromLatLonInKm(cords[i][0],cords[i][1],mycords[0],mycords[1])
        list.push([distance, i])
    }
    // strip the index number (i)
    for (let i = 0; i < list.length; i++){
        let distance = list[i][0]
        list2.push(distance)
    }
    // sort from short to far
    list2.sort(function(a, b) {
        return a - b;
    });
    // top 3 best options
    let top3 = []
    for (let i = 0; i < 3; i++){
        let arr = list.filter( function( el ) {
            return !!~el.indexOf(list2[i])
       });
       let final = newjson[arr[0][1]]
       final.distance = list2[i]
       top3.push(final)
    }
    for (let i = 0; i < 3; i++){
        if (top3[i].location === undefined){
            top3[i].location = ""
        }
        if (top3[i].name === undefined){
            top3[i].name = ""
        }
    }
    return top3

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
        let AEDs = nearest([query.lat, query.lon])
        let data = {
            "num":house_num,
            "street":street,
            "town":town,
            "suburb":suburb,
            "country":country,
            "emnum":emnum,
            "AEDs":AEDs
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