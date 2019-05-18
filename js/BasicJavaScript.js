// window resize function for responsive graph
d3.select(window)
	.on("resize", sizeChange);
// variable used in the js file
var bool = false;


// projection for the country Map  
var projection = d3.geoEquirectangular()
	.center([132, -28])
	.scale(800);


//path generator according to the projection
var path = d3.geoPath()
	.projection(projection);

// setting color for the map 
var color = d3.scaleSequential(d3.interpolateGnBu);

// adding tooltip class 
var tooltip = d3.select('#containerChart').append('div')
	.attr('class', 'tooltip')
	.style('opacity', 0);

var anchorTip = d3.select('#containerChart').append('div')
	.attr('class', 'anchor');

// appending svg to the existing container to create map
var svg = d3.select("#containerChart")
	.append("svg")
	.attr("width", "100%")
	.attr("height", "100%")
	.append("g");
var g = svg.append('g');


// fiunction to create map
run();
//clicked();
initViz();

function run() {
	// data for the map from csv file
	queue()
		.defer(d3.json, 'Dataset/AustraliaGeo.json')
		.await(makeMyMap);


	// function to process data 
	function makeMyMap(error, data) {
		if (error) {
			return console.error(error);
		}

		var counties = topojson.feature(data, data.features);
		console.log(counties);

		meanDensity = d3.mean(data.features, function (d) {

			return Math.round(d.properties.Asthma * 100) / 100;

		});

		// selecting density for Colour in the map
		var scaleDensity = d3.scaleQuantize()
			.domain([0, 900])
			.range([0, 0.2, 0.4, 0.6, 0.8, 1]);


		// creating D3 map of Australia
		svg.selectAll("path")
			.data(data.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("stroke", "dimgray")
			.attr("fill", function (d) {
				return color(scaleDensity(d.properties.Asthma))

			}).attr("fill", function (d) {

				if (d.properties.STATE_NAME == "Victoria") {
					d3.select(this).classed("selectedRed", true);


				}
				return color(scaleDensity(d.properties.Asthma))

			})
			.on('click', function (d) {
				if (d.properties.STATE_NAME == "Victoria") {
					clicked();

					this.classList.add(".scrollto");
					document.getElementById("services").scrollIntoView(true);

					bool = true;

				}

			})
			.on('mouseover', function (d) {

				if (d.properties.STATE_NAME != "Victoria") {
					d3.select(this).classed("selected", true);
					tooltip.html(d.properties.STATE_NAME + ' Patient' + ": " + d.properties.Asthma)
						.styles({
							'left': (d3.event.pageX) - 50 + 'px',
							'top': (d3.event.pageY) - 100 + 'px'
						})
					tooltip.transition()
						.duration(200)
						.style('opacity', .9);
				}

			})
			.on('mouseout', function (d) {
				if (d.properties.STATE_NAME == "Victoria") {} else {
					d3.select(this).classed("selected", false);
					tooltip.transition()
						.duration(400)
						.style('opacity', 0);
				}
			});


		svg.selectAll("text")
			.data(data.features)
			.enter()
			.append("text")
			.attr("fill", "Black")
			.attr("transform", function (d) {
				return "translate(" + path.centroid(d) + ")";
			})
			.attr("text-anchor", "middle")
			.attr("dy", ".35em")

			.text(function (d) {

				return d.properties.STATE_CODE;


			})
			.on('click', function (d) {
				if (d.properties.STATE_NAME == "Victoria") {
					// clicked();

					this.classList.add(".scrollto");
					document.getElementById("services").scrollIntoView(true);

					bool = true;

				}

			});

		// creating legend for the Map 					
		var legendContainerSettings = {
			x: $("#containerChart").width() * 0.07,
			y: $("#containerChart").height() * 2.3,
			width: 300,
			height: 70,
			roundX: 10,
			roundY: 10
		}


		var legendContainer = svg.append('rect')
			.attrs({
				'x': legendContainerSettings.x,
				'y': legendContainerSettings.y,
				'rx': legendContainerSettings.roundX,
				'ry': legendContainerSettings.roundY,
				'width': legendContainerSettings.width,
				'height': legendContainerSettings.height,
				'id': 'legend-container'
			});

		var legendBoxSettings = {
			width: 45,
			height: 10,
			y: legendContainerSettings.y + 55
		};

		var legendData = [0, 0.2, 0.4, 0.6, 0.8, 1];

		var legend = svg.selectAll('g.legend')
			.data(legendData)
			.enter().append('g')
			.attr('class', 'legend');

		legend.append('rect')
			.attrs({
				'x': function (d, i) {
					return legendContainerSettings.x + legendBoxSettings.width * i + 20;
				},
				'y': legendBoxSettings.y - 10,
				'width': legendBoxSettings.width,
				'height': legendBoxSettings.height
			})
			.styles({
				'fill': function (d, i) {
					return color(d);
				},
				'opacity': 1
			});

		var formatDecimal = d3.format('.1f');

		function getPopDensity(rangeValue) {
			return formatDecimal(scaleDensity.invertExtent(rangeValue)[1]);
		}

		var legendLabels = [
			'<' + getPopDensity(0),
			'>' + getPopDensity(0),
			'>' + getPopDensity(0.2),
			'>' + getPopDensity(0.4),
			'>' + getPopDensity(0.6),
			'>' + getPopDensity(0.8)
		];

		legend.append('text')
			.classed("legend-text", true)
			.attrs({
				'x': function (d, i) {
					return legendContainerSettings.x + legendBoxSettings.width * i + 30;
				},
				'y': legendContainerSettings.y + 40
			})
			.text(function (d, i) {
				return legendLabels[i];
			});

		legend.append('text')
			.attrs({
				'x': legendContainerSettings.x + 23,
				'y': legendContainerSettings.y + 15
			})
			.styles({
				'font-size': 16
			})
			.text("ESTIMATE ('000')");

	}

}
// Tableau Visualization 
function initViz() {

	var containerDiv = document.getElementById("vizContainer"),
		url = "https://public.tableau.com/shared/7JZ6J9HF6?:display_count=yes",
		options = {
			hideTabs: false,
			onFirstInteractive: function () {
				// containerDiv.
			}
		};

	var viz = new tableau.Viz(containerDiv, url, options);
	// Create a viz object and embed it in the container div.


}
// click function when victoria state is clicked
function clicked() {

	document.getElementById("services").style.display = "block";

	var Age = ['Age 1 to 4', 'Age 5 to 8', 'Age 9 to 12'];
	// Data for CsV file
	Plotly.d3.csv('Dataset/PredictedVictoria.csv', (err, rows) => {
		var data = Age.map(y => {
			var d = rows.filter(r => r.Age === y)

			return {
				type: 'line',
				name: y,
				x: d.map(r => r.Year),
				y: d.map(r => r.Indicator)
			}
		})

		var layout = {
			title: 'Children with asthma (2013-2018)',
			xaxis: {
				title: 'Year'
			},
			yaxis: {
				title: 'Proportion Of children'
			}
		};

		// creating graph 
		Plotly.newPlot('containerLine', data, layout, {
			responsive: true,
			displayModeBar: false
		});
	})
	// Second graph
	CreateSecondGraph();

}

// graph for Victoria 
function CreateSecondGraph() {
	var gender = ['Male', 'Female']

	// data from csv file
	Plotly.d3.csv('Dataset/Asthma_BOD.csv', (err, rows) => {
		var data = gender.map(y => {
			var d = rows.filter(r => r.Gender === y)

			return {
				type: 'bar',
				name: y,
				x: d.map(r => r.Age),
				y: d.map(r => r.DAILY)
			}
		})

		var layout = {
			title: 'Years lost due to asthma',

			xaxis: {
				title: 'Age'
				//     showgrid: false
			},
			yaxis: {
				title: 'Years lost'
				//    showgrid: false

			}

		};
		// ploting the graph
		Plotly.newPlot('containerStackBar', data, layout, {
			responsive: true,
			displayModeBar: false
		});
	})


}

// resize funtion for responsive graphs
function sizeChange() {
	d3.select("g").attr("transform", "scale(" + $("#containerChart").width() / 900 + ")");
	$("svg").height($("#containerChart").width() * 0.528);

	if (bool == true) {
		clicked();
	}

}