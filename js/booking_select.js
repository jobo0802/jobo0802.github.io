function showCarModels() {
    var carBrandSelect = document.getElementById("car_brand");
    var carModelSelect = document.getElementById("car_model");
    var carModelLabel = document.querySelector("label[for='car_model']");

    // Fjern tidligere valg
    carModelSelect.innerHTML = "";

    if (carBrandSelect.value !== "") {
        // Hent valgt bilmerke
        var carBrand = carBrandSelect.value;

        // Hent bilmodellene basert på valgt bilmerke
        var carModels = getCarModels(carBrand);

        // Fyll inn valgmulighetene for bilmodell
        for (var i = 0; i < carModels.length; i++) {
            var option = document.createElement("option");
            option.value = carModels[i];
            option.text = carModels[i];
            carModelSelect.appendChild(option);
        }

        // Vis bilmodell-select og label
        carModelSelect.style.display = "block";
        carModelLabel.style.display = "block"; // Vis labelen
    } else {
        // Skjul bilmodell-select og label
        carModelSelect.style.display = "none";
        carModelLabel.style.display = "none"; // Skjul labelen
    }
}

function showCarBrands() {
    var carTypeSelect = document.getElementById("car_type");
    var carBrandsContainer = document.getElementById("car_models_container");
    var carBrandSelect = document.getElementById("car_brand");
    var carModelSelect = document.getElementById("car_model");
    var carModelLabel = document.querySelector("label[for='car_model']");

    // Fjern tidligere valg
    carBrandSelect.innerHTML = "";
    carModelSelect.innerHTML = "";

    if (carTypeSelect.value !== "") {
        // Vis containeren for bilmerker
        carBrandsContainer.style.display = "block";

        // Hent valgt biltype
        var carType = carTypeSelect.value;

        // Hent bilmerkene basert på valgt biltypen
        var carBrands = getCarBrands(carType);

        // Fyll inn valgmulighetene for bilmerke
        for (var i = 0; i < carBrands.length; i++) {
            var option = document.createElement("option");
            option.value = carBrands[i];
            option.text = carBrands[i];
            carBrandSelect.appendChild(option);
        }
    } else {
        // Skjul containeren for bilmerker
        carBrandsContainer.style.display = "none";
    }

    // Skjul bilmodell-select
    carModelSelect.style.display = "none";
    carModelLabel.style.display = "none";
}

function getCarBrands(carType) {
    switch (carType) {
        case "Sport":
            return ["Velg merke", "Porsche", "BMW", "Mercedes Benz"];
        case "Super":
            return ["Velg merke", "Lamborghini", "Bugatti", "Ferrari"];
        case "Lux":
            return ["Velg merke", "Rolls-Royce", "Mercedes-Benz", "Range Rover"];
        default:
            return [];
    }
}

function getCarModels(carBrand) {
    switch (carBrand) {
        case "Velg merke":
            return ["Velg bilmerke"];
        case "Porsche":
            return ["Velg modell", "911 Turbo S", "911 Turbo S Cabriolet", "911 Turbo", "911 Turbo Cabriolet"];
        case "BMW":
            return ["Velg modell", "I7 xDrive60 M", "M4", "M5"];
        case "Mercedes Benz":
            return ["Velg modell", "AMG E63s", "AMG C63s", "AMG GT"];
        case "Lamborghini":
            return ["Velg modell", "Aventador", "Huracan", "Urus"];
        case "Bugatti":
            return ["Velg modell", "Chiron", "Veyron", "Divo"];
        case "Ferrari":
            return ["Velg modell", "488 GTB", "812 Superfast", "SF90 Stradale"];
        case "Rolls-Royce":
            return ["Velg modell", "Phantom", "Ghost", "Cullinan"];
        case "Mercedes-Benz":
            return ["Velg modell", "Gelenderwagen", "Maybach", "S-klasse"];
        case "Range Rover":
            return ["Velg modell", "Velar", "Sport", "Evoque"];
        default:
            return [];
    }
}