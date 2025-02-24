var swep1, swep2, swep3, swep4, swep5, swep6, swep7, swfull;
var selectedData; //used to store the selected data

document.addEventListener("DOMContentLoaded", async function() {
    await loadJSON();
    if(selectedData == null){
        selectedData = swfull;
        d3Setup();
    }

    const epSelect = document.querySelector("#ep-select");

    epSelect.addEventListener("change", function(event){
        console.log(event.target.value);
        if(event.target.value == "swep1"){selectedData = swep1;}
        if(event.target.value == "swep2"){selectedData = swep2;}
        if(event.target.value == "swep3"){selectedData = swep3;}
        if(event.target.value == "swep4"){selectedData = swep4;}
        if(event.target.value == "swep5"){selectedData = swep5;}
        if(event.target.value == "swep6"){selectedData = swep6;}
        if(event.target.value == "swep7"){selectedData = swep7;}
        if(event.target.value == "swfull"){selectedData = swfull;}
        console.log(selectedData);
        d3Setup();
    });


    //TODO: En nod flyger iväg fast vi har domain satt
    //TODO: En instans till av Node-link med brushing and linking för jämförelse (punkt 2 och 4)
    //TODO: Kontrollpanel på höger sida ska implementeras (punkt 3)
    //TODO: Details on demand (punkt 5)
    // kolla vidare i pdfen för mer

    tick();
});

document.addEventListener("keydown", function(event) {
    //reload the page spacebar is pressed 
    if (event.keyCode === 32) window.location.reload();

});

function d3Setup(){
    d3.select("svg").remove();
    let width = d3.select("#viewport").node().getBoundingClientRect().width;
    let height = d3.select("#viewport").node().getBoundingClientRect().height;
    height = 800;
    width = 800;
    let margin = 20;
    
    let scale = d3.scaleLinear()
    .domain([d3.min(selectedData.nodes, d => d.value), d3.max(selectedData.nodes, d => d.value)])
    .range([margin, width - margin])
    .clamp(true);

    let svg = d3.select("#viewport").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create the x-axis
    svg.append("g")
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(d3.axisBottom(scale));
        

    let simulation = d3.forceSimulation(selectedData.nodes)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("link", d3.forceLink().links(selectedData.links))
        .force("collision", d3.forceCollide().radius(5))
        .on("tick", tick);
}

function updateNodes(){

    // alla selections fungerar likadant dvs de väljer alla noder och går in i datan och skapar cirklar för varje nod om den inte redan finns
    let selection = d3.select("svg")
    .selectAll("circle")
    .data(selectedData.nodes)
    .join("circle")  // Changed .enter().append to .join for better practice
    .attr("r", 5)
    .attr("fill",  function(d) {
        // If colour is gray make it slighlty more white to make it easier to make it out from the background 
        if(d.colour == "#808080"){
            d.colour = "#cccccc";
        }
        return d.colour;
    })
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
}

function updateLinks(){
    let selection = d3.select("svg")
    .selectAll("line")
    .data(selectedData.links)
    .join("line") // Changed from .enter().append to .join for better practice
    .attr("stroke", "white")
    .attr("stroke-width", 0.3)
    .attr("opacity", 0.7)
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
}
    
function tick() {
    updateLinks();
    updateNodes();
}


async function loadJSON() {
    let links = [
        "./data/starwars-episode-1-interactions-allCharacters.json",
        "./data/starwars-episode-2-interactions-allCharacters.json",
        "./data/starwars-episode-3-interactions-allCharacters.json",
        "./data/starwars-episode-4-interactions-allCharacters.json",
        "./data/starwars-episode-5-interactions-allCharacters.json",
        "./data/starwars-episode-6-interactions-allCharacters.json",
        "./data/starwars-episode-7-interactions-allCharacters.json",
        "./data/starwars-full-interactions-allCharacters.json"  
    ];

    try {
        const dataArray = await Promise.all(links.map(link => d3.json(link)));
        [swep1, swep2, swep3, swep4, swep5, swep6, swep7, swfull] = dataArray;
    } catch (error) {
        console.error('Error loading JSON files:', error);
    }
}









