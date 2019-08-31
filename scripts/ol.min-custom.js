function new_layer(rft_id){
	window.app = {};
	app = window.app;
	
    var new_jsrc = new ol.source.Djatoka({
        url: 'http://mitra.brain.riken.jp:3000/adore-djatoka/resolver',
        image: rft_id
    });

    var new_colorLayer = new ol.layer.Tile({
        source: new_jsrc
    });
    

	new_colorLayer.setSource(new_jsrc);
    //new_colorLayer.setMap();
    
    var layers = [
            new_colorLayer
        ];
    layers.push(new_colorLayer);

    app.map = new ol.Map({
        view: new ol.View({
		    center: [0, 0],
		    zoom: 1
		  }),
		target: 'map',
        layers: layers,
        pixelRatio: 1,
        controls: ol.control.defaults({
            attribution: false
        }),
        logo: false
    });
    app.map.getSize();
}