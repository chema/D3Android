var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width = window.outerWidth - margin.left - margin.right,
    height = window.outerHeight - margin.top - margin.bottom;
    active = d3.select(null);

var projection = d3.geo.mercator()
    .center([-122.406968,37.776873])
    .scale(.60*(1 << 21) / 2 / Math.PI)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");
var SF = g.append("g");
var network = g.append("g");

d3.json("Elect_Supervisor_Dists_Topo.json", function(error, topology) {
	var districts = topojson.feature(topology, topology.objects.districts);

  SF.selectAll("path")
			.data(districts.features)
		.enter().append("path")
			.attr("d", path)
			.attr("class", "feature")
			.on("click", click);

  SF.append("path")
      .datum(topojson.mesh(topology, topology.objects.districts, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

	SF.selectAll(".district-label")
		.data(topojson.feature(topology, topology.objects.districts).features)
		.enter().append("text")
		.attr("class", function(d) { return "district-label " + d.id; })
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.text(function(d) { return d.properties.supdist; });

});

d3.json("doe-precincts-topo2.json", function(error, topology) {
var precincts = topojson.feature(topology, topology.objects.collection);

	network.selectAll("path")
			.data(precincts.features)
			.enter().append("path")
			.attr("d", path)
			.attr("class", "precincts")

	network.append("path")
       .datum(precincts.features)
       .attr("d", path);


//	network.selectAll(".precinct-label")
//		.data(topojson.feature(topology, topology.objects.collection).features)
//		.enter().append("text")
//		.attr("class", function(d) { return "district-label " + d.id; })
//		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
//		.attr("dy", ".35em")
//2		.text(function(d) { return d.properties.supdist; });

});

function click(d) {
  if (active === d) return reset();
  SF.selectAll(".active").classed("active", false);
  d3.select(this).classed("active", active = d);

  var b = path.bounds(d);
  g.transition().duration(1000).attr("transform",
      "translate(" + projection.translate() + ")"
      + "scale(" + .90 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
      + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
}

function reset() {
  SF.selectAll(".active").classed("active", active = false);
  g.transition().duration(1000).attr("transform", "");
}