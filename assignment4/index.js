var swep1, swep2, swep3, swep4, swep5, swep6, swep7, swfull;
var selectedData; //used to store the selected data
var width, height;
var showFiltredNodes = false;

// Load the JSON files
document.addEventListener("DOMContentLoaded", async function () {
  await loadJSON();
  if (selectedData == null) {
    selectedData = swfull;
    d3Setup(selectedData);
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
    d3Setup(selectedData);
    setSlider();
  });
  setSlider();
});

// initialize the slider with the min and max values of the data
function setSlider(){
  let max = d3.max(selectedData.links, (d) => d.value);
  let min = d3.min(selectedData.links, (d) => d.value);

  d3.select("#weightSlider")
  .attr("max", max)
  .attr("min", min)
  .attr("value", min);
  d3.select("#weightLabel").text(min);
}

//checkbox to show filtered nodes
function displayFilteredNodes(){
  showFiltredNodes = !showFiltredNodes;
  updateWeight();
}

//Event listner for the slider
function updateWeight(){
  d3.select("#weightLabel").text(d3.select("#weightSlider").node().value);

  let filteredLinks = selectedData.links.filter((d) => d.value >= d3.select("#weightSlider").node().value);

  clearGraph();
  
  if(showFiltredNodes){
    d3Setup({ nodes: selectedData.nodes, links: filteredLinks });
  } else {
    let filteredNodes = selectedData.nodes.filter((d) => filteredLinks.some((link) => link.source.index === d.index || link.target.index === d.index));
    d3Setup({ nodes: filteredNodes, links: filteredLinks });
  }
  
}

//removes all the current svg elements
function clearGraph() {
  d3.selectAll("svg").remove();
}

// Setup the d3 diagram
function d3Setup(data) {
  d3.select("svg").remove();
  width = d3.select("#viewport").node().getBoundingClientRect().width;
  height = d3.select("#viewport").node().getBoundingClientRect().height;
  let margin = 20;

  const svgHeight = height / 2;
  const svgWidth = width / 2;

    let zoom = d3.zoom()
      .scaleExtent([.5, 5])
      .translateExtent([[0, 0], [svgWidth + 50, height + 50]])
      .on("zoom", handleZoom);

    function handleZoom(event) {
      svg1.selectAll('g')
        .attr("transform", event.transform);
    }

    function initZoom(){
      svg1
        .call(zoom);
    }
    

  const svg1 = d3
    .select("#diagram1")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", height);

  const svg2 = d3
    .select("#diagram2")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", height);

  createDiagram(svg1, data);
  createDiagram(svg2, data);

  initZoom();
}

// Create the diagram
function createDiagram(svg, data) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const simulation = d3
    .forceSimulation(data.nodes)
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 4, height / 2))
    .force("link", d3.forceLink().links(data.links).distance(50))
    .force(
      "collision",
      d3.forceCollide().radius((d) => calcNodeRadius(d))
    );

  //strecken mellan noderna
  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .join("line")
    .attr("stroke", "grey")
    .attr("stroke-width", 0.5)
    .attr("opacity", 0.5)
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
        console.log(d)

        highlightLink(d);
        showLinkDetails(d);
      })
      .on("mouseover", function (event, d) {
        
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(d.source.name + "<br/>" + d.target.name + "<br/>" + d.value)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0);
      })

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("r", function (d) {
      return calcNodeRadius(d);
    })
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
      console.log(d)
      highlightNode(d.index);
      showNodeDetails(d);
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

  simulation.nodes(data.nodes).on("tick", ticked);

  simulation.force("link").links(data.links);

  //update function for the nodes and links
  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    //keep nodes within the svg
    node
      .attr("cx", (d) => d.x < ((width * 2) - 10) ? d.x : ((width * 2) - 10))
      .attr("cy", (d) => d.y < (height * 2 - 10) ? d.y : (height * 2 - 10));
  }

  function highlightNode(id) {

    // Highlight relevant node
    d3.selectAll("svg")
      .selectAll("circle")
      .filter((d) => d.index === id)
      .attr("fill", "red");

    // Resent remaining nodes
    d3.selectAll("svg")
      .selectAll("circle")
      .filter((d) => d.index !== id)
      .attr("fill", function (d) {
        // If colour is gray make it slighlty more white to make it easier to make it out from the background
        if (d.colour == "#808080") {d.colour = "#cccccc";}
        return d.colour;
      });

      // Resent possibly highlighted links
      d3.selectAll("svg")
          .selectAll("line")
          .attr("stroke", "grey")
          .attr("stroke-width", 0.5)
  }

  function highlightLink(d) {
    let  sourceId = d.source.index;
    let targetId = d.target.index;
    let linkId = d.index;

    // Highlight relevant nodes
    d3.selectAll("svg")
      .selectAll("circle")
      .filter(function(d){
        if(d.index === sourceId || d.index === targetId){return d;}
      })
      .attr("fill", "red");
    
    // Reset remaining nodes
    d3.selectAll("svg")
      .selectAll("circle")
      .filter(function(d){
        if(d.index !== sourceId && d.index !== targetId){return d;}
      })
      .attr("fill", function (d) {
        // If colour is gray make it slighlty more white to make it easier to make it out from the background
        if (d.colour == "#808080") {
          d.colour = "#cccccc";
        }
        return d.colour;
      });

      // Highlight Links
      d3.selectAll("svg")
          .selectAll("line")
          .filter((d) => d.index ===  linkId)
          .attr("stroke", "red")
          .attr("stroke-width", 1.0)

      // Resent remaining Links
      d3.selectAll("svg")
          .selectAll("line")
          .filter((d) => d.index !==  linkId)
          .attr("stroke", "grey")
          .attr("stroke-width", 0.5)
  }

  //show the details of clicked node
  function showNodeDetails(node) {

    // Remove existing details
    const controlPanel = d3.select("#controlPanel");
    controlPanel.selectAll(".details").remove(); 

    controlPanel.append("div").attr("class", "details").html(`
        <p style="margin: 0 0 3px 0">Character Node</p>
        <h2 style="margin: 0">${node.name}</h2>
        <p style="margin: 3px 0 0 0">Scenes appeared in: ${node.value}</p>
      `);
  }

  //show the details of clicked link
  function showLinkDetails(link) {

    // Remove existing details
    const controlPanel = d3.select("#controlPanel");
    controlPanel.selectAll(".details").remove(); 

    controlPanel.append("div").attr("class", "details").html(`
        <p style="margin: 0 0 3px 0";>Character Link</p>
        <h2 style="margin: 0">${link.source.name}</h2>
        <h3 style="margin: 0">&</h3>
        <h2 style="margin: 0">${link.target.name}</h2>
        <p style="margin: 3px 0 0 0">Scenes appeared in together: ${link.value}</p>
      `);
  }


}

// scales the node to a radius between selected values depending on the value of the node
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

// Promise to load the JSON files
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
