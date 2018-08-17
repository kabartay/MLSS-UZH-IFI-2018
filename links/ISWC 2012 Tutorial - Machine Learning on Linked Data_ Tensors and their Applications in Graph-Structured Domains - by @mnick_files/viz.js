/* vim: set foldmethod=marker */
(function () {
	var data = {
		nodes: [{name:'Al', group:1}, {name:'Bill', group:2}, {name:'John', group:3}],
		links: [
			{source: 0, target: 2, value:1},
			{source: 0, target: 1, value:1},
			{source: 1, target: 0, value:1},
			{source: 2, target: 1, value:1}
		]
	}

	matrix('#matrix-graph-example', data, 250, 250, {top:50, right:0, bottom:0, left:50});
})();

/* {{{ Matrix Multigraph Example */
(function () {
	var sz = 200;
	var margins = {top:5, right:5, bottom:5, left:5};
	var nodes = [
		{name:'E1', group:3}, 
		{name:'E2', group:3}, 
		{name:'E3', group:3}
	];
	var links = [
		[{source: 0, target: 1, value:1}, {source: 1, target: 2, value:1}],
		[{source: 1, target: 1, value:1}, {source: 2, target: 2, value:1}, {source: 1, target: 0, value: 1}],
		[{source: 2, target: 0, value:1}, {source: 2, target: 1, value:1}, {source: 0, target: 2, value: 1}]
	];
	matrix('#matrix-multigraph > .m1', {nodes: nodes, links: links[0]}, sz, sz, margins);
	matrix('#matrix-multigraph > .m2', {nodes: nodes, links: links[1]}, sz, sz, margins);
	matrix('#matrix-multigraph > .m3', {nodes: nodes, links: links[2]}, sz, sz, margins);
})();
/* }}} */

/* {{{  ML Examples */
(function() {
	var klasses = {"?": 'unknown'}
	var links1 = [
		{source: "Bill Clinton", target: "Bill", type: "firstName"},
		{source: "Al Gore", target: "Al", type: "firstName"}
	];

	var links2 = [
		{source: "Bill Clinton", target: "Al Gore", type: "presidentOf"},
		{source: "Bill Clinton", target: "Democratic Party", type: "partyOf"},
		{source: "Al Gore", target: "Republican Party", type: "partyOfUnknown"},
		{source: "Al Gore", target: "Democratic Party", type: "partyOfUnknown"},
	];

	directedGraph('#mlexample1', links1, ["marriedTo", "firstName", "knows"], 400, 250, 80, -1000, klasses, false, 20);
	directedGraph('#mlexample2', $.extend(true, [], links2), ["presidentOf", "partyOf", "partyOfUnknown"], 400, 250, 80, -1000, klasses, false, 20);
	directedGraph('#chart-lp-al', $.extend(true, [], links2), ["presidentOf", "partyOf", "partyOfUnknown"], 300, 300, 80, -1000, klasses, false, 20);
})();
/* }}} */


/* --- Graph Example --------------------------------------------- */
(function () {
	var predicates = ['r1', 'r2'];
	var links = [
		{source: 'e1', target: 'e2', type: 'r1', label:'l1'},
		{source: 'e1', target: 'e3', type: 'r1', label:'l2'},
		{source: 'e2', target: 'e3', type: 'r2', label:'l3'}
	];
	directedGraph('#graphexample', links, predicates, 400, 200, 150, -1000, {}, false, 25, true)
})();


/* --- MultiGraph Example ------------------------------------------*/
(function() {
	var bend = {'presidentOf': 1, 'partyOf': 1, 'vicePresidentOf': 1, 'knows': 0.1};
	var links = [
		{source: "Bill Clinton", target: "Al Gore", type: "presidentOf"},
		{source: "Bill Clinton", target: "Al Gore", type: "knows"},
		{source: "Bill Clinton", target: "Democratic Party", type: "partyOf"},
		{source: "Al Gore", target: "Democratic Party", type: "partyOf"},
		{source: "Al Gore", target: "Bill Clinton", type: "vicePresidentOf"},
		{source: "Al Gore", target: "Bill Clinton", type: "knows"}
	];

	directedGraph('#multigraphexample', $.extend(true, [], links), ['presidentOf', 'partyOf', 'vicePresidentOf', 'knows'], 400, 300, 150, -1000, {}, bend, 25, false)

	var linktypes = ['presidentOf', 'partyOf', 'vicePresidentOf'];
	links = $.extend(true, [], links).filter(function(x) {return $.inArray(x.type, linktypes) != -1;});
	directedGraph('#tensor-rep-example', $.extend(true, [], links), linktypes, 400, 300, 150, -1000, {}, bend, 25, false)
})();

