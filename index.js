var map, layer, infoWindow = null, marker = null,
    regions, locations, lightning_protections, surge_protections;
var mapOptions = {
    center: {
        lat: 3.9398315,
        lng: 102.3507851
    },
    zoom: 7,
    mapTypeId: 'roadmap'
};

var legends = [
    { label: '1-100', icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'},
    { label: '101-200', icon: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png' },
    { label: '201-250', icon: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png' },
    { label: '251-300', icon: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
    { label: '301-350', icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
    { label: '351-400', icon: 'https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png' },
    { label: '401-450', icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
    { label: '451-500', icon: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png' }
]

document.addEventListener('DOMContentLoaded', function () {
    get('region').then(function (regionList) {
        var select = document.querySelector('#region');
        regions = regionList;
        regionList.forEach(function (region) {
            select.options.add(new Option(region.name, region.id))
        });
    })

    get('location').then(function (locationList) {
        var locationSelect = document.querySelector('#location'), regionSelect = document.querySelector('#region');
        locations = locationList;
        locationList.forEach(function (location) {
            if (regionSelect.value == location.region_id)
                locationSelect.options.add(new Option(location.name, location.id))
        });
    })

    get('structure_type').then(function (structures) {
        var select = document.querySelector('#structure');
        structures.forEach(function (structure) {
            select.options.add(new Option(`${structure.name} - ${structure.zone}`, structure.id))
        });
    })

    get('protection').then(function (protections) {
        lightning_protections = protections.lightning
        surge_protections = protections.surge
    })

    document.getElementById('region').addEventListener('change', function (){
        var locationSelect = document.querySelector('#location'), regionSelect = document.querySelector('#region');
        locationSelect.length = 0;
        locations.forEach(function (location) {
            if (regionSelect.value == location.region_id)
                locationSelect.options.add(new Option(location.name, location.id))
        });
    })

    document.getElementById('search-button').addEventListener('click', function(){
        if(infoWindow !== null){
            google.maps.event.clearInstanceListeners(infoWindow)
            infoWindow.close()
            infoWindow = null
        }

        if(marker !== null){
            google.maps.event.clearInstanceListeners(marker, 'click')
            marker.setMap(null)
            marker = null
        }
        
        var loc_id = document.getElementById('location').value,
            struct_id = document.getElementById('structure').value
        
        var location = locations.find(function(location){
            return location.id == loc_id
        }),
            structure = location.zones.find(function(zone){
            return zone.structure_id == struct_id
        })

        var lps = lightning_protections[structure.lightning_protection - 1].name,
            sps1 = surge_protections[structure.surge_protection.power -1].name,
            sps2 = surge_protections[structure.surge_protection.telecom - 1].name,
            r1_before_class = structure.r1_before >= 1E-5 ? 'code-red' : 'code-green';
            r1_after_class = structure.r1_after >= 1E-5 ? 'code-red' : 'code-green';

        marker = new google.maps.Marker({
            position: location.cord,
            title: "Test",
            icon: { url : getMarkerColor(location.soil_resistivity)}
        })

        var contentString = `<div id="content" class="location-info">
            <h1 class="head is-size-5 has-text-centered has-text-weight-bold">${location.name}</h1>
            <div class="body">
                <ul class="info-list">
                    <li> Lightning Ground Flash Density : ${location.lightning_ground_flash_density}</li>
                    <li> Soil Resistivity ( Ω meter ) : ${location.soil_resistivity}</li>
                    <li> R1 (Loss of Human Life) : 
                        <span class="${r1_before_class}">
                            ${structure.r1_before}
                        </span>
                    </li>
                    <li> Lightning Protection System (LPS) : ${lps} <br> </li>
                    <li> Surge Protection System (SPD) : 
                    <ul>                
                        <li> Power : ${sps1}</li>
                        <li> Telecom : ${sps2}</li>
                    </ul>
                    </li>
                    <li> R1 (Loss of Human Life) After Protection : 
                        <span class="${r1_after_class}">
                            ${structure.r1_after}
                        </span>
                    </li>
                </ul>
            </div>
        </div>`;

        infoWindow = new google.maps.InfoWindow({
            content: contentString
        })
        marker.setMap(map)
        map.panTo(location.cord)
        marker.addListener('click', function () {
            infoWindow.open(map, marker)
        })
    })
})

function get(name) {
    return fetch(`data/${name}.json`).then(function (response) {
        return response.json();
    })
}

function getMarkerColor(resistivity) {
    var color;

    if(resistivity >= 1 && resistivity <= 50)
        color = 'red'
    else if (resistivity >= 51 && resistivity <= 100)
        color = 'red'
    else if (resistivity >= 101 && resistivity <= 150)
        color = 'pink'
    else if (resistivity >= 151 && resistivity <= 200)
        color = 'pink'
    else if (resistivity >= 201 && resistivity <= 250)
        color = 'orange'
    else if (resistivity >= 251 && resistivity <= 300)
        color = 'yellow'
    else if (resistivity >= 301 && resistivity <= 350)
        color = 'green'
    else if (resistivity >= 351 && resistivity <= 400)
        color = 'ltblue'
    else if (resistivity >= 401 && resistivity <= 450)
        color = 'blue'
    else
        color = 'purple'

    return `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    layer = new google.maps.FusionTablesLayer({
        map: map,
        suppressInfoWindows: true,
        clickable: false,
        query: {
            select: "'name_0', 'name_1', 'kml_4326'",
            from: "420419",
            where: "'name_0' = 'Malaysia' and 'name_1' not equal to 'Sabah' and 'name_1' not equal to 'Sarawak'"
        },
        options: {
            styleId: 9,
            templateId: 8
        },
        // styles: [
        //     {
        //         polygonOptions: {
        //             fillColor: '',
        //             fillOpacity: 0.4,
        //         }
        //     }
        // ]
    });

    var legendControl = document.getElementById('legend')
    legends.forEach(function(legend){
        var div = document.createElement('div')
        div.innerHTML = `<img src='${legend.icon}'>${legend.label}`
        legendControl.appendChild(div)
    })

    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend)
}