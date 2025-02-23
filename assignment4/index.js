var swep1, swep2, swep3, swep4, swep5, swep6, swep7, swfull;

document.addEventListener("DOMContentLoaded", async function() {
    await loadJSON();

    let width = d3.select("#viewport").node().getBoundingClientRect().width;
    let height = d3.select("#viewport").node().getBoundingClientRect().height;
    let margin = 20;

    console.log("Width:", width);
    console.log("Height:", height);
    console.log("Margin:", margin);

    let svg = d3.select("#viewport").append("svg")
        .attr("width", width)
        .attr("height", height);

    let simulation = d3.forceSimulation(swfull.nodes)
    .force("charge", d3.forceManyBody().strength(-30))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("link", d3.forceLink().links(swfull.links))
    .force("collision", d3.forceCollide().radius(5))
    .on("tick", tick);
    
});

document.addEventListener("keydown", function(event) {
    //reload the page spacebar is pressed 
    if (event.keyCode === 32) window.location.reload();
});

function updateNodes(){
    // alla selections fungerar likadant dvs de väljer alla noder och går in i datan och skapar cirklar för varje nod om den inte redan finns
    let selection = d3.select("svg")
    .selectAll("circle")
    .data(swfull.nodes)
    .join("circle")  // Changed .enter().append to .join for better practice
    .attr("r", 5)
    .attr("fill", "yellow")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
}

function updateLinks(){
    let selection = d3.select("svg")
    .selectAll("line")
    .data(swfull.links)
    .join("line") // Changed from .enter().append to .join for better practice
    .attr("stroke", "white")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })
    .attr("stroke-width", 0.2);
}
    
function tick() {
    updateNodes();
    updateLinks();
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









