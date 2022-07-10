var force = [];
var vehicles = [];
var species = [];

function getUrl(url){
	var req = new XMLHttpRequest();
	req.open("GET",url,true);
	return req;
}

function loadURL(url){
	var req = getUrl(url);
	req.send();
	return new Promise(function(resolve, reject) {
		req.onreadystatechange = function() {
			if(req.readyState === 4)
			{
				if(req.status === 200)
				{
					resolve(JSON.parse(req.response));
				}else{
					reject();
				}
			}
		};
	});
}

function dataLoaded(json){
	vehicles = json.vehicles;
    species = json.species;
}

function initialize()
{
    var upgradeLoadPromise = loadURL("data.json");
	upgradeLoadPromise.then(dataLoaded);
	upgradeLoadPromise.catch(function(){alert("data load failed");});
}

function calculateForceCost()
{
    var cost = 0;
    force.forEach(function(element)
    {
        cost += element.cost;
    });
    console.log("Total force cost: " + cost);
    document.getElementById("forceCost").innerHTML = cost;
}

function addCharacter()
{
    force.push(new CharacterEntry());
    console.log("Force now has " + force.length + " entries");
    renderEntries();
    calculateForceCost();
}

function addSquad()
{
    force.push(new SquadEntry());
    console.log("Force now has " + force.length + " entries");
    renderEntries();
    calculateForceCost();
}

function addVehicle()
{
    force.push(new VehicleEntry());
    console.log("Force now has " + force.length + " entries");
    renderEntries();
    calculateForceCost();
}

function renderEntries()
{
    console.log("Rendering entries");
    document.getElementById("force").innerHTML = "";
    force.forEach(renderElement);
}

function renderElement(element)
{
    if(element instanceof CharacterEntry){
        renderCharacterElement(element);
    }
    if(element instanceof SquadEntry){
        renderSquadElement(element);
    }

    if(element instanceof VehicleEntry){
        renderVehicleElement(element);
    }
}

function renderCharacterElement(element)
{
    renderSpeciesElement(element, "character")
}

function renderSquadElement(element)
{
    renderSpeciesElement(element, "squad")
}

function renderSpeciesElement(element, characterType)
{
    var container = document.createElement("div");
    addRemoveOption(container, element)
    var dropdown = document.createElement("SELECT");
    species.forEach(function(specie){
        var option = new Option(specie.name + " (" + specie[characterType].cost + ")", specie.name);
        dropdown.add(option);
    });
    container.appendChild(dropdown);
    var name = document.createElement("span");
    name.innerHTML = characterType;
    container.appendChild(name);
    dropdown.selectedIndex = element.species;
    dropdown.onchange = function(){
        element.setSpecies(dropdown.selectedIndex);
        console.log("Species set to " + species[element.species].name + "with cost" + species[element.species][characterType].cost);
        calculateForceCost();
    }
    document.getElementById("force").appendChild(container);
}

function renderVehicleElement(element)
{
    var container = document.createElement("div");
    addRemoveOption(container, element)
    var dropdown = document.createElement("SELECT");
    vehicles.forEach(function(vehicle){
        var option = new Option(vehicle.name + " (" + vehicle.cost + ")", vehicle.name);
        dropdown.add(option);
    });
    container.appendChild(dropdown);
    dropdown.selectedIndex = element.vehicleType;
    dropdown.onchange = function(){
        element.setVehicleId(dropdown.selectedIndex);
        console.log("Vehicle type set to " + vehicles[element.vehicleType].name + "with cost" + vehicles[element.vehicleType].cost);
        calculateForceCost();
    }
    document.getElementById("force").appendChild(container);
}

function addRemoveOption(container, element)
{
    var button = document.createElement("button");
    button.innerHTML = "X";
    button.onclick = function(){
        const index = force.indexOf(element);
        if(index > -1){
            force.splice(index, 1);
        }
        renderEntries();
        calculateForceCost();
    }
    container.appendChild(button);
}

class ForceEntry {
    constructor(id)
    {
        this.id = id;
    }

    get cost() {
        return 0;
    }
}

class SpeciesEntry extends ForceEntry
{
    speciesId = 0;

    constructor(id)
    {
        super(id);
    }

    get species() {
        return this.speciesId;
    }

    setSpecies(newSpeciesId)
    {
        this.speciesId = newSpeciesId;
    }
}

class CharacterEntry extends SpeciesEntry
{
    get cost(){
        return species[this.speciesId].character.cost;
    }
}

class SquadEntry extends SpeciesEntry
{
    get cost(){
        return species[this.speciesId].squad.cost;
    }
}

class VehicleEntry extends ForceEntry
{
    #vehicleId = 0;

    get vehicleType() {
        return this.#vehicleId;
    }

    get cost() {
        console.log("current id " + this.#vehicleId + " cost: " + vehicles[this.#vehicleId].cost)
        return vehicles[this.#vehicleId].cost;
    }

    setVehicleId(newId) {
        this.#vehicleId = newId;
    }
}