/* {{{ The Beatles Soap Opera */
(function() {
	var bend = {'likes': 1, 'dislikes': 1, "doesntlike": 0.1};
	var subgraphs = ['likes', 'dislikes', 'doesntlike'];

	d3.json('resources/beatles-soap-opera.json', function(json) {
		// draw directed graph in intro
		var data = json.likes.concat(json.dislikes).concat(json.doesntlike);
		data = $.extend(true, [], data);
		directedGraph('#beatles-soap', data, ["likes", "dislikes", "doesntlike"], 900, 450, 200, -1000, {}, bend, 25, true);

		// draw subgraphs in hits application
		for (s in subgraphs) {
			var subgraph = subgraphs[s];
			directedGraph('#beatles-hits-' + subgraph + '-graph', $.extend(true, [], json[subgraph]), [subgraph], 250, 250, 50, -1000, {}, null, 15, true);
		} 	
	});

	d3.json('resources/results-hits-beatles.json', function(json) {
		for (s in subgraphs) {
			var subgraph = subgraphs[s];
			var data = $.extend(true, [], json);
			sunburst("#beatles-hits-" + subgraph, data, 200, 200, ['count', subgraph]);
		}
	});


	d3.json('resources/cp-beatles-soap.json', function(data) {
		hierarchicalCluster("#chart-mobile-tophits", data, ['root', 'factor', 'hubs', 'auths', 'topics'], 200, 600, 900, "score", colorbrewer.Blues[3]);
	});
})();
/* }}} */


/* --- TripleRank ------------------------------------------------------ */
(function () {
	d3.json('resources/results-triplerank-beatles.json', function(data) {
		hierarchicalCluster("#chart-beatles-sunburst", data, ['root', 'factor', 'predicates', 'resources'], 200, 600, 900, "score", colorbrewer.Blues[3]);
	});
})();

/* --- Collective Learning ------------------------------------------------ */
(function() {
	var klasses = {"?": 'unknown'}

	var links = [
		{source: "Bill Clinton", target: "Al Gore", type: "presidentOf"},
		{source: "Bill Clinton", target: "Democratic Party", type: "partyOf"},
		{source: "Al Gore", target: "Democratic Party", type: "unknown"},
		{source: "John F. Kennedy", target: "Lyndon B. Johnson", type: "presidentOf"},
		{source: "John F. Kennedy", target: "Democratic Party", type: "partyOf"},
		{source: "Lyndon B. Johnson", target: "Democratic Party", type: "partyOf"},
		
		{source: "Dwight Eisenhower", target: "Richard Nixon", type: "presidentOf"},
		{source: "Dwight Eisenhower", target: "Republican Party", type: "partyOf"},
		{source: "Richard Nixon", target: "Republican Party", type: "partyOf"},
		{source: "Ronald Reagan", target: "George Bush", type: "presidentOf"},
		{source: "Ronald Reagan", target: "Republican Party", type: "partyOf"},
		{source: "George Bush", target: "Republican Party", type: "partyOf"},
	];

	directedGraph('#collective-learning-example', links, ["presidentOf", "partyOf"], 900, 300, 100, -1000, klasses, false, 20);
})();

(function () {
	var data = {
		labels: [
			{name: 'Progressive 1948', color: 'yellow'}, 
			{name: 'Whig', color: '#FF7F00'},
			{name: 'Progressive 1912', color: 'orangered'},
			{name: 'Democratic', color: '#377EB8'}, 
			{name: 'Union', color: 'yellow'},
			{name: 'Democratic-Republican', color: '#F781BF'}, 
			{name: 'Republican', color: 'red'},
			{name: 'Farmer', color: '#984EA3'}, 
			{name: 'Anti-Masonic', color: '#4DAF4A'}, 
			{name: 'Fed', color: 'turquoise'}
		],

		network: [
			[0, 0, 0, 1, 0, 0, 0, 0, 0, 0], 	// Prog'48
			[0, 1, 0, 0, 1, 1, 0, 0, 1, 0],		// Whig
			[0, 0, 0, 0, 0, 0, 1, 0, 0, 0], 	// Prog'12
			[1, 0, 0, 8, 0, 0, 1, 1, 0, 0],		// Dem
			[0, 1, 0, 0, 0, 0, 0, 0, 0, 0], 	// Union
			[0, 1, 0, 0, 0, 4, 0, 0, 0, 0],		// Dem-Rep
			[0, 0, 1, 1, 0, 0, 13, 0, 0, 1],	// Rep
			[0, 0, 0, 1, 0, 0, 0, 0, 0, 0], 	// Farmer
			[0, 1, 0, 0, 0, 0, 0, 0, 0, 0], 	// AMP
			[0, 0, 0, 0, 0, 0, 1, 0, 0, 0],		// Fed
		]
	};
	chordplot("#chart-presidents", data, 400, 400)
})();

(function () {
	var data = {
		'presidents': 250,
		'kinships': 250,
		'umls': 250, 
		'nations': 250,
		'cora-author': 170, 
		'cora-citation': 170, 
		'cora-venue': 170
	};
	for (i in data) {
		(function() {
			var z = i;
			var w = data[z];
			d3.csv('resources/results-' + z + '.csv', function(js) {
				barchart("#chart-" + z + "-bar", js, w, 200, 30, 70, 20);
			});
		})();
	}
})();


