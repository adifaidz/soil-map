var map, layer, infoWindow = null, marker = null,
    regions, locations, lightning_protections, surge_protections;
var mapOptions = {
    center: {
        lat: 3.9398315,
        lng: 102.3507851
    },
    zoom: 7
};

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
            
        
        console.log(structure.r1_before >= 1E-5)
        marker = new google.maps.Marker({
            position: location.cord,
            title: "Test",
            icon: { url : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'}
        })
        var contentString = `<div id="content" class="location-info">
            <h3 class="title">${location.name}</h3>
            <div class="body">
                <ul class="info-list">
                    <li> Lightning Ground Flash Density : ${location.lightning_ground_flash_density}</li>
                    <li> Soil Resistivity Ω : ${location.soil_resistivity}</li>
                    <li> R1 (Loss of Human Life) : 
                        <span class="${r1_before_class}">
                            ${structure.r1_before}
                        </span>
                    </li>
                    <li> Lightning Protection System (LPS) : ${lps} <br> </li>
                    <li> Surge Protection System (SPS) : 
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

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    layer = new google.maps.FusionTablesLayer({
        map: map,
        query: {
            select: "'name_0', 'name_1', 'kml_4326'",
            from: "420419",
            where: "'name_0' = 'Malaysia'"
        },
        options: {
            styleId: 9,
            templateId: 8
        }
    });
}