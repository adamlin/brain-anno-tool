function init_marking_controls_list(){
	    var select_list = 'Cell Mapping: <br/><form class="form-inline" style="padding-top:20px">'+
		      				'<label>Mode:&nbsp;&nbsp;</label>'+
					    	'<div class="onoffswitch">'+
							    '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="cellcount_onoffswitch" checked>'+
							    '<label class="onoffswitch-label" for="cellcount_onoffswitch">'+
							        '<span class="onoffswitch-inner"></span>'+
							        '<span class="onoffswitch-switch"></span>'+
							    '</label>'+
							'</div>'+
		      				'<select id="inttype" class="selectCellBox">'+
		          				'<option value="None">View</option>'+
		    					'<option value="Delete">Delete</option>'+
		    					'<option value="Draw">Draw</option>'+
		    				'</select>'+
		    				'<br/><br/>'+
		    				'<div id="gtypesel" style="display:none">'+
			      				'<label>Geometry type: &nbsp;</label>'+
			      				'<select id="geomtype" class="selectCellBox">'+
			        				'<option value="None">None</option>'+
			        				'<option value="Point">Point</option>'+
			        				'<option value="Polygon">Polygon</option>'+
			        				'<option value="Anno_Polygon">Annotation</option>'+
			      				'</select>'+
		  					'</div>'+
		    			  '</form>'+
		    			  '<p>'+
						  	'<input type="checkbox" id ="Toggle" name="Toggle"> <label for="Toggle">Show Detections (<span id="autocount"></span>)</label><br> '+ 
						  	'<button id="deleteAll_features" class="deleteallbutton">Del All</button>'+   
						  	'<button id="deleteSelectedBox_features" class="deleteSelectedBoxbutton">BoxDelete</button><br>'+ 
						    '<input type="checkbox" id ="Toggle2" name="Toggle2"> <label for="Toggle2">Show My Markings (<span id="markcount"></span>)</label><br> '+       
						    '<button id="deleteSelectedBoxOnMarking_features" class="deleteSelectedBoxOnMarkingbutton">Marked Box Delete</button><br>'+ 
						    '<input type="checkbox" id="Toggle3" name="Toggle3"> <label for="Toggle3">Show My Deletions (<span id="delcount"></span>)</label><br>'+
						    '<input type="checkbox" id="Toggle4" name="Toggle4"> <label for="Toggle4">Show Injection Volume </label><br>'+
						    '<button id="start_anno_features" class="makingstartbutton">Start</button>'+
						    '<button id="stop_anno_features" class="makingstopbutton">Stop</button>'+
						    '<button id="final_anno_features" class="makingfinalbutton">Final</button><br>'+
						    '<button id="saved_features" class="makingsavebutton">Save</button>'+
						    '<button id="added_features" class="makingdownloadbutton">Download</button>'+
						  '</p>';
		$('#cell_marking').append(select_list);		    			  
}

function init_tile_split_controls_list(){
	    var select_list = 'Tile Split: <form class="form-inline" style="padding-top:20px">'+
		      				'<label>Number:&nbsp;&nbsp;&nbsp;</label>'+ 
		      				'<select id="intsplittype" class="selectCellBox">'+
		      					'<option value="None">None</option>'+
		          				'<option value="10">10</option>'+
		    					'<option value="20">20</option>'+
		    					'<option value="30">30</option>'+
		    				'</select>'+
		    			  '</form>';
		$('#split_list').append(select_list);		    			  
}