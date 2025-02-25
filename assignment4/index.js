var swep1, swep2, swep3, swep4, swep5, swep6, swep7, swfull;
var selectedData; //used to store the selected data
var width, height;

//create commando to clear the graph


document.addEventListener("DOMContentLoaded", async function () {
  await loadJSON();
  if (selectedData == null) {
    selectedData = swfull;
    d3Setup();
  }

  const epSelect = document.querySelector("#ep-select");

  epSelect.addEventListener("change", function (event) {
    //console.log(event.target.value);
    switch (event.target.value) {
      case "swep1":
        selectedData = swep1;
        break;
      case "swep2":
        selectedData = swep2;
        break;
      case "swep3":
        selectedData = swep3;
        break;
      case "swep4":
        selectedData = swep4;
        break;
      case "swep5":
        selectedData = swep5;
        break;
      case "swep6":
        selectedData = swep6;
        break;
      case "swep7":
        selectedData = swep7;
        break;
      case "swfull":
        selectedData = swfull;
        break;
      default:
        break;
    }
    clearGraph();
    d3Setup();
  });

  //TODO: En instans till av Node-link med brushing and linking för jämförelse (punkt 2 och 4) Nästan klar måste bara highlighta noderna
  //TODO: Kontrollpanel på höger sida ska implementeras (punkt 3)
  //TODO: Details on demand (punkt 5) Gjort endast för noder svårt att kicka på linjer
  // kolla vidare i pdfen för mer

  //tick();
});

document.addEventListener("keydown", function (event) {
  //reload the page spacebar is pressed
  if (event.keyCode === 32) window.location.reload();
});

function clearGraph() {
  d3.selectAll("svg").remove();
}

function d3Setup() {
  d3.select("svg").remove();
  width = d3.select("#viewport").node().getBoundingClientRect().width;
  height = d3.select("#viewport").node().getBoundingClientRect().height;
  //height = 800;
  width = 800;
  let margin = 20;

  const svgHeight = height / 2;

  let scale = d3
    .scaleLinear()
    .domain([
      d3.min(selectedData.nodes, (d) => d.value),
      d3.max(selectedData.nodes, (d) => d.value),
    ])
    .range([margin, width - margin])
    .clamp(true);

  const svg1 = d3
    .select("#diagram1")
    .append("svg")
    .attr("width", width)
    .attr("height", svgHeight);

  const svg2 = d3
    .select("#diagram2")
    .append("svg")
    .attr("width", width)
    .attr("height", svgHeight);

  createDiagram(svg1);
  createDiagram(svg2);
}

function createDiagram(svg) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const simulation = d3
    .forceSimulation(selectedData.nodes)
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 4))
    .force("link", d3.forceLink().links(selectedData.links))
    .force(
      "collision",
      d3.forceCollide().radius((d) => calcNodeRadius(d))
    );

//strecken mellan noderna
  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(selectedData.links)
    .join("line")
    .attr("stroke", "white")
    .attr("stroke-width", 0.3)
    .attr("opacity", 0.7)
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    })
    .on("click", function (event, d) {
        console.log("Hello Everybody, it's me Markiplier");
        
      });

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(selectedData.nodes)
    .enter()
    .append("circle")
    .attr("r", function (d) {
      return calcNodeRadius(d);
    })
    .attr("fill", "blue")
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(d.name + "<br/>" + d.value)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("click", function (event, d) {
      d3.selectAll("circle").attr("fill", "blue");
      d3.select(d.id).attr("fill", "red");
      console.log(d);
      
      highlightNode(d.id);
      showDetails(d);
    })
    .attr("r", function (d) {
        return calcNodeRadius(d);
      })
      .attr("fill", function (d) {
        // If colour is gray make it slighlty more white to make it easier to make it out from the background
        if (d.colour == "#808080") {
          d.colour = "#cccccc";
        }
        return d.colour;
      });

  simulation.nodes(selectedData.nodes).on("tick", ticked);

  simulation.force("link").links(selectedData.links);

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    //keep nodes within the svg
    node
      .attr("cx", (d) => d.x < width ? d.x : width)
      .attr("cy", (d) => d.y < height / 2 ? d.y : height / 2);
  }

  //fungerar inte korrekt
  function highlightNode(id) {
    d3.selectAll("svg")
      .selectAll("circle")
      .filter((d) => d.id === id)
      .attr("fill", "red");
  }

  function showDetails(node) {
    //console.log(node);

    // Remove existing details
    const controlPanel = d3.select("#controlPanel");
    controlPanel.selectAll(".details").remove(); 

    controlPanel.append("div").attr("class", "details").html(`
        <h2>${node.name}</h2>
        <p>Value: ${node.value}</p>
      `);
  }
}

// scales the node to a radius between 5 and 10 depending on the value of the node
function calcNodeRadius(node) {
    let saturate = d3
    .scaleLinear()
    .domain([
      d3.min(selectedData.nodes, (d) => d.value),
      d3.max(selectedData.nodes, (d) => d.value),
    ])
    .range([5, 25])
    .clamp(true);  

  return saturate(node.value);
}

function updateNodes() {
  // alla selections fungerar likadant dvs de väljer alla noder och går in i datan och skapar cirklar för varje nod om den inte redan finns
  let selection = d3
    .select("svg")
    .selectAll("circle")
    .data(selectedData.nodes)
    .join("circle") // Changed .enter().append to .join for better practice
    .attr("r", function (d) {
      return calcNodeRadius(d);
    })
    .attr("fill", function (d) {
      // If colour is gray make it slighlty more white to make it easier to make it out from the background
      if (d.colour == "#808080") {
        d.colour = "#cccccc";
      }
      return d.colour;
    })

    .attr("cx", function (d) {
      return d.x < width ? d.x : width;
    })
    .attr("cy", function (d) {
      return d.y < height / 2 ? d.y : height / 2;
    });
}

function updateLinks() {
  let selection = d3
    .select("svg")
    .selectAll("line")
    .data(selectedData.links)
    .join("line")
    .attr("stroke", "white")
    .attr("stroke-width", 0.3)
    .attr("opacity", 0.7)
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    });
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
    "./data/starwars-full-interactions-allCharacters.json",
  ];

  try {
    const dataArray = await Promise.all(links.map((link) => d3.json(link)));
    [swep1, swep2, swep3, swep4, swep5, swep6, swep7, swfull] = dataArray;
  } catch (error) {
    console.error("Error loading JSON files:", error);
  }
}
