var force = [];
var vehicles = [];
var species = [];
var guns = [];
var melee = [];
var armor = [];
var grenades = [];
var equipment = [];
var robots = [];

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
    guns = json.guns;
    melee = json.melee;
    armor = json.armor;
    grenades = json.grenades;
    equipment = json.equipment;
    robots = json.robots;
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
    updateForce();
}

function addSquad()
{
    force.push(new SquadEntry());
    updateForce();
}

function addVehicle()
{
    force.push(new VehicleEntry());
    updateForce();
}

function addRobot()
{
    force.push(new RobotEntry());
    updateForce();
}

function updateForce()
{
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

    if(element instanceof RobotEntry){
        renderRobotElement(element);
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
    container.classList.add("entry")
    addRemoveOption(container, element)
    var name = document.createElement("span");
    if(characterType == "character")
    {
        name.innerHTML = "&#9733; CHARACTER";
    } else {
        name.innerHTML = "<strong>&therefore;</strong> SQUAD";
    }
    container.appendChild(name);
    var dropdown = document.createElement("SELECT");
    species.forEach(function(specie){
        var option = new Option(specie.name + " (" + specie[characterType].cost + ")", specie.name);
        dropdown.add(option);
    });
    container.appendChild(dropdown);
    dropdown.selectedIndex = element.species;
    dropdown.onchange = function(){
        element.setSpecies(dropdown.selectedIndex);
        console.log("Species set to " + species[element.species].name + "with cost" + species[element.species][characterType].cost);
        calculateForceCost();
    }
    renderLoadoutElement(element, container);
    document.getElementById("force").appendChild(container);
}

function renderLoadoutElement(element, container){
    var loadoutContainer = document.createElement("div");
    console.log("Rendering element with " + element.loadouts.length + " loadouts");
    element.loadouts.forEach(function(loadout){
        var loadoutDiv = document.createElement("div");
        loadoutDiv.classList.add("loadout");
        renderArmorSection(loadout, loadoutDiv);
        renderWeaponSection(loadout, loadoutDiv);
        renderGrenadeSection(loadout, loadoutDiv);
        renderEquipmentSection(loadout, loadoutDiv);
        loadoutContainer.appendChild(loadoutDiv);
    });
    container.appendChild(loadoutContainer);
}

function renderArmorSection(loadout, loadoutDiv)
{
    var section = document.createElement("div");
    var label = document.createElement("span");
    label.innerHTML = "Armor: ";
    section.appendChild(label);
    var dropdown = document.createElement("SELECT");
    var noneOption = new Option("None", "");
    dropdown.add(noneOption);
    armor.forEach(function(armorType){
        var option = new Option(armorType.name + " (" + armorType.cost + ")", armorType.name);
        dropdown.add(option);
    });
    dropdown.selectedIndex = loadout.armorId + 1;
    dropdown.onchange = function(){
        loadout.armorId = dropdown.selectedIndex - 1;
        if(loadout.armorId >= 0){
            console.log("Armor set to " + armor[loadout.armorId].name + "with cost" + armor[loadout.armorId].cost);
        } else {
            console.log("Armor cleared");
        }
        updateForce();
    }
    section.appendChild(dropdown);

    if(loadout.armorId >= 0){
        var armorInfo = document.createElement("span");
        var armorEntry = armor[loadout.armorId];
        armorInfo.innerHTML += "HP: " + armorEntry.hp + " Damage Reduction: " + armorEntry["damage reduction"] + " Movement Penalty: " + armorEntry["movement penalty"];
        section.appendChild(armorInfo);
    }

    loadoutDiv.appendChild(section);
}

function renderWeaponSection(loadout, loadoutDiv)
{
    var section = document.createElement("div");
    var label = document.createElement("span");
    label.innerHTML = "Weapons: ";
    section.appendChild(label);
    for(var index = 0; index < loadout.weaponIds.length; index++)
    {
        renderWeaponElement(loadout, section, index);
    }
    loadoutDiv.appendChild(section);
}

function renderWeaponElement(loadout, loadoutDiv, index)
{
    var dropdown = document.createElement("SELECT");
    var noneOption = new Option("None", "");
    dropdown.add(noneOption);
    guns.forEach(function(gun){
        var option = new Option(gun.name + " (" + gun.cost + ")", gun.name);
        dropdown.add(option);
    });
    melee.forEach(function(weapon){
        if(weapon.cost > 0)
        {
            var option = new Option(weapon.name + " (" + weapon.cost + ")", weapon.name);
            dropdown.add(option);
        }
    });
    if(loadout.weaponIds[index] == ""){
        dropdown.selectedIndex = 0;
    } else {
        var weaponType = loadout.weaponIds[index].split(".")[0];
        if(weaponType == "guns")
        {
            dropdown.selectedIndex = parseInt(loadout.weaponIds[index].split(".")[1]) + 1;
        } else if (weaponType == "melee") {
            dropdown.selectedIndex = parseInt(loadout.weaponIds[index].split(".")[1]) + 1 + guns.length;
        }
    }
    dropdown.onchange = function(){
        if(dropdown.selectedIndex == 0){
            loadout.weaponIds[index] = "";
        } else if (dropdown.selectedIndex <= guns.length)
        {
            loadout.weaponIds[index] = "guns." + (dropdown.selectedIndex - 1);
        } else {
            loadout.weaponIds[index] = "melee." + (dropdown.selectedIndex - (guns.length + 1));
        }
        console.log("Weapon " + index + " set to " + loadout.weaponIds[index]);
        updateForce();
    }

    loadoutDiv.appendChild(dropdown);
    
    if(loadout.weaponIds[index] != "")
    {
        var weaponInfo = document.createElement("span");
        var weaponType = loadout.weaponIds[index].split(".")[0];
        if(weaponType == "guns")
        {
            var weaponEntry = guns[parseInt(loadout.weaponIds[index].split(".")[1])];
            weaponInfo.innerHTML += " Range: " + weaponEntry["range"] + " Accuracy: " + weaponEntry["accuracy"] + " Damage: " + weaponEntry["damage"] + " Type: " + weaponEntry["type"] +  " Notes: " + weaponEntry["notes"];
        } else if (weaponType == "melee") {
            var weaponEntry = melee[parseInt(loadout.weaponIds[index].split(".")[1])];
            weaponInfo.innerHTML += " Accuracy: " + weaponEntry["accuracy"] + " Damage: " + weaponEntry["damage"] + " Notes: " + weaponEntry["notes"];
        }
        loadoutDiv.appendChild(weaponInfo);
    }
}

function renderGrenadeSection(loadout, loadoutDiv)
{
    var section = document.createElement("div");
    var label = document.createElement("span");
    label.innerHTML = "Grenade: ";
    section.appendChild(label);
    var dropdown = document.createElement("SELECT");
    var noneOption = new Option("None", "");
    dropdown.add(noneOption);
    grenades.forEach(function(grenateType){
        var option = new Option(grenateType.name + " (" + grenateType.cost + ")", grenateType.name);
        dropdown.add(option);
    });
    dropdown.selectedIndex = loadout.grenadeId + 1;
    dropdown.onchange = function(){
        loadout.grenadeId = dropdown.selectedIndex - 1;
        if(loadout.grenadeId >= 0){
            console.log("Grenade set to " + grenades[loadout.grenadeId].name + "with cost" + grenades[loadout.grenadeId].cost);
        } else {
            console.log("Grenade cleared");
        }
        updateForce();
    }
    section.appendChild(dropdown);

    if(loadout.grenadeId >= 0){
        var grenadeInfo = document.createElement("span");
        var grenadeEntry = grenades[loadout.grenadeId];
        grenadeInfo.innerHTML += "Range: " + grenadeEntry["range"] + " Accuracy: " + grenadeEntry["accuracy"] + " Damage: " + grenadeEntry["damage"] + " Notes: " + grenadeEntry["notes"];
        section.appendChild(grenadeInfo);
    }

    loadoutDiv.appendChild(section);
}

function renderEquipmentSection(loadout, loadoutDiv)
{
    var label = document.createElement("span");
    label.innerHTML = "Equipment: ";
    loadoutDiv.appendChild(label);
    for(var index = 0; index < loadout.equipmentIds.length; index++)
    {
        renderEquipmentElement(loadout, loadoutDiv, index);
    }
}

function renderEquipmentElement(loadout, loadoutDiv, index)
{
    var dropdown = document.createElement("SELECT");
    var noneOption = new Option("None", "");
    dropdown.add(noneOption);
    equipment.forEach(function(equipmentType){
        var option = new Option(equipmentType.name + " (" + equipmentType.cost + ")", equipmentType.name);
        dropdown.add(option);
    });
    dropdown.selectedIndex = loadout.equipmentIds[index] + 1;
    dropdown.onchange = function(){
        loadout.equipmentIds[index] = dropdown.selectedIndex - 1;
        if(loadout.equipmentIds[index] >= 0){
            console.log("Equipment " + index + " set to " + equipment[loadout.equipmentIds[index]].name + "with cost" + equipment[loadout.equipmentIds[index]].cost);
        } else {
            console.log("Equipment " + index + " cleared");
        }
        calculateForceCost();
    }
    loadoutDiv.appendChild(dropdown);
}

function renderVehicleElement(element)
{
    var container = document.createElement("div");
    container.classList.add("entry")
    addRemoveOption(container, element)
    var label = document.createElement("span");
    label.innerHTML = "&#127949; VEHICLE";
    container.appendChild(label);
    var dropdown = document.createElement("SELECT");
    vehicles.forEach(function(vehicle){
        var option = new Option(vehicle.name + " (" + vehicle.cost + ")", vehicle.name);
        dropdown.add(option);
    });
    container.appendChild(dropdown);
    dropdown.selectedIndex = element.vehicleType;
    dropdown.onchange = function(){
        element.setVehicleId(dropdown.selectedIndex);
        element.weaponIds = [];
        vehicles[element.vehicleType].weapon_mounts.forEach(function(){
            element.weaponIds.push(-1);
        })
        element.includesCrew = false;
        element.loadouts = [];
        console.log("Vehicle type set to " + vehicles[element.vehicleType].name + "with cost " + vehicles[element.vehicleType].cost);
        updateForce();
    }
    renderVehicleWeapons(element, container);

    renderVehicleCrew(element, container);

    document.getElementById("force").appendChild(container);
}

function renderVehicleCrew(element, container) {
    var crewSection = document.createElement("div");
    var crewLabel = document.createElement("span");
    crewLabel.innerHTML = "Include Crew: "
    crewSection.appendChild(crewLabel)

    var checkbox = document.createElement("INPUT");
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = element.includesCrew;
    checkbox.onclick = function() {
        element.includesCrew = checkbox.checked;
        console.log("Setting has crew to " + checkbox.checked + " " + element.includesCrew)
        element.loadouts = [];
        if(element.includesCrew)
        {
            for(var crewIndex = 0; crewIndex < vehicles[element.vehicleType].crew; crewIndex++)
            {
                element.loadouts.push(new Loadout(false));
            }
        }
        updateForce();
    }
    crewSection.appendChild(checkbox);
    
    if(element.includesCrew) {
        var dropdown = document.createElement("SELECT");
        species.forEach(function(specie){
            if(specie.hasOwnProperty("crew_costs")){
                var crewIndex = (vehicles[element.vehicleType].crew) - 1;
                var option = new Option(specie.name + " (" + specie.crew_costs[crewIndex] + ")", specie.name);
                dropdown.add(option);
            }
        });
        crewSection.appendChild(dropdown);
        dropdown.selectedIndex = element.crewSpeciesId;
        dropdown.onchange = function(){
            element.crewSpeciesId = dropdown.selectedIndex;
            updateForce();
        }
    }
    renderLoadoutElement(element, crewSection);
    container.appendChild(crewSection);
}

function renderVehicleWeapons(element, container)
{
    for(var index = 0; index < element.weaponIds.length; index++)
    {
        renderVehicleWeaponElement(element, container, index);
    }
}

function renderVehicleWeaponElement(loadout, loadoutDiv, index)
{
    console.log("rendering vehicle weapon " + index);
    var dropdown = document.createElement("SELECT");
    var noneOption = new Option("None", "");
    dropdown.add(noneOption);

    var selectIndex = 0;
    for(var gunIndex = 0; gunIndex < guns.length; gunIndex++)
    {
        var gun = guns[gunIndex];
        if(vehicles[loadout.vehicleType].weapon_mounts[index] == "any"
        || vehicles[loadout.vehicleType].weapon_mounts[index] == gun.type){
            var option = new Option(gun.name + " (" + gun.cost + ")", gunIndex);
            dropdown.add(option);
            if(gunIndex == parseInt(loadout.weaponIds[index]))
            {
                selectIndex = dropdown.length - 1;
            }
        }
    }
    dropdown.selectedIndex = selectIndex;
    dropdown.onchange = function(){
        loadout.weaponIds[index] = parseInt(dropdown.value);
        if(loadout.weaponIds[index] >= 0){
            console.log("Vehicle Weapon " + index + " set to " + dropdown.value + " : " + guns[loadout.weaponIds[index]].name + " with cost " + guns[loadout.weaponIds[index]].cost);
        } else {
            console.log("Vehicle Weapon " + index + " cleared" + dropdown.value);
        }
        calculateForceCost();
    }
    loadoutDiv.appendChild(dropdown);
}

function renderRobotElement(element)
{
    var container = document.createElement("div");
    container.classList.add("entry")
    addRemoveOption(container, element)
    var label = document.createElement("span");
    label.innerHTML = "&#129302; ROBOT";
    container.appendChild(label);
    var dropdown = document.createElement("SELECT");
    robots.forEach(function(robot){
        var option = new Option(robot.name + " (" + robot.cost + ")", robot.name);
        dropdown.add(option);
    });
    container.appendChild(dropdown);
    dropdown.selectedIndex = element.robotType;
    dropdown.onchange = function(){
        element.setRobotId(dropdown.selectedIndex);
        console.log("Robot type set to " + robots[element.robotType].name + "with cost " + robots[element.robotType].cost);
        calculateForceCost();
        renderEntries();
    }
    renderWeaponSection(element, container);
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
    loadouts = [];

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
    constructor(id){
        super(id);
        this.loadouts.push(new Loadout(true));
    }

    get cost(){
        return species[this.speciesId].character.cost + this.loadouts[0].cost;
    }
}

class SquadEntry extends SpeciesEntry
{
    constructor(id){
        super(id);
        this.loadouts.push(new Loadout(false));
        this.loadouts.push(new Loadout(false));
        this.loadouts.push(new Loadout(false));
    }

    get cost(){
        var loadoutCost = 0;
        this.loadouts.forEach(function(loadout){
            loadoutCost += loadout.cost;
        })
        return species[this.speciesId].squad.cost + loadoutCost;
    }
}

class VehicleEntry extends ForceEntry
{
    #vehicleId = 0;
    weaponIds = [];
    includesCrew = false;
    crewSpeciesId = 0;
    loadouts = [];

    get vehicleType() {
        return this.#vehicleId;
    }

    get cost() {
        console.log("current id " + this.#vehicleId + " cost: " + vehicles[this.#vehicleId].cost)
        var weaponCost = 0;
        this.weaponIds.forEach(function(weaponId){
            if(weaponId >= 0){
                weaponCost += guns[weaponId].cost;
            }
        });
        var crewCost = 0;
        if(this.includesCrew){
            crewCost += species[this.crewSpeciesId].crew_costs[(vehicles[this.#vehicleId].crew) - 1];
            this.loadouts.forEach(function(loadout){
                crewCost += loadout.cost;
            })
        }
        return vehicles[this.#vehicleId].cost + weaponCost + crewCost;
    }

    setVehicleId(newId) {
        this.#vehicleId = newId;
    }
}

class RobotEntry extends ForceEntry
{
    #robotId = 0;
    weaponIds = ["","",""];

    get robotType() {
        return this.#robotId;
    }

    get cost() {
        var weaponCost = getWeaponsCost(this.weaponIds);
        console.log("current id " + this.#robotId + " cost: " + robots[this.#robotId].cost + " weapons: " + weaponCost)
        return robots[this.#robotId].cost + weaponCost;
    }

    setRobotId(newId) {
        this.#robotId = newId;
    }
}

class Loadout 
{
    armorId = -1;
    weaponIds = [];
    grenadeId = -1;
    equipmentIds = [];
    
    constructor(isCharacter){
        if(isCharacter){
            this.weaponIds = ["","",""];
            this.equipmentIds = [-1,-1];
        }else{
            this.weaponIds = ["",""];
            this.equipmentIds = [-1];
        }
    }

    get cost(){
        var cost = 0;

        if(this.armorId >= 0) cost += armor[this.armorId].cost;
        if(this.grenadeId >= 0) cost += grenades[this.grenadeId].cost;
        cost += getWeaponsCost(this.weaponIds);
        this.equipmentIds.forEach(function(equipmentId){
            if(equipmentId >= 0) cost += equipment[equipmentId].cost;
        });
        
        return cost;
    }
}

function getWeaponsCost(weaponIds)
{
    var cost = 0;
    weaponIds.forEach(function(weaponId){
        console.log("Parsing weapon " + weaponId);
        if(weaponId != "") {
            var weaponType = weaponId.split(".")[0];
            var weaponIndex = weaponId.split(".")[1];
            if(weaponType == "guns"){
                cost += guns[weaponIndex].cost;
            } else if(weaponType == "melee"){
                cost += melee[weaponIndex].cost;
            } else {
                console.log("Unknown weapon type " + weaponType);
            }
        }
    });
    return cost;
}