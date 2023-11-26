///////// Hente ut informasjon fra URL //////////


const urlParams = new URLSearchParams(window.location.search);
const name_1 = urlParams.get('name');
document.getElementById("name_1").innerHTML = name_1;

const email_1 = urlParams.get('email');
document.getElementById("email_1").innerHTML = email_1;

const brand = urlParams.get('car_brand');
document.getElementById("brand").innerHTML = brand;

const model = urlParams.get('car_model');
document.getElementById("model").innerHTML = model;

const pickup = urlParams.get('pickup_date');
document.getElementById("pickup").innerHTML = pickup;

///////// Regne ut pris //////////

const pickupDate = new Date(urlParams.get('pickup_date'));
const returnDate = new Date(urlParams.get('return_date'));
const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));

const carBrands = [

    {
        brand: "Porsche",
        models: [
            { model: "911 Turbo S", price: 1000 },
            { model: "911 Turbo S Cabriolet", price: 1000 },
            { model: "911 Turbo", price: 1000 },
            { model: "911 Turbo Cabriolet", price: 1000 }
        ]
    },
    {
        brand: "BMW",
        models: [
            { model: "I7 xDrive60 M", price: 1000 },
            { model: "M4", price: 1000 },
            { model: "M5", price: 1000 }
        ]
    },
    {
        brand: "Mercedes Benz",
        models: [
            { model: "AMG E63s", price: 1000 },
            { model: "AMG C63s", price: 1000 },
            { model: "AMG GT", price: 1000 }
        ]
    },
    {
        brand: "Rolls-Royce",
        models: [
            { model: "Phantom", price: 1500 },
            { model: "Ghost", price: 1500 },
            { model: "Cullinan", price: 1500 }
        ]
    },
    {
        brand: "Mercedes-Benz",
        models: [
            { model: "Gelenderwagen", price: 1500 },
            { model: "Maybach", price: 1500 },
            { model: "S-klasse", price: 1500 }
        ]
    },
    {
        brand: "Range Rover",
        models: [
            { model: "Velar", price: 1500 },
            { model: "Sport", price: 1500 },
            { model: "Evoque", price: 1500 }
        ]
    },
    {
        brand: "Lamborghini",
        models: [
            { model: "Aventador", price: 2500 },
            { model: "Huracan", price: 2500 },
            { model: "Urus", price: 2500 }
        ]
    },
    {
        brand: "Bugatti",
        models: [
            { model: "Chiron", price: 2500 },
            { model: "Veyron", price: 2500 },
            { model: "Divo", price: 2500 }
        ]
    },
    {
        brand: "Ferrari",
        models: [
            { model: "488 GTB", price: 2500 },
            { model: "812 Superfast", price: 2500 },
            { model: "SF90 Stradale", price: 2500 }
        ]
    }
];

let totalPrice = 0;
for (let i = 0; i < carBrands.length; i++) {
if (carBrands[i].brand === brand) {
    const models = carBrands[i].models;
    for (let j = 0; j < models.length; j++) {
        if (models[j].model === model) {
            totalPrice = models[j].price * days;
            break;
        }
    }
    break;
}
    }

document.getElementById("total_price").innerHTML = totalPrice;
document.getElementById("days").innerHTML = days;

//////////// Bekreftelses mail ////////////

const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById("pickup").innerHTML = pickupDate.toLocaleDateString("no", options);

function SendMail() {
    const urlParams = new URLSearchParams(window.location.search);

    const name = urlParams.get("name");
    const email = urlParams.get("email");
    const car_brand = urlParams.get("car_brand");
    const car_model = urlParams.get("car_model");
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedPickupDate = pickupDate.toLocaleDateString("no", options);
    document.getElementById("pickup").innerHTML = formattedPickupDate;
    const returnDate = new Date(urlParams.get('return_date'));
    const formattedReturnDate = returnDate.toLocaleDateString("no", options);
    document.getElementById("total_price").innerHTML = totalPrice;
    const totalDays = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
    document.getElementById("days").innerHTML = totalDays;
    
    

const params = {
    navn: name,
    email: email,
    car_brand: car_brand,
    car_model: car_model,
    pickup: formattedPickupDate,
    return1: formattedReturnDate,
    totalPrice: totalPrice,
    totalDays: totalDays
};

emailjs.send("service_60bjk0g", "template_gdufms5", params)
    .then(function(response) {
        console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
        alert("Bekreftelse er sendt!");
    })
    .catch(function(error) {
        console.log("FAILED. error=", error);
        alert("Sending bekreftelse failed. Please try again later.");
    });
}