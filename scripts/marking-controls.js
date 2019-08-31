function init_marking_controls_list(){
	    var select_list = 'Cell Mapping: <br/><form class="form-inline" style="padding-top:20px">'+
		      				'<label>Mode:&nbsp;&nbsp;</label>'+ 
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
						  	'<input type="checkbox" id ="Toggle" name="Toggle" checked> <label for="Toggle">Show Detections (<span id="autocount"></span>)</label><br> '+       
						    '<input type="checkbox" id ="Toggle2" name="Toggle2" checked> <label for="Toggle2">Show My Markings (<span id="markcount"></span>)</label><br> '+       
						    '<input type="checkbox" id="Toggle3" name="Toggle3"> <label for="Toggle3">Show My Deletions (<span id="delcount"></span>)</label><br>'+
						    '<button id="saved_features" class="makingsavebutton">Save</button>'+
						    '<button id="added_features" class="makingdownloadbutton">Download</button>'+
						  '</p>';
		$('#cell_marking').append(select_list);		    			  
}

function init_tile_split_controls_list(){
	    var select_list = 'Tile Split: <br/><form class="form-inline" style="padding-top:20px">'+
		      				'<label>Num:&nbsp;&nbsp;</label>'+ 
		      				'<select id="intsplittype" class="selectCellBox">'+
		      					'<option value="None">None</option>'+
		          				'<option value="10">10</option>'+
		    					'<option value="20">20</option>'+
		    					'<option value="30">30</option>'+
		    				'</select>'+
		    			  '</form>'+
		    			  '<br/>' + 
		    			  '<p>'+
						    '<button id="saved_tilesplits" class="makingdownloadbutton">Assign</button>'+
						    '<button id="clear_tilesplits" class="makingdownloadbutton">Clear</button>'+
						  '</p>';
		$('#split_list').append(select_list);		    			  
}

function init_cell_mapping_controls_list(){
	    var select_list = 'Cell Mapping: <br/><form class="form-inline" style="padding-top:20px">'+
		      				'<label>Mode:&nbsp;&nbsp;</label>'+ 
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
		    				'<br/>'+
		    				'<div id="ctypesel" style="display:none">'+
			      				'<label>Region: &nbsp;</label>'+
			      				'<select id="ceomtype" class="selectCellBox">'+
			        				'<option value="None">None</option>'+
			        				'<option value="APul">APul</option>'+
			        				'<option value="IPul">IPul</option>'+
			        				'<option value="IPul(CL)">IPul (CL)</option>'+
			        				'<option value="IPul(CM)">IPul (CM)</option>'+
			        				'<option value="IPul(M)">IPul (M)</option>'+
			        				'<option value="IPul(P)">IPul (P)</option>'+
			        				'<option value="MPul">MPul</option>'+
			        				'<option value="LPul">LPul</option>'+
			        				'<option value="K1">K1</option>'+
			        				'<option value="K2">K2</option>'+
			        				'<option value="K3">K3</option>'+
			        				'<option value="K4">K4</option>'+
			        				'<option value="InMC">InMC</option>'+
			        				'<option value="InPC">InPC</option>'+
			        				'<option value="DLG">DLG</option>'+
			        				'<option value="ExMC">ExMC</option>'+
			        				'<option value="ExPC">ExPC</option>'+
			      				'</select>'+
		  					'</div>'+
		    			  '</form>'+
		    			  '<p>'+
						  	'<input type="checkbox" id ="Toggle" name="Toggle" checked> <label for="Toggle">Show Detections (<span id="autocount"></span>)</label><br> '+       
						    '<input type="checkbox" id ="Toggle2" name="Toggle2" checked> <label for="Toggle2">Show My Markings (<span id="markcount"></span>)</label><br> '+       
						    '<input type="checkbox" id="Toggle3" name="Toggle3"> <label for="Toggle3">Show My Deletions (<span id="delcount"></span>)</label><br>'+
						    '<button id="saved_features" class="makingsavebutton">Save</button>'+
						    '<button id="added_features" class="makingdownloadbutton">Download</button>'+
						  '</p>';
		$('#cell_marking').append(select_list);		    			  
}