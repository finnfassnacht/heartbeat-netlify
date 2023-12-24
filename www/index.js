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
        let AEDs = data.AEDs
        document.getElementById("locating").remove()
        document.getElementById("street").innerText = street + " " + house_num
        document.getElementById("town").innerText = suburb + " " + town
        document.getElementById("ems").innerText = em_num[0]
        document.getElementById("fire").innerText = em_num[1]
        document.getElementById("police").innerText = em_num[2]
        return AEDs

       
}
const getCoords = async () => {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    return {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
    };
};

function aedinfo(aed){

    let text;
    if (aed.indoor == "yes"){
        text = "Indoor AED: "
    }
    else{
        text = "AED: "
    }
    document.getElementById("aed_distance").innerText = text + Math.round(1000 *aed.distance) + "m"
    document.getElementById("name").innerText = aed.name
    document.getElementById("location").innerText = aed.location
}

async function main(){
        let cords = await getCoords() 
        console.log(cords)
        

        var map = L.map('map').setView([cords.lat, cords.lon], 17);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',}).addTo(map);

                var circle = L.circle([cords.lat, cords.lon], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 6
                })
                circle.addTo(map);
                
                var aed = L.icon({
                    iconUrl: 'aed.svg',
                    iconSize:     [30], // size of the icon
                    iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
                  
                });
                let AEDs = await getaddr(cords)
                for (let i =0; i < AEDs.length; i++){
                    L.marker(AEDs[i].cords, {icon:aed}).addTo(map).on('click', function() {
                        aedinfo(AEDs[i])
                    });
                }
                console.log(AEDs[0])
                let text;
                if (AEDs[0].indoor == "yes"){
                    text = "Indoor AED: "
                }
                else{
                    text = "AED: "
                }
                if (AEDs[0].location == undefined){
                    AEDs[0].location = ""
                }
                if (AEDs[0].name == undefined){
                    AEDs[0].name = ""
                }
                document.getElementById("aed_distance").innerText = text + Math.round(1000 *AEDs[0].distance) + "m"
                document.getElementById("name").innerText = AEDs[0].name
                L.Control.textbox = L.Control.extend({
                    onAdd: function(map) {
                    var text = L.DomUtil.create('div');
                    text.style = "position: relative; top:-26.8px; right:-9.7px"
                    text.id = "info_text";
                    text.innerHTML = "<p style='background-color: white; color:blue; opacity: 0.8; font-size:16px'>"+cords.lat+ " "+ cords.lon+ "</p></div>"
                    return text;
                    },
                });
                L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
                L.control.textbox({ position: 'topright' }).addTo(map);
}

main()
