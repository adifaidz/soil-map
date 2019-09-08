var map, layer, infoWindow = null, infoWindows = [], marker = null, markers = [],
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
    { label: '1-100', min: 1, max: 100, icon: 'pink'},
    { label: '101-200', min: 101, max: 200, icon: 'orange' },
    { label: '201-250', min: 201, max: 250, icon: 'yellow' },
    { label: '251-300', min: 251,max: 300, icon: 'green' },
    { label: '301-350', min: 301, max: 350, icon: 'dkgreen' },
    { label: '351-400', min: 351, max: 400, icon: 'ltblue' },
    { label: '401-450', min: 401, max: 460, icon: 'blue' },
    { label: '451-500', min: 451, max: 500, icon: 'purple' }
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
        clearMap()
        getMarker()
    })
})

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    createPeninsularLayer()
    createLegend()
}

function get(name) {
    return fetch(`data/${name}.json`).then(function (response) {
        return response.json();
    })
}

function createPeninsularLayer(){
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
    });
}

function createLegend(){
    var legendControl = document.getElementById('legend')
    legends.forEach(function (legend) {
        var div = document.createElement('div')
        div.innerHTML = `<div id='${legend.icon}-legend' class="legend-item is-size-7">
            <img src='icons/${legend.icon}-dot.png'>
            <label>${legend.label}</label>
        </div>`
        legendControl.appendChild(div)
    })

    var items = document.getElementsByClassName('legend-item')

    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('click', function(){
            clearMap()
            getAllMarkers(this.id)
        })
    }
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend)
}

function getMarker(){
    var loc_id = document.getElementById('location').value,
        struct_id = document.getElementById('structure').value

    var location = locations.find(function (location) {
        return location.id == loc_id
    }),
        structure = location.structures.find(function (zone) {
        return zone.structure_id == struct_id
    })

    var lps = lightning_protections[structure.lightning_protection - 1].name,
        sps1 = surge_protections[structure.surge_protection.power - 1].name,
        sps2 = surge_protections[structure.surge_protection.telecom - 1].name,
        r1_before_class = structure.r1_before >= 1E-5 ? 'code-red' : 'code-green';
    r1_after_class = structure.r1_after >= 1E-5 ? 'code-red' : 'code-green';

    var contentString = `<div id="content" class="location-info">
            <h1 class="head is-size-5 has-text-centered has-text-weight-bold">${location.name}</h1>
            <div class="body">
                <ul class="info-list">
                    <li> Lightning Ground Flash Density ( flashes/km²/year ): ${location.lightning_ground_flash_density}</li>
                    <li> Soil Resistivity ( Ω meter ) : ${location.soil_resistivity}</li>
                    <li> R1 (Loss of Human Life) : 
                        <span class="${r1_before_class}">
                            ${structure.r1_before}
                        </span>
                    </li>
                    <li> Lightning Protection System (LPS) : ${lps} <br> </li>
                    <li> Surge Protection Device (SPD) : 
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
    
    infoWindow = createInfoWindow(contentString)
    marker = createMarker(location, infoWindow)
    map.panTo(location.cord)
}

function getAllMarkers(id){
    var code = id.substr(0, id.indexOf('-'))
    var legend = legends.find(function(legend){
        return legend.icon === code
    })
    var locationList = locations.filter(function(location){
        return location.soil_resistivity >= legend.min && location.soil_resistivity <= legend.max 
    })

    locationList.forEach(function(location){
        var contentString = `<div id="content" class="location-info">
            <h1 class="head is-size-5 has-text-centered has-text-weight-bold">${location.name}</h1>
            <div class="body">
                <ul class="info-list">
                    <li> Lightning Ground Flash Density ( flashes/km²/year ) : ${location.lightning_ground_flash_density}</li>
                    <li> Soil Resistivity ( Ω meter ) : ${location.soil_resistivity}</li>
                </ul>
            </div>
        </div>`;
        
        var iw = createInfoWindow(contentString)
        var m = createMarker(location, iw)

        markers.push(m)
        infoWindows.push(iw)
    })

    map.panTo({ lat: 3.9398315, lng: 102.3507851 })
}

function createInfoWindow(contentString){
    return new google.maps.InfoWindow({
        content: contentString
    })
}

function createMarker(location, iw){
    var m =  new google.maps.Marker({
        position: location.cord,
        title: location.name,
        icon: { url: getMarkerColor(location.soil_resistivity) }
    })

    m.setMap(map)
    m.addListener('click', function () {
        if(infoWindows.length > 0){
            infoWindows.forEach(function(window){
                window.close()
            })
        }

        iw.open(map, m)
    })
   return m
}

function clearMap(){
    if (infoWindows.length > 0)
        clearInfoWindows()
    if (markers.length > 0)
        clearMarkers()
    if (infoWindow !== null)
        clearInfoWindow()
    if (marker !== null)
        clearMarker()
}

function clearInfoWindow() {
    google.maps.event.clearInstanceListeners(infoWindow)
    infoWindow.close()
    infoWindow = null
}

function clearMarker() {
    google.maps.event.clearInstanceListeners(marker, 'click')
    marker.setMap(null)
    marker = null
}

function clearInfoWindows() {
    infoWindows.forEach(function (iw) {
        google.maps.event.clearInstanceListeners(iw)
        iw.close()
    })

    infoWindows = []
}

function clearMarkers() {
    markers.forEach(function (m) {
        google.maps.event.clearInstanceListeners(m, 'click')
        m.setMap(null)
    })
    markers = []
}

function getMarkerColor(resistivity) {
    var color;

    if (resistivity >= 1 && resistivity <= 50)
        color = 'pink'
    else if (resistivity >= 51 && resistivity <= 100)
        color = 'pink'
    else if (resistivity >= 101 && resistivity <= 150)
        color = 'orange'
    else if (resistivity >= 151 && resistivity <= 200)
        color = 'orange'
    else if (resistivity >= 201 && resistivity <= 250)
        color = 'yellow'
    else if (resistivity >= 251 && resistivity <= 300)
        color = 'green'
    else if (resistivity >= 301 && resistivity <= 350)
        color = 'dkgreen'
    else if (resistivity >= 351 && resistivity <= 400)
        color = 'ltblue'
    else if (resistivity >= 401 && resistivity <= 450)
        color = 'blue'
    else
        color = 'purple'

    return `icons/${color}-dot.png`;
}
