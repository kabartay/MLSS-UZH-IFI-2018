function doClick(selector) {
	selector = selector.split(',');
	for (s in selector) {
		$(selector[s]).click();
	}
}

function ldPrinciplesAnim() {
	$("#ld-principles > .fade").fadeTo(750, 0.2);
	$("#ld-principles .highlight").css("color", "greenyellow");
}

function selectPresidentsParty(partyName) {
	$("#group" + partyName).mouseover();
}

function slideReferences(refs) {
	$("#references").html(refs)
}

function graphexample(mode) {
	switch (mode) {
		case 'addRelation': $(".link.r2").show();
							break;
		case 'addRVs': $(".linklabel").show();
					   $(".linklabelshadow").show();
					   break;
	} 
}

function lvexample(step) {
	if (step == 1) {
		$(".lvexample").show();
	} else {
		//$(".lvexample").hide();
		$('#lvexample-latent').animate({'top': '103px', 'left': '240px'}, 1000);
		$('#lvexample-observed').animate({'top': '265px', 'left': '250px'}, 1000);
	}
}

function tophits(factor) {
	var svg = d3.select("#chart-mobile-tophits SVG > g")
		.transition()
		.duration(1000);
	switch (factor) {
		case "1": svg.attr("transform", "translate(-700, -100)scale(2)rotate(60, 250, 250)");
			break;
		case "2": svg.attr("transform", "translate(-570, -100)scale(2)rotate(0, 250, 250)");
			break;
		case "3": svg.attr("transform", "translate(-520, -100)scale(2)rotate(-60, 200, 200)");
			break;
		case "4": svg.attr("transform", "translate(-550, -100)scale(2)rotate(-100, 200, 200)");
			break;
	}
}

function tripleRank(factor) {
	var svg = d3.select("#chart-beatles-sunburst SVG > g")
		.transition()
		.duration(1000);
	switch (factor) {
		case "1": svg.attr("transform", "translate(-700, -450)scale(2.5)rotate(90, 250, 250)");
				  break;
		case "2": svg.attr("transform", "translate(-700, -450)scale(2.3)rotate(40, 250, 250)");
				  break;
		case "3": svg.attr("transform", "translate(-700, -450)scale(3.0)rotate(-40, 250, 250)");
				  break;
		case "4": svg.attr("transform", "translate(-700, -450)scale(2.5)rotate(-60, 250, 250)");
				  break;
		case "5": svg.attr("transform", "translate(-800, -550)scale(3.0)rotate(-100, 250, 250)");
				  break;
	}
}

function iimbTaxonomy(factor) {
	var svg = d3.select("#chart-iimb-cluster SVG > g")
		.transition()
		.duration(1500);
	switch (factor) {
		case "1": svg.attr("transform", "translate(1010, 100)scale(1.35)rotate(140, 50, 200)");
			break;
		case "2": svg.attr("transform", "translate(800, -100)scale(1.5)rotate(95, 0, 0)");
			break;
		case "3": svg.attr("transform", "translate(-100, -900)scale(3)rotate(65, 0, 100)");
			break;
	}
}

function modelDefinition(model) {
	var def = $("#" + model + "-definition");
	var viz = $("#" + model + "-viz");
	viz.height(def.height());
	$("#" + model + "-def-wrap").height(def.height());
	def.fadeOut(500);
	def.promise().done(function(){
		viz.fadeTo(500, 1);
	});
}

function multigraphMatrixAnim(step) {
	switch (step) {
		case '1':
			$(".math-plus").fadeTo(750, 1);
			$("#combination-projection").fadeIn(750);
			break;
		case '2':
			$("#combination-projection").hide();
			$(".math-plus").fadeTo(750, 0);
			$(".matrix").animate({"margin":"0, -1.75em"}, 750);
			$("#combination-append").fadeIn(750);
	}
}

function taxonomyAnim() {
	svgColorElement("#tax-svg", "#rescal_e2", 'orangered');
	svgColorElement("#tax-svg", "#rescal_e5", 'greenyellow');
	svgShowElement("#tax-svg", "#rescal_e2", null);
	svgShowElement("#tax-svg", "#rescal_e5", null);
}

function rescalAnim(step) {
	switch (step) {
		case '1':
			svgShowElement("#rescal-svg", ".rescal_entity", 1);
			break;
		case '2':
			svgShowElement("#rescal-svg", ".rescal_entity", 0);
			svgShowElement("#rescal-svg", ".rescal_lf", 1);
			break;
		case '3':
			svgShowElement("#rescal-svg", ".rescal_lf", 0);
			svgShowElement("#rescal-svg", ".rescal_predicate", 1);
			break;
		case '4':
			svgShowElement("#rescal-svg", ".rescal_lf", 0);
			svgColorElement("#rescal-svg", "#rescal_factor_A", 'greenyellow');
			svgColorElement("#rescal-svg", "#rescal_factor_At", 'greenyellow');
			break;
	}
}

function svgColorElement(doc, selector, fillcolor) {
	var svg = $(doc)[0].contentDocument;
	d3.select(svg)
		.selectAll(selector)
		.selectAll("path")
		.style("fill", fillcolor);
}

function svgShowElement(doc, selector, mode, duration) {
	if (typeof duration == 'undefined') {
		duration = 1000;
	}
	var svg = $(doc)[0].contentDocument;
	d3.select(svg)
		.selectAll(selector)
		.transition()
		.duration(duration)
		.style("opacity", mode);
}

function rescalLinkPrediction() {
	var colors = {
		'#rescal_Ai': 'deepskyblue',
		'#rescal_Aj': 'greenyellow',
		'#rescal_Rk': 'orangered'
	};
	for (var e in colors) {
		svgColorElement("#rescal-lp-svg", e, colors[e]);
		svgShowElement("#rescal-lp-svg", e, 1);
	}
}

function collectiveLearningAnim() {
	var svg = $("#plot-collective-cp")[0].contentDocument;
	//var elems = {'#attr_rescal_i': null, '#g_jk': -56};
	//for (elem in elems) {
	//	d3.select(svg)
//			.selectAll(elem)
			//.transition()
			//.duration(1500)
			//.attr('transform', 'translate(' + elems[elem] + ',0)');
	//}
	svgShowElement("#plot-collective-cp", "#attr_cp_i", 0, 1000);
	svgShowElement("#plot-collective-cp", "#attr_cp_j", 0, 1000);
	svgShowElement("#plot-collective-cp", "#attr_cp_k", 0, 1000);
	svgShowElement("#plot-collective-cp", "#attr_rescal_i", 1, 1500);
	svgShowElement("#plot-collective-cp", "#attr_rescal_j", 1, 1500);
	svgShowElement("#plot-collective-cp", "#attr_rescal_k", 1, 1500);
}

