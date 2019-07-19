var map;
var layer;
var mapOptions = {
    center: {
        lat: 3.9398315,
        lng: 102.3507851
    },
    zoom: 7
};

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