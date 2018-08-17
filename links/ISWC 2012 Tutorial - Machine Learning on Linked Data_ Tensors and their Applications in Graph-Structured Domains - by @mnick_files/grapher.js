function appendDropshadow(defs, filterID) {
	var ds = defs.append("filter")
		.attr("id", filterID);
	ds.append("feGaussianBlur")
		.attr("in", "SourceAlpha")
		.attr("stdDeviation", "3");
	ds.append("feOffset")
		.attr("dx", "-2")
		.attr("dy", "2")
		.attr("result", "offsetblur")
	ds = ds.append("feMerge");
	ds.append("feMergeNode");
	ds.append("feMergeNode")
		.attr("in", "SourceGraphic");

}
function directedGraph(elem, links, linktypes, w, h, linkDistance, charge, klasses, bend, radius, labelPaths) {
	var nodes = {};

	// Compute the distinct nodes from the links.
	links.forEach(function(link) {
			link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
			link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
	});

	var force = d3.layout.force()
		.nodes(d3.values(nodes))
		.links(links)
		.size([w, h])
		.linkDistance(linkDistance)
		.charge(charge)
		.on("tick", tick);

	var svg = d3.select(elem).append("svg:svg")
		.attr("class", "directedGraph")
		.attr("width", w)
		.attr("height", h);

	d3.select(elem).attr("class", "force-graph")
		.on("click", function() {
			force.start();
		});

	// Per-type markers, as they don't inherit styles.
	var defs = svg.append("svg:defs");
	defs.selectAll("marker")
		.data(linktypes)
		.enter().append("svg:marker")
		.attr("id", String)
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", function(t) {return bend ? radius + 2 : radius + 5;})
		.attr("refY", function(t) {return bend ? -3 : 0;})
		.attr("markerWidth", 9)
		.attr("markerHeight", 9)
		.attr("orient", "auto")
		.append("svg:path")
		.attr("d", "M0,-5L10,0L0,5");

	var path = svg.append("svg:g").selectAll("path")
		.data(force.links())
		.enter().append("svg:path")
		.attr("class", function(d) { return "link " + d.type; })
		.attr("id", function(d) {
			return "link-" + d.type + "-s-" + d.source.name + "-d-" + d.target.name;
		})
		.attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

	var path_text = svg.append("svg:g").selectAll("g")
		.data(force.links())
		.enter().append("svg:g");

	path_text.append("svg:text")
		.attr('class', 'linktext')
		.attr("x", 2)
		.attr("y", ".31em")
		.text(function(d) {return d.type});

	if (labelPaths) {
		var path_label = svg.append("svg:g").selectAll("g")
			.data(force.links())
			.enter().append("svg:g");

		path_label.append("rect")
			.attr("class", "linklabel")
			.attr("orient", "auto")
			.attr("width", "1em")
			.attr("height", "1em")
			.attr("x", "-.5em")
			.attr("y", "-.5em");
		path_label.append("svg:text")
			.attr('class', 'linklabel')
			.attr("x", "-.4em")
			.attr("y", ".4em")
			.text(function(d) {return d.label;});
	}

	var circle = svg.append("svg:g").selectAll("circle")
		.data(force.nodes())
		.enter().append("svg:circle")
		.attr("class", function(d) {return "force " + klasses[d.name];})
		.attr("id", function(d) {return elem.substring(1) + d.name;})
		.attr("r", radius)
		.attr("pointer-events", "all")
		.on('mouseover', activate)
		.on('mouseout', deactivate)
		.call(force.drag);

	var text = svg.append("svg:g").selectAll("g")
		.data(force.nodes())
		.enter().append("svg:g");

	text.append("svg:text")
		.attr("x", radius + 3)
		.attr("y", ".31em")
		.text(function(d) { return d.name; });

	function tick() {
		if (bend) {
			// Use elliptical arc path segments to doubly-encode directionality.
			path.attr("d", function(d) {
				var dx = d.target.x - d.source.x,
					dy = d.target.y - d.source.y,
					dr = bend[d.type] * Math.sqrt(dx * dx + dy * dy);
				return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
			});
		} else {
			path.attr("d", function(d) {
				return "M" + d.source.x + "," + d.source.y + " L" + d.target.x + "," + d.target.y;
			});
		}

		circle.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

		text.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

		path_text.attr("transform", function(d) {
			return "translate(" + (d.target.x - 0.5 * (d.target.x - d.source.x)) + "," + (d.target.y - 0.5 * (d.target.y - d.source.y)) + ")";
		});

		if (labelPaths) {
			path_label.attr("transform", function(d) {
				return "translate(" + (d.target.x - 0.5 * (d.target.x - d.source.x)) + "," + (d.target.y - 0.5 * (d.target.y - d.source.y)) + ")";
			});
		}
	}

	function activate(d) {
		path.style('opacity', 0.1);
		circle.style('opacity', 0.1);
		path.filter(function(p) {
			return (p.target === d || p.source === d);
		}).style('opacity', 1).each(function (p) {
			d3.select(circle[0][p.target.index]).style('opacity', 1);
			d3.select(circle[0][p.source.index]).style('opacity', 1);
		});
	}

	function deactivate(d) {
		path.style('opacity', 1);
		circle.style('opacity', 1);
	}
}

