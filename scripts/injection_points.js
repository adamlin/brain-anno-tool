$(function() {
		var markings = [
			{ color: "#f6f6f6", yaxis: { from: 0.5 } },
			{ color: "#f6f6f6", yaxis: { to: -0.5 } },
			{ color: "#000", lineWidth: 1, xaxis: { from: 0, to: 0 } }
		];

 		var coordinatesMap = <?php
			global $wpdb;
			$sql = "SELECT * FROM Navigator_injection WHERE lab_group='Mitra'";
			$rows = $wpdb->get_results($sql);
			
			if(is_array($rows)){
			    echo json_encode($rows);
			}else {
			    echo '{}';
			}
		?>;
		
		function drawArrow(ctx, x, y, radius){
			ctx.beginPath();
			ctx.moveTo(x + radius, y + radius);
			ctx.lineTo(x, y);
			ctx.lineTo(x - radius, y + radius);
			ctx.stroke();
		}

		function drawSemiCircle(ctx, x, y, radius){
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI, false);
			ctx.moveTo(x - radius, y);
			ctx.lineTo(x + radius, y);
			ctx.stroke();
		}
		
		var coordinatesMapAccounts =[];
		for (var i=0; i < coordinatesMap.length; i++) {
			coordinatesMapAccounts[i] = [[coordinatesMap[i].y_coord,coordinatesMap[i].x_coord,1,1]];
		}		
		

		var datastructure = [];
		var count = 0;
		for (var i=0; i < coordinatesMapAccounts.length; i++) {
			if (coordinatesMap[i].tracer == "FastBlue"){
				datastructure[count] = {color: "blue", points:{symbol:"diamond"}, data: coordinatesMapAccounts[i], label: coordinatesMap[i].brain_id};
				count = count + 1;
			}
			if (coordinatesMap[i].tracer == "RED"){
				datastructure[count] = {color: "red", points:{symbol:"cross"}, data: coordinatesMapAccounts[i], label: coordinatesMap[i].brain_id};
				count = count + 1;
			}
			if (coordinatesMap[i].tracer == "CTB"){
				datastructure[count] = {color: "black", points:{symbol:"diamond"}, data: coordinatesMapAccounts[i], label: coordinatesMap[i].brain_id};
				count = count + 1;
			}
			if (coordinatesMap[i].tracer == "DY"){
				datastructure[count] = {color: "yellow", points:{symbol:"diamond"}, data: coordinatesMapAccounts[i], label: coordinatesMap[i].brain_id};
				count = count + 1;
			}
			if (coordinatesMap[i].tracer == "GFP"){
				datastructure[count] = {color: "green", points:{symbol:"cross"}, data: coordinatesMapAccounts[i], label: coordinatesMap[i].brain_id};
				count = count + 1;
			}
		}
	
		var plot = $.plot($("#placeholder"), datastructure , {
			legend: {
				position: "se",
				show: false
			},
			series: {
				lines: {
					show: true
				},
				points: {
					show: true,
					radius: 3
				},
				
			},
			xaxis: {
				min: -20,
				max: 20,
			},
			yaxis: {
				min: -30,
				max: 30
			},
			zoom: {
				interactive: true
			},
			pan: {
				interactive: true
			},
			grid: {
				hoverable: true,
				clickable: true,
				markings: markings
			},
			crosshair: {
				mode: "xy"
			},
		});
		$("<div id='tooltip'></div>").css({
			position: "absolute",
			display: "none",
			border: "1px solid #fdd",
			padding: "2px",
			"background-color": "#fee",
			opacity: 0.80,
			"z-index": 4
		}).appendTo("body");

		$("#placeholder").bind("plothover", function (event, pos, item) {
			$("#txt_hearbar").empty();
			var str = "Tracking: (AP:" + pos.x.toFixed(2) + ", ML:" + pos.y.toFixed(2) + ")";
			$("#hoverdata").text(str);
			
			o = plot.pointOffset({ x: 0, y: -5});
			
			var ctx = plot.getCanvas().getContext("2d");
			ctx.beginPath();
			o.left += 4;
			ctx.moveTo(o.left, o.top);
			ctx.lineTo(o.left, o.top - 10);
			ctx.lineTo(o.left + 10, o.top - 5);
			ctx.lineTo(o.left, o.top);
			ctx.fillStyle = "#000";
			ctx.fill();
		
			if(item){
				var x = item.datapoint[0],
					y = item.datapoint[1];
				
				$("#tooltip").html("Brain: "+item.series.label + " of AP:" + x + "mm ML: " + y + "mm")
					.css({top: item.pageY+5, left: item.pageX+5})
					.fadeIn(200);
			}else{
				$("#tooltip").hide();
			}
		});

		$("#placeholder").bind("plotclick", function (event, pos, item) {
			if (item) {
				var combine_data = "";
				present_data_point(combine_data, datastructure);
				$("#clickdata").empty();
				$("#clickdata").append(combine_data);
				
			}
		});
		
		o = plot.pointOffset({ x: 0, y: -20});
		$("#placeholder").append("<div id='txt_hearbar' style='position:absolute;left:" + (o.left + 4) + "px;top:" + o.top + "px;color:#666;font-size:smaller'>Ear-Bar location</div>");					
		// Draw a little arrow on top of the last label to demonstrate canvas
		// drawing
		
		var ctx = plot.getCanvas().getContext("2d");
		ctx.beginPath();
		o.left += 4;
		ctx.moveTo(o.left, o.top);
		ctx.lineTo(o.left, o.top - 10);
		ctx.lineTo(o.left + 10, o.top - 5);
		ctx.lineTo(o.left, o.top);
		ctx.fillStyle = "#000";
		ctx.fill();

	function present_data_point(combine_data, datastructure){
		for (var i=0; i < datastructure.length; i++) {
			if(datastructure[i].data[0][0] == item.datapoint[0] && datastructure[i].data[0][1] == item.datapoint[1]){
				if(datastructure[i].color == "blue"){
					combine_data += "</br> - Brain: " + datastructure[i].label + " | Tracer: FaseBlue | Point: AP:" + datastructure[i].data[0][0] + "mm ML:" + datastructure[i].data[0][1] + "mm";
				}
				if(datastructure[i].color == "green"){
					combine_data += "</br> - Brain: " + datastructure[i].label + " | Tracer: GFP | Point: AP:" + datastructure[i].data[0][0] + "mm ML:" + datastructure[i].data[0][1] + "mm";
				}
				if(datastructure[i].color == "red"){
					combine_data += "</br> - Brain: " + datastructure[i].label + " | Tracer: AAVTom | Point: AP:" + datastructure[i].data[0][0] + "mm ML:" + datastructure[i].data[0][1] + "mm";
				}
				if(datastructure[i].color == "black"){
					combine_data += "</br> - Brain: " + datastructure[i].label + " | Tracer: CTB | Point: AP:" + datastructure[i].data[0][0] + "mm ML:" + datastructure[i].data[0][1] + "mm";
				}
				if(datastructure[i].color == "yellow"){
					combine_data += "</br> - Brain: " + datastructure[i].label + " | Tracer: DY | Point: AP:" + datastructure[i].data[0][0] + "mm ML:" + datastructure[i].data[0][1] + "mm";
				}
			}else{
				//combine_data += " - Brain: " + item.series.label + "|Point: x:" + item.datapoint[0] + "mm y:" + item.datapoint[1] + "mm";
			}
		}
		return 	combine_data;
	}
 });