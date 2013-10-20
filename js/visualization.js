$(document).ready(function() {

var width = 500,
    height = 500,
    centered;

var packer = sm.packer();

projection = d3.geo.albersUsa()
  .scale(160000)
  .translate([-41630, 4900]);

var path = d3.geo.path().projection(projection)

svg = d3.select("#content")
  .append("svg:svg")
  .attr("width", width)
  .attr("height", height)

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");

d3.json("data/neighborhood_boundaries.json", function(error, dc) {
  g.append("g")
      .attr("id", "neighborhoods")
    .selectAll("path")
      .data(dc.features)
    .enter().append("path")
      .attr("d", path)
      .on("click", clicked);
  g.append("path")
      .datum(topojson.mesh(dc, dc.features, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);
});

d3.csv('data/schools.csv', function(data){
  var scale = d3.scale.sqrt().range([1,10])
  svg.selectAll("circle")
    .data(data).enter().append("circle")
      .attr("r", 4)
      .attr("fill-opacity", 0.5)
      .attr("fill", "#FF0000")
      .attr("transform", function(d) {
        return "translate(" + 
          projection([d.long, d.lat]) +
          ")";});
	packMetros();
  d3.select("#school_enrollment").on("click", function() {changeSchoolData("enrollment")});
  d3.select("#school_allocation").on("click", function() {changeSchoolData("alloc")});
  d3.select("#school_location").on("click", noSchoolData);
  function noSchoolData() {
    svg.selectAll("circle")
      .transition().duration(600)
      .attr("r", 4)
  }
  function changeSchoolData(new_data_column) {
    matchScaleToData(scale, function(d){return +d[new_data_column];})
    svg.selectAll("circle")
      .transition().duration(600)
      .attr("r", function(d) {return scale(d[new_data_column])})
  }
  function matchScaleToData(scale, fieldFunction) {
    var minimum = d3.min(data, fieldFunction),
        maximum = d3.max(data, fieldFunction);
    scale.domain([minimum, maximum]);
  }
});

function packMetros() {
	var elements = d3.selectAll('#content circle')[0];
	packer.elements(elements).start();
}

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

}); // end document ready function