function sunburst(elem, data, width, height, attrs) {

	var radius = Math.min(width, height) / 2,
		color = d3.scale.category20c();

	var vis = d3.select(elem).append("svg")
		.attr("width", width + 100)
		.attr("height", height + 50)
		.append("g")
		.attr("transform", "translate(" + (width + 100) / 2 + "," + (height + 50) / 2 + ")");

	data.attrIndex = 0;
	var partition = d3.layout.partition()
		.sort(null)
		.size([2 * Math.PI, radius * radius])
		.value(function(d) { 
			if (attrs[0] == "count") {
				return 1; 
			} else {
				return d[attrs[0]];
			}
		});

	var arc = d3.svg.arc()
		.startAngle(function(d) { return d.x; })
		.endAngle(function(d) { return d.x + d.dx; })
		.innerRadius(function(d) { return Math.sqrt(d.y); })
		.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

	var path = vis.data([data]).selectAll("path")
		.data(partition.nodes)
		.enter().append("path")
		.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
		.attr("d", arc)
		.attr("id", function(d, i) {return "group" + i + attrs[1];})
		.attr("fill-rule", "evenodd")
		.style("stroke", "#fff")
		.style("fill", function(d) { return color(d.name); })
		.each(stash);

	// Add a text label.
	var nodes = partition.nodes({children: data.children});
	var groupText = vis.selectAll("text").data(nodes).enter().append("text")
		.attr("x", 10)
		.attr("dy", -10);

	groupText.append("textPath")
		.attr("xlink:href", function(d, i) { return "#group" + i + attrs[1]; })
		.text(function(d, i) { return d.name; });
	filterText();

	d3.select(elem).on("click", function() {
		data.attrIndex = data.attrIndex + 1;
		path.data(partition.value(function(d) { 
			return d[attrs[data.attrIndex]]; 
		}))
		.transition()
		.duration(2000)
		.attrTween("d", arcTween);
		filterText();
	});

	// Remove the labels that don't fit. :(
	function filterText() {
		groupText.filter(function(d, i) { 
			return d[attrs[data.attrIndex]] == 0 
		}).remove();
	}

	// Stash the old values for transition.
	function stash(d) {
		d.x0 = d.x;
		d.dx0 = d.dx;
	}

	// Interpolate the arcs in data space.	
	function arcTween(a) {
		var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
		return function(t) {
			var b = i(t);
			a.x0 = b.x;
			a.dx0 = b.dx;
			return arc(b);
		};
	}
}

