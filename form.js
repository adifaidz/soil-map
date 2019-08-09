document.addEventListener('DOMContentLoaded', function(){
    var back = document.getElementById('back'), 
        next = document.getElementById('next'),
        section1 = document.getElementById('structure-info'),
        section2 = document.getElementById('powerline-info'),
        section3 = document.getElementById('telecomline-info');

    back.addEventListener('click', function(){
        var active = document.querySelector('.section.active');
        if (active.id === "powerline-info"){
            console.log('back1')
            section1.style.display = "block";
            section1.classList.add('active');

            active.style.display = "none";
            active.classList.remove('active');
            section3.style.display = "none";
        }
        else if(active.id === "telecomline-info"){
            console.log('back2')
            section2.style.display = "block";
            section2.classList.add('active');

            active.style.display = "none";
            active.classList.remove('active');
            section1.style.display = "none"
        }
        else
            console.log('back3');

    })
    
    next.addEventListener('click', function () {
        var active = document.querySelector('.section.active');
        if (active.id === "structure-info") {
            console.log('next1')
            section2.style.display = "block"
            section2.classList.add('active');

            active.style.display = "none";
            active.classList.remove('active');
            section3.style.display = "none";
        } else if (active.id === "powerline-info") {
            console.log('next2')
            section3.style.display = "block";
            section3.classList.add('active');

            active.style.display = "none";
            active.classList.remove('active');
            section1.style.display = "none";
        }
        else
            console.log('next3');
    })
})

get('structure').then(function(structures) {
    var select = document.querySelector('#structure-info select#type');
    structures.forEach(function(structure){
        select.options.add(new Option(structure.name, structure.name))
    });
})

get('location-factor').then(function (factors) {
    var select = document.querySelector('#structure-info select#location'),
        select2 = document.querySelector('#powerline-info select#location'),
        select3 = document.querySelector('#telecomline-info select#location'),
        select4 = document.querySelector('#telecomline-info select#location2');
    factors.forEach(function (factor) {
        select.options.add(new Option(factor.name, factor.value))
        select2.options.add(new Option(factor.name, factor.value))
        select3.options.add(new Option(factor.name, factor.value))
        select4.options.add(new Option(factor.name, factor.value))
    });
})

get('environmental-factor').then(function (environments) {
    var select = document.querySelector('#structure-info select#environment'),
        select2 = document.querySelector('#powerline-info select#environment'),
        select3 = document.querySelector('#telecomline-info select#environment');
    environments.forEach(function (environment) {
        select.options.add(new Option(environment.name, environment.value))
        select2.options.add(new Option(environment.name, environment.value))
        select3.options.add(new Option(environment.name, environment.value))
    });
})

get('lightning-ground-flash-density').then(function (types) {
    var select = document.querySelector('#structure-info select#flash-density-type');
    types.forEach(function (type) {
        select.options.add(new Option(type.name, type.value))
    });
})

get('structure-protection').then(function (protections) {
    var select = document.querySelector('#structure-info select#lightning-protection');
    protections.forEach(function (protection) {
        select.options.add(new Option(protection.name, protection.value))
    });
})

get('screening-effectiveness').then(function (screens) {
    var select = document.querySelector('#structure-info select#screening-effectiveness');
    screens.forEach(function (screen) {
        select.options.add(new Option(screen.name, screen.value))
    });
})

get('protection-measure').then(function (protections) {
    var select = document.querySelector('#structure-info select#shock-protection');
    protections.forEach(function (protection) {
        select.options.add(new Option(protection.name, protection.value))
    });
})

get('powerline-type').then(function (types) {
    var select = document.querySelector('#powerline-info select#type'),
        select2 = document.querySelector('#telecomline-info select#type');
    types.forEach(function (type) {
        select.options.add(new Option(type.name, type.value))
        select2.options.add(new Option(type.name, type.value))
    });
})

get('line-shielding').then(function (shieldings) {
    var select = document.querySelector('#powerline-info select#line-shielding'),
        select2 = document.querySelector('#telecomline-info select#line-shielding');
    shieldings.forEach(function (shielding) {
        select.options.add(new Option(shielding.name, shielding.value))
        select2.options.add(new Option(shielding.name, shielding.value))
    });
})

get('internal-wiring-type').then(function (wirings) {
    var select = document.querySelector('#powerline-info select#internal-wiring'),
        select2 = document.querySelector('#telecomline-info select#internal-wiring');
    wirings.forEach(function (wiring) {
        select.options.add(new Option(wiring.name, wiring.value))
        select2.options.add(new Option(wiring.name, wiring.value))
    });
})

get('withstand-voltage').then(function (voltages) {
    var select = document.querySelector('#powerline-info select#withstand-voltage'),
        select2 = document.querySelector('#telecomline-info select#withstand-voltage');
    voltages.forEach(function (voltage) {
        select.options.add(new Option(voltage.name, voltage.value))
        select2.options.add(new Option(voltage.name, voltage.value))
    });
})

get('surge-protection-device').then(function (protections) {
    var select = document.querySelector('#powerline-info select#surge-protection'),
        select2 = document.querySelector('#telecomline-info select#surge-protection');
    protections.forEach(function (protection) {
        select.options.add(new Option(protection.name, protection.value))
        select2.options.add(new Option(protection.name, protection.value))
    });
})
function get(name){
    return fetch(`data/${name}.json`).then(function (response) {
        return response.json();
    })
}

