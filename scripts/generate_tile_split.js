function generate_tile_split(imgWidth, imgHeight, factor){
	split_factor = factor;
	var init_cell_add_json =[];
    count = 1;
	for (var i = 0; i < split_factor; i++){
        for (var j = 0; j < split_factor; j++){
            init_cell_add_json[count-1]=
                {
                    "type":"Feature",
                    "id":count,
                    "properties":{
                        "name":count
                    },
                    "geometry":{
                        "type":"Polygon",
                        "coordinates":[[
                        [imgWidth/split_factor * i, -(imgHeight/split_factor * j)],
                        [imgWidth/split_factor * (i+1), -(imgHeight/split_factor * j)], 
                        [imgWidth/split_factor * (i+1), -(imgHeight/split_factor * (j+1))],
                        [imgWidth/split_factor * i, -(imgHeight/split_factor * (j+1))],
                        [imgWidth/split_factor * i, -(imgHeight/split_factor * j)]]]
                    }
                }
                count = count + 1;
        }
     }
    var geojsonAddedObject = {"type":"FeatureCollection","features":init_cell_add_json};
    return geojsonAddedObject;
}
