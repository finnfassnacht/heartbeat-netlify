async function getaddr(fdata){
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(fdata)
        }
        let response = await fetch("/.netlify/functions/index/cords", options)
        let data = await response.json()
        console.log(data)
        let house_num = data.address.house_number
        let street = data.address.road
        let town = data.address.town
        if (town == undefined){
            town = data.address.city
        }
        let suburb = data.address.suburb
        document.getElementById("locating").remove()
        document.getElementById("street").innerText = street + " " + house_num
        document.getElementById("town").innerText = suburb + " " + town
       
}
async function main(){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const data = {"lat":lat, "lon":lon}
            console.log(data)
            var map = L.map('map').setView([lat, lon], 17);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
                var circle = L.circle([lat, lon], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 12
                }).addTo(map);
            getaddr(data)
            
            
        })
        } else {
        document.write("<h3>geolocation not available</h3>");
        }
}
main()