function matrix(elem, data, width, height, margin) {

	var x = d3.scale.ordinal().rangeBands([0, width]);

	var svg = d3.select(elem).append("svg:svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("margin-left", -margin.left + "px")
		.attr("class", "matrix");
	
	var defs = svg.append("svg:defs");
	appendDropshadow(defs, 'dropshadow');
	
	svg = svg.append("svg:g")
		.attr("class", "matrix-group")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var matrix = [],
		nodes = data.nodes,
		n = nodes.length;

	// Compute index per node.
	nodes.forEach(function(node, i) {
		node.index = i;
		node.count = 0;
		matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 'val'}; });
	});

	// Convert links to matrix; count character occurrences.
	data.links.forEach(function(link) {
		matrix[link.source][link.target].z += link.value;
		nodes[link.source].count += link.value;
		nodes[link.target].count += link.value;
	});

	// Precompute the orders.
	var orders = {
		name: d3.range(n).sort(function(a, b) { return d3.descending(nodes[a].name, nodes[b].name); }),
		count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
		group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
	};

	// The default sort order.
	x.domain(orders.name);

	svg.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height);
	
	var row = svg.selectAll(".row")
		.data(matrix)
		.enter().append("g")
		.attr("class", function (d, i) {return "row row-" + i;})
		.attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; });

	row.append("line")
		.attr("x2", width);

	row.append("text")
		.attr("x", -6)
		.attr("y", x.rangeBand() / 2)
		.attr("dy", ".32em")
		.attr("text-anchor", "end")
		.text(function(d, i) { return nodes[i].name; });

	var column = svg.selectAll(".column")
		.data(matrix)
		.enter().append("g")
		.attr("class", function (d, i) {return "column column-" + i;})
		.attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

	column.append("line")
		.attr("x1", -width);

	column.append("text")
		.attr("x", 6)
		.attr("y", x.rangeBand() / 2)
		.attr("dy", ".32em")
		.attr("text-anchor", "start")
		.text(function(d, i) { return nodes[i].name; });
	
	row.each(cell)

	function cell(row) {
		var cell = d3.select(this).selectAll(".cell")
			.data(row.filter(function(d) { return d.z; }))
			.enter().append("rect")
			.attr("class", function(d) {
				return "cell column-" + d.x + " row-" + d.y + " " + d.z;
			})
			.attr("x", function(d) {return x(d.x) + 2;})
			.attr("y", 2)
			.attr("width", x.rangeBand() - 2)
			.attr("height", x.rangeBand() - 4)
	}
}

function barchart(elem, data, width, height, offw, offh, offt) {

	var names = [];
	data.forEach(function (d){ names.push(d.name)});

	var color = d3.scale.category20();

	var x = d3.scale.ordinal()
		.domain(names)
		.rangeBands([offw, width + offw]);

	var y = d3.scale.linear()
		.domain([0, 1])
		.range([0, height]);

	var chart = d3.select(elem).append("svg:svg")
		.attr("class", "barchart")
		.attr("width", width + offw)
		.attr("height", height + offh + offt);

	chart.selectAll("line")
		.data(y.ticks(10))
		.enter().append("line")
		.attr("x1", offw)
		.attr("x2", width + offw)
		.attr("y1", function(d) {return y(d) - .5 + offt;})
		.attr("y2", function(d) {return y(d) - .5 + offt;})

	chart.selectAll("rect")
		.data(data)
		.enter().append("rect")
		.attr("fill", function (d, i){ return color(i);})
		.attr("x", function(d, i) { return x(names[i]) - .5; })
		.attr("y", function(d) { return height - y(d.value) - .5 + offt; })
		.attr("width", x.rangeBand() - 5)
		.attr("height", function(d) { return y(d.value); });

	chart.selectAll("text")
		.data(data)
		.enter().append("text")
		.attr("x", function(d, i) { return x(names[i]) - .5; })
		.attr("y", function(d) {return height - y(d.value) - .5 + offt;})
		.attr("dy", "-.5em") // padding-right
		.attr("dx", "1em") // vertical-align: middle
		.attr("text-anchor", "middle") // text-align: right
		.text(function(d) {return d.value;});

	chart.selectAll(".rule")
		.data(y.ticks(10))
		.enter().append("text")
		.attr("class", "rule")
		.attr("y", function(d) {return y(d) + offt;})
		.attr("x", 0)
		.attr("dx", "1.5em")
		.attr("dy", ".25em")
		.attr("text-anchor", "end")
		.text(function(d) {return String(Math.round((1 - d) * 10) / 10); });

	chart.selectAll(".label")
		.data(data)
		.enter().append("text")
		.attr("class", "label")
		.attr("y", height + 25 + offt)
		.attr("x", function(d, i) { return x(names[i]); })
		.attr("dy", "1em") // padding-right
		.attr("dx", "1.5em") // vertical-align: middle
		.attr("text-anchor", "end") // text-align: right
		.attr("transform", function(d, i) {
			return "rotate(-45 " + x(names[i]) + " " + (height + 25) +")";
		})
	.text(function(d) {return d.name;});
}