/*(function sigmaCora() {
	var sigInst = sigma.init(document.getElementById('cora-plot'))
		.drawingProperties({
    		defaultLabelColor: '#fff',
    		defaultLabelSize: 14,
    		defaultLabelBGColor: '#fff',
    		defaultLabelHoverColor: '#000',
   			 defaultEdgeType: 'curve'
  }).graphProperties({
    minNodeSize: 0.5,
    maxNodeSize: 5,
    minEdgeSize: 1,
    maxEdgeSize: 1
  }).mouseProperties({
    maxRatio: 32
  });

  // Parse a GEXF encoded file to fill the graph
  // (requires "sigma.parseGexf.js" to be included)
  sigInst.parseGexf('resources/arctic.gexf');
 
  // Draw the graph :
  sigInst.draw();

})();*/

(function () {
	d3.json('resources/iimb_clustering.json', function(json) {
		hierarchicalCluster("#chart-iimb-cluster", json.data, json.klasses, 400, 600, 900, "score", colorbrewer.Greys[6]);
	});
})();

(function () {
	function addGraph(elem, data, color) {
		//areachart('#chart-scale-' + chart, data, 300, 200, 'seconds');
		for (e in data) {
			data[e].x = parseFloat(data[e].x);
			data[e].y = parseFloat(data[e].y);
		}
		nv.addGraph(function() {
			var nvchart = nv.models.lineChart();
  			nvchart.yAxis
				.axisLabel('Time (s)')
        		.tickFormat(d3.format(',r'));
  
    		nvchart.xAxis
       			.tickFormat(d3.format('.1e'));
 
   			d3.select('#chart-scale-' + elem + ' svg')
       			.datum([{'values': data, 'key': elem, 'color': color}])
       			.call(nvchart);

  			nv.utils.windowResize(elem.update);
			return nvchart;
		});
	}

	var charts = {
		'entities': ['N', 'deepskyblue'],
		'predicates': ['K', 'greenyellow'],
		'facts': ['NNZ', 'orangered'],
		'rank': ['rank', 'gold']
	};
	for (chart in charts) {
		//var chart = 'entities';
		(function() {
			var z = chart;
			d3.csv('resources/runtime-' + charts[z][0] + '.csv', function(data) {
				addGraph(z, data, charts[z][1]);
			});
		})();
	}
})();

(function () {
	var c = d3.scale.category20();
	var data = {
		labels: [
			{name: 'Legal', color:'deepskyblue'},
			{name: 'Goverment & Regulatory Affairs', color:'gold'},
			{name: 'Trade Executive', color:'greenyellow'},
			{name: 'Pipeline Employee', color:'violet'}
		],
		network: [
			[440.2, 1.6, -15.0, 0.4],
			[1.6, 278.3, 135.4, 1.6],
			[-29.3, 70.7, 201.6, -6.2],
			[1.4, -4.6, -7.5, 172.3]
		]
	}
	chordplot("#chart-enron-patterns", data, 400, 400)

	d3.csv('resources/results-enron-1st2nd.csv', function(data) {
		barchart("#chart-enron-match", data, 250, 300, 30, 70, 20);
	});
})(); 

(function () {
	var keys = ['Legal', 'Goverment & Regulatory Affairs', 'Trade Executive', 'Pipeline Employee'];
	d3.json('resources/enron.json', function(json) {
		var color = d3.scale.category10();
		var ser = []
		for(k in keys) {
			var cur = {};
			cur['data'] = json['time'][keys[k]];
			cur['color'] = color(k);
			cur['name'] = keys[k];
			ser.push(cur);
		}

		var graph = new Rickshaw.Graph( {
			element: document.querySelector("#chart-enron-time"),
			width: 900,
			height: 400,
			renderer: 'line',
			stroke: true,
			series: ser
		} );

		graph.render();
		
		var xAxis = new Rickshaw.Graph.Axis.Time({
    		graph: graph
		});
		xAxis.render();

		var legend = new Rickshaw.Graph.Legend( {
			graph: graph,
			element: document.getElementById('legend-enron-time')
		} );

		var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
			graph: graph,
			legend: legend
		} );

		var order = new Rickshaw.Graph.Behavior.Series.Order( {
			graph: graph,
			legend: legend
		} );

		var highlight = new Rickshaw.Graph.Behavior.Series.Highlight( {
			graph: graph,
			legend: legend
		} );

		var annotator = new Rickshaw.Graph.Annotate({
    		graph: graph,
    		element: document.getElementById('timeline-enron-time')
		});
		annotator.add(1001887200, "SEC Investigaton");
		$("#legend-enron-time > ul > .line > a")[0].click();
		$("#legend-enron-time > ul > .line > a")[0].click();
	})
})();

