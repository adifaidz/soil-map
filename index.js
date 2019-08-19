var map, layer, infoWindow = null, marker = null, regions, locations;
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
        locationList.forEach(function (location, index) {
            if (regionSelect.value == location.region_id)
                locationSelect.options.add(new Option(location.name, index))
        });
    })

    get('structure_type').then(function (structures) {
        var select = document.querySelector('#structure');
        structures.forEach(function (structure) {
            select.options.add(new Option(structure.name, structure.name))
        });
    })

    document.getElementById('region').addEventListener('change', function (){
        var locationSelect = document.querySelector('#location'), regionSelect = document.querySelector('#region');
        locationSelect.length = 0;
        locations.forEach(function (location, index) {
            if (regionSelect.value == location.region_id)
                locationSelect.options.add(new Option(location.name, index))
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
        
        var index = document.getElementById('location').value

        marker = new google.maps.Marker({
            position: locations[index].cord,
            title: "Test",
        })
        var contentString = `<div id="content">
            <h3 id="firstHeading">${locations[index].name}</h3>
            <div id="bodyContent">
                <p>
                R1 (Loss of Human Life) : Value <br>
                Lightning Protection System (LPS) : Value <br>
                Surge Protection System (SPS) : <br>
                <ul>
                    <li> Power : Value</li>
                    <li> Telecom : Value</li>
                </ul>
                R1 (After Protection) : Value
                </p>
            </div>
        </div>`;

        infoWindow = new google.maps.InfoWindow({
            content: contentString
        })
        marker.setMap(map)
        map.panTo(locations[index].cord)
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