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
        let house_num = data.num
        let street = data.street
        let town = data.town
        let suburb = data.suburb
        let em_num = data.emnum
        console.log(em_num)
        document.getElementById("locating").remove()
        document.getElementById("street").innerText = street + " " + house_num
        document.getElementById("town").innerText = suburb + " " + town
        document.getElementById("ems").innerText = em_num[0]
        document.getElementById("fire").innerText = em_num[1]
        document.getElementById("police").innerText = em_num[2]

       
}
async function main(){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = (position.coords.latitude);
            const lon = (position.coords.longitude);
            const data = {"lat":lat, "lon":lon} 
            console.log(data)
            var map = L.map('map').setView([lat, lon], 17);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',}).addTo(map);
                var circle = L.circle([lat, lon], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 12
                })
                circle.addTo(map);

               L.Control.textbox = L.Control.extend({
                onAdd: function(map) {
                    
                var text = L.DomUtil.create('div');
                text.style = "position: relative; top:26.8px; right:9.7px"
                text.id = "info_text";
                text.innerHTML = "<p style='background-color: white; color:blue; opacity: 0.8; font-size:16px'>"+lat+ " "+ lon+ "</p></div>"
                return text;
                },
            });
            L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
            L.control.textbox({ position: 'bottomleft' }).addTo(map);
            getaddr(data)
            
            
        })
        } else {
        document.write("<h3>geolocation not available</h3>");
        }
}
main()