function hierarchicalCluster(elem, data, klasses, radius, height, width, sizeAttr, cmap){
	var color = d3.scale.ordinal()
		.domain(klasses)
		.range(cmap);

	var tree = d3.layout.tree()
		.size([radius, radius])
		.separation(function(a, b) { return (a.parent == b.parent || a.parent.parent == b.parent.parent ? .7 : 3) });

	var diagonal = d3.svg.diagonal.radial()
		.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

	var vis = d3.select(elem).append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "hierclust")
		.attr("pointer-events", "all")
		.append("g")
			.call(d3.behavior.zoom().on("zoom", zoom))
		.append("g")
			.attr("transform", "translate(" + radius + "," + radius + ")");

	var nodes = tree.nodes(data);

	var link = vis.selectAll("path.link")
		.data(tree.links(nodes))
		.enter().append("path")
		.attr("class", "link")
		.attr("d", diagonal);

	var node = vis.selectAll("g.node")
		.data(nodes)
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

	node.append("circle")
		.attr("fill", function (d) {return color(d.klass);})
		.attr("r", function(d) {
			if(typeof sizeAttr == "undefined") {
				return 5;
			}
			//console.log([elem, d.name, d[sizeAttr] * 10])
			return d[sizeAttr] * 10;
		})

	node.append("text")
		.style("font-size", function(d) {
			if(typeof sizeAttr == "undefined") {
				return 5;
			}
			return .1 + d[sizeAttr] + "em";
		})
		.attr("dy", ".31em")
		.attr("text-anchor", "start")
		.attr("transform", "translate(8)")
		.text(function(d) { return d.name; });


	function zoom() {
		vis.attr("transform", "translate(" + (d3.event.translate[0] + radius) + "," + (d3.event.translate[1] + radius) + ")");
	}
}

function chordplot(elem, data, width, height) {
	var innerRadius = Math.min(width, height) * .41,
		outerRadius = innerRadius * 1.1;
	//outerRadius = Math.min(width, height) / 2 - 10,
	//innerRadius = outerRadius - 24;

	$(elem).attr("class", "chords");
	var formatPercent = d3.format(".1%");

	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	var layout = d3.layout.chord()
		.padding(.04)
		.sortSubgroups(d3.descending)
		.sortChords(d3.ascending);

	var path = d3.svg.chord()
		.radius(innerRadius);

	var svg = d3.select(elem).append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("class", "circle")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	svg.append("circle")
		.attr("r", outerRadius);

	// Compute the chord layout.
	layout.matrix(data.network);

	// Add a group per party
	var group = svg.selectAll(".group")
		.data(layout.groups)
		.enter().append("g")
		.attr("class", "group")
		.attr("id", function(d, i) {
			return "group" + data.labels[i].name.split(' ').join('');
		})
	.on("mouseover", mouseover);

	// Add a mouseover title.population
	group.append("title").text(function(d, i) {
		return data.labels[i].name + ": " + formatPercent(d.value) + " of origins";
	});

	// Add the group arc.
	var groupPath = group.append("path")
		.attr("id", function(d, i) { return "group" + elem + i; })
		.attr("d", arc)
		.style("fill", function(d, i) { return data.labels[i].color; });

	// Add a text label.
	var groupText = group.append("text")
		.attr("x", 6)
		.attr("dy", -10);

	groupText.append("textPath")
		.attr("xlink:href", function(d, i) { return "#group" + elem + i; })
		.text(function(d, i) { return data.labels[i].name; });

	// Remove the labels that don't fit. :(
	groupText.filter(function(d, i) { return sum(data.network[i]) < 2 })
		.attr("transform", function(d, i) {
			return "translate(" + groupPath[0][i] + "," + groupPath[0][i].y + ")rotate(45)";
		});

	// Add the chords.
	var chord = svg.selectAll(".chord")
		.data(layout.chords)
		.enter().append("path")
		.attr("class", "chord")
		.style("fill", function(d) { return data.labels[d.source.index].color; })
		.attr("d", path);

	// Add an elaborate mouseover title for each chod.
	chord.append("title").text(function(d) {
		return data.labels[d.source.index].name
		+ " → " + data.labels[d.target.index].name
		+ ": " + formatPercent(d.source.value / sum(data.network[d.source.index]))
		+ "\n" + data.labels[d.target.index].name
		+ " → " + data.labels[d.source.index].name
		+ ": " + formatPercent(d.target.value / sum(data.network[d.source.index]));
	});

	function mouseover(d, i) {
		chord.classed("fade", function(p) {
			return p.source.index != i
			&& p.target.index != i;
		});
	}

	function sum(arr) {
		var s = 0;
		for(var i = 0; i < arr.length; i++){
			s = s + arr[i];
		}
		s = s == 0 ? 1 : s;
		return s;
	}

	/** Returns an event handler for fading a given chord group. */
	function fade(opacity) {
		return function(g, i) {
			svg.selectAll("g.chord path")
				.filter(function(d) {
					return d.source.index != i && d.target.index != i;
				})
			.transition()
				.style("opacity", opacity);
		};
	}
}

function writeDownloadLink(elem, linkContainer){
    var html = d3.select(elem)
        //.attr("title", "test2")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    d3.select(linkContainer).append("div")
        .attr("id", "svg-download-" + elem)
        .style("top", event.clientY + 20 + "px")
        .style("left", event.clientX + "px")
        .html("Right-click on this preview and choose Save as<br />Left-Click to dismiss<br />")
        .append("img")
        .attr("src", "data:image/svg+xml;base64,"+ btoa(html));

    d3.select("#svg-download-" + elem)
        .on("click", function(){
            if(event.button == 0){
                d3.select(this).transition()
                    .style("opacity", 0)
                    .remove();
            }
        })
        .transition()
        .duration(500)
        .style("opacity", 1);
};

function areachart(elem, data, w, h, ylabel) {

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

var x = d3.scale.linear()
  	.domain([0, d3.max(data, function(d) {return parseFloat(d.x);})])
    .range([0, width]);

var y = d3.scale.linear()
  	.domain([0, d3.max(data, function(d) {return parseFloat(d.y);})])
    .range([height, 0]);

var area = d3.svg.area()
    .x(function(d) { return x(parseFloat(d.x)); })
    .y0(height)
    .y1(function(d) { return y(parseFloat(d.y)); });

var xAxis = d3.svg.axis()
    .scale(x)
	.tickFormat(d3.format('.1e'))
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// create left yAxis
var svg = d3.select(elem).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /*data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.close = +d.close;
  });*/

  svg.append("svg:path")
      .attr("class", "area")
      .attr("d", area(data));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(ylabel);
}
