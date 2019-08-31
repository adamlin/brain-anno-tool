/* Kudos to Jeff Ward: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
app.UUID = (function() {
  var self = {};
  var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
  self.generate = function() {
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
      lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
  }
  return self;
})();

$(function() {
    var app = window.app;
    app.toggleStatus = typeof localStorage.toggle_status !== 'undefined' ? JSON.parse(localStorage.toggle_status) : {FE: true, FR: true, FB: true, FB: true, BDA: true};
    app.toggleStatus.Pencil = true;

    var mousePositionControl = new app.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(1),
        projection: 'pixels',
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
    });

    var ScaleLine = function(opt_options) {
        var options = opt_options || {};
        options.render = ScaleLine.render;
        var className = typeof options.className !== 'undefined' ?
            options.className : 'ol-scale-line';

        this.innerElement_ = document.createElement('div');
        this.innerElement_.className = 'ol-scale-line-inner';

        this.element_ = document.createElement('div');
        this.element_.className = className + ' ol-unselectable';
        this.element_.appendChild(this.innerElement_);

        this.viewState_ = null;

        this.minWidth_ = typeof options.minWidth !== 'undefined' ? options.minWidth : 64;

        this.renderedVisible_ = false;

        this.renderedWidth_ = undefined;
        this.renderedHTML_ = '';
        //var render = options.render ? options.render : ol.control.ScaleLine.render;

        ol.control.Control.call(this, {
            element: this.element_,
            render: ScaleLine.render,
            target: options.target
        });

        //goog.events.listen(
        //    this, ol.Object.getChangeEventType(ol.control.ScaleLineProperty.UNITS),
        //    this.handleUnitsChanged_, false, this);

        //this.setUnits(/** @type {ol.control.ScaleLineUnits} */ (options.units) ||
        //    ol.control.ScaleLineUnits.METRIC);
    };
    ol.inherits(ScaleLine, ol.control.ScaleLine);

    ScaleLine.render = function(mapEvent) {
        var frameState = mapEvent.frameState;
        if (frameState === null) {
            this.viewState_ = null;
        } else {
            this.viewState_ = frameState.viewState;
        }
        this.updateElement_();
    };
    ScaleLine.prototype.updateElement_ = function () {
        var viewState = this.viewState_;
        if (viewState === null) {
            if (this.renderedVisible_) {
                this.element_.style.display = 'none';
                this.renderedVisible_ = false;
            }
            return;
        }

        var center = viewState.center;
        var projection = viewState.projection;
        var pointResolution =
            projection.getPointResolution(viewState.resolution, center);
        //var projectionUnits = projection.getUnits();
        var suffix = 'mm';

        var count, width;
        count = 1.;
        width = Math.round(count / pointResolution);
        while (true) {
            if (width > 500) {
                count /= 2;
                width /= 2;
            } else {
                break;
            }
        }
        var html = count + ' ' + suffix;
        if (this.renderedHTML_ != html) {
            this.innerElement_.innerHTML = html;
            this.renderedHTML_ = html;
        }

        if (this.renderedWidth_ != width) {
            this.innerElement_.style.width = width + 'px';
            this.renderedWidth_ = width;
        }
        if (!this.renderedVisible_) {
            //goog.style.setElementShown(this.element_, true);
            this.element_.style.display = '';
            this.renderedVisible_ = true;
        }

    };
    var scaleLine = new ScaleLine({
        unit: 'pixels',
        minWidth: 150,
    });

    var json_msg_f; 
    var check = [];  
    check.push(968);
    check.push(1024);
 
    var extent = [0,-check[0],check[1],0];
    var extent_view = [ 0 , -1.1 * check[1] , 1.1 * check[0] , 0];
    //var json_data = show_points();

    var geojsonObject = {"type":"FeatureCollection", "features":[{"type":"Feature", "id": 1, "geometry":{ "type": "MultiPoint", "coordinates":[[538,-420]]}}]};
    var json_data = (new ol.format.GeoJSON()).readFeatures(geojsonObject);   // start working on the new openlayer version with Keerth's annotation codes
    var img_url = "http://mitra.brain.riken.jp:3000/adore-djatoka/resolver?url_ver=Z39.88-2004&rft_id=" 
                + app.rft_id + "&svc_id=info:lanl-repo/svc/getRegion&svc_val_fmt=info:ofi/fmt:kev:mtx:jpeg2000&svc.format=image/jpeg&svc.level=3&svc.rotate=0&svc.gamma=0.5";
    
    app.url = img_url;
    var first_pass_length = json_data.length;
    var deleted_ids = [13,27];
    var projection = new ol.proj.Projection({
        units:'pixels',
        extent : extent
    })

    var raster = new ol.layer.Image({
        source: new ol.source.ImageStatic({
            url :app.url,
            projection : projection,
            imageExtent : extent
        })
    });
    
    /*  Added by Adam Lin */
	var progress = new Progress(document.getElementById('progress'));

	raster.on('tileloadstart', function() {
		//create_slider(fid, pid);
		progress.addLoading();
	});
	
	raster.on('tileloadend', function() {
		//create_slider(fid, pid);
		progress.addLoaded();
	});
	raster.on('tileloaderror', function() {
	});
	
	/* 	End */
 
    var source_edit = new ol.source.Vector({
        wrapX: false,
        features: (new ol.format.GeoJSON()).readFeatures({'type': 'FeatureCollection', 'features': []})
    });

    var vector_edit = new ol.layer.Vector({
        source: source_edit,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0)'
          }),
          stroke: new ol.style.Stroke({
            color: '#00ff00',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 4,
            fill: null,
            stroke: new ol.style.Stroke({
               color: '#FFD700',
               width: 2
            }),
          })
        })
    });

    var vector_deletions = new ol.layer.Vector({
        source: new ol.source.Vector({wrapX:false}),
            visible:false,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0)'
                 }),
                stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 2
                }),
                image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                  color: '#ff0000'
                })
            })
        })
    });


    var vector_data = new ol.layer.Vector({
        source : new ol.source.Vector({
        wrapX: false,
    }),


    style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0)'
            
          }),
          stroke: new ol.style.Stroke({
            color: '#FFD700',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        })
    });

    for (var i in json_data){
        if (deleted_ids.indexOf(json_data[i].getId()) !=-1){
            vector_deletions.getSource().addFeature(json_data[i]);
        }
        else{
            vector_data.getSource().addFeature(json_data[i]);
        }
    }   

    var firstpassids = [];
    var delids = [];
    
    var dbdel = [13,27];

    var guard_layer = new ol.layer.Vector({
        source : new ol.source.Vector({
        format: new ol.format.GeoJSON()}),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0)'
          }),
          stroke: new ol.style.Stroke({
            color: '#00000',
            width: 4,
            lineDash :[5,5] 
          })
        })
      });
    guard_layer.set('name','guardlayer')

    feat = new ol.Feature(new ol.geom.Polygon([[[21,-21],[554-21,-21],[554-21,21-554],[21,21-554],[21,-21]]]));
    feat.set('name','guard');
    guard_layer.getSource().addFeature(feat);


    $('#Toggle').change(function (evt){
        checked= evt.target.checked;
        vector_data.setVisible(checked);
    });

    $('#Toggle2').change(function (evt){
        checked= evt.target.checked;
        vector_edit.setVisible(checked);
    });
    $('#Toggle3').change(function (evt){
        checked= evt.target.checked;
        vector_deletions.setVisible(checked);
    });
    
    var select = new ol.interaction.Select( { 
        wrapX: false, 
        filter: function(feature,layer) {
            if(layer.get('name')=='guardlayer')
                return false;
            return true;
        }
    });

    var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
    });

    var map = new ol.Map({
        interactions: ol.interaction.defaults().extend([select]),
        controls: ol.control.defaults({
          attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
          })
        }).extend([mousePositionControl]),
        layers: [raster,vector_deletions,vector_data,vector_edit],
        target: 'map',
        view: new ol.View({
            projection : projection,
            center: ol.extent.getCenter(extent),
            extent : extent_view,
            zoom: 1,
            maxZoom: 10,
            minZoom: 1,
            logo: false
        })
    });

    map.removeInteraction(select);
    map.on('precompose', function(evt) {
                evt.context.imageSmoothingEnabled = false;
                evt.context.webkitImageSmoothingEnabled = false;
                evt.context.mozImageSmoothingEnabled = false;
                evt.context.msImageSmoothingEnabled = false;
            });
    $('#zoomreset').click(function(evt) {
        map.getView().setZoom(1);
        map.getView().setCenter([check[0]/2,-check[1]/2])
    });
    $('#pancenter').click(function(evt) {
        map.getView().setCenter([check[0]/2,-check[1]/2])
    });    

    var draw;
    var draw_style = new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ff00ff',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 4,
            fill : new ol.style.Fill({
            color : 'rgba(0,0,255,1)'
          }),
          stroke: new ol.style.Stroke({
            color: '#0000ff',
            width: 2
          })
        }),
    });

    function addInteraction(){
        typeSelect = document.getElementById('geomtype');
        var value = typeSelect.value;
        if (value !== 'None'){
            draw = new ol.interaction.Draw({
                source : source_edit,
                type   : typeSelect.value,
                freehand: typeSelect.value=='Polygon', //true,
                style : draw_style,
        });
        draw.on('drawend', function(evt) {
            feature = evt.feature;
            if(feature.getGeometry().getType()=='Point') 
                return;

            ext = feature.getGeometry().getExtent();
            geoj = JSON.parse((new ol.format.GeoJSON()).writeFeature(feature));
            kinks = turf.kinks(turf.simplify(geoj));
             

            if (ext[2]-ext[0] > 120 || ext[3]-ext[1]>120 || ext[2]-ext[0]<6 || ext[3]-ext[1]<6 || kinks.features.length > 0) {
                    vector_edit.getSource().removeFeature(feature);
            }
        });

        vector_edit.on('change', function() { 
            updatecounts();
        });

        map.addInteraction(draw);
        }
    }
            
    document.getElementById('geomtype').onchange = function(){
        map.removeInteraction(draw);
        addInteraction();
    }




    var intSelect = document.getElementById('inttype');
    intSelect.onchange=function() {
        $('#gtypesel').css('display','none');
        if(intSelect.value=="Delete"){
          map.removeInteraction(draw);
          map.addInteraction(select);
          $('#Toggle2').prop('checked',true);
          $('#Toggle').prop('checked',true);
        }
        else if(intSelect.value=='Draw') {
          $('#Toggle2').prop('checked',true);
          $('#gtypesel').css('display','block');
          map.removeInteraction(select);
            //map.addInteraction(draw);
            addInteraction();
        }
        else {
          map.removeInteraction(select);
          map.removeInteraction(draw);
        }
    };

    map.on('click', function(evt) {
        if (evt.dragging) return;
            if (intSelect.value!='Delete') return;

            var pixel = map.getEventPixel(evt.originalEvent);
            var feature = map.forEachFeatureAtPixel(pixel, 
                function(feature, layer) { 
                    layername = layer.get('name');
                    if(layername=='guardlayer')
                        return undefined;
                    return feature;
                });
            if (feature!== undefined) 
                deleteFeature(feature);
                updatecounts();
    });

    function deleteFeature(feature) {
      featureid = feature.getId();
      firstpass = vector_data.getSource().getFeatures();
      featurearr= vector_edit.getSource().getFeatures();
      featureprops = feature.getProperties();

      if(featureid==undefined || featureid > first_pass_length)
      {
        if(featureprops.hasOwnProperty('name') && featureprops.name=='guard')
            return;
        vector_edit.getSource().removeFeature(feature);        
      }
      else 
      {    
        vector_data.getSource().removeFeature(feature);
        vector_deletions.getSource().addFeature(feature);
      }
    }
        
    $("#added_features").click(function(event){
        event.preventDefault(); 
        alert("Saved");
        save_data(0);
    });

    $("#completebutton").click(function(event){
        event.preventDefault();
        var r = confirm("Do you want to continue:");
        if ( r == true){
            save_data(1);
        }
    });

    function save_data(stat_comp){
        features_new = vector_edit.getSource().getFeatures();
        features_del = vector_deletions.getSource().getFeatures();
        var del_feat_id = [];       
        var added_features = [];
        for ( var i in features_del){
            del_feat_id.push(features_del[i].getId());
        }

        for( var i in features_new){
            added_features.push(new ol.format.GeoJSON().writeFeature(features_new[i]));
        }
                            
        feature_info = {"del_id":JSON.stringify(del_feat_id),"tileno":"94_40","added_feat":"["+added_features.toString()+"]","completed":stat_comp.toString(),"start_time":1488871972.57};  
              $.ajax({
                type : "POST",
                url  : "/atlas/annotate/save",
                data : feature_info, 
                success :function(response){
                    dirty = false;
                    console.log(response);
                    if (response === 'C'){
                          redirect = "http://mitra.brain.riken.jp/openlayers/atlas/annotate/filelist";
                        window.location.href = redirect;
                    }
                },
              });
    }

    function updatecounts() {

        firstpass = vector_data.getSource().getFeatures();

        $('#autocount').html(firstpass.length);
        drawn = vector_edit.getSource().getFeatures();
        
        $('#markcount').html(drawn.length);
        del = vector_deletions.getSource().getFeatures();
        
        $('#delcount').html(del.length);
        dirty = true ;
    }

    $(document).ready(function() {
       updatecounts();
       dirty = false;
    });
                                                                

    


    // cell counting - auto loaded

    var p_source = new ol.source.Vector({
        features: []
    });

    var fill_p = new ol.style.Fill({
        color: 'rgba(255,255,255,0)'
    });
    var stroke_p = new ol.style.Stroke({
        color: '#d808e9',
        width: 1.5
    });
    var styles_p = [
        new ol.style.Style({
            image: new ol.style.Circle({
                fill: fill_p,
                stroke: stroke_p,
                radius: 3
            }),
            fill: fill_p,
            stroke: stroke_p
        })
    ];

    var p_layer = new ol.layer.Vector({
        source:p_source,    
        style:styles_p
    })

    map.addLayer(p_layer);
    map.on('click',function(evt){
        var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
                return feature;
        });
        if (feature) {
            var geometry = feature.getGeometry();
            var coord = geometry.getCoordinates();
        }
     });
    $(map.getViewport()).on('mousemove',function(e)
    {
    });

    var typeSelect = document.getElementById('mtype');
    var onoffSelect = document.getElementById('cellcount_onoffswitch');
    var draw;
    var regquery='';

    var featuresarr = new ol.Collection();
    var vsource = new ol.source.Vector({wrapX: false, features: featuresarr, useSpatialIndex: false});

    function addCellCountInteraction() 
    {
            var value = typeSelect.value;
            reg = "";
            if (value == 'Box' || value == 'Polygon'){
                var geometryFunction, maxPoints;
                if (value === 'Square'){
                    value = 'Circle';
                    geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
                }else if (value === 'Box'){
                    value = 'LineString';
                    maxPoints = 2;
                    geometryFunction = function(coordinates, geometry){
                        if (!geometry){
                            geometry = new ol.geom.Polygon(null);
                        }
                        var start = coordinates[0];
                        var end = coordinates[1];
                        geometry.setCoordinates([[start, [start[0], end[1]], end, [end[0], start[1]], start] ]);
                        return geometry;
                    };
                }
                draw = new ol.interaction.Draw({
                        source: vsource,
                        features:featuresarr,
                        type: /** @type {ol.geom.GeometryType} */ (value),
                        geometryFunction: geometryFunction,
                        maxPoints: maxPoints,
                //freehandCondition: function(event){ return ol.events.condition.never(event);}
                });
                map.addInteraction(draw);
                var format = new ol.format.GeoJSON();
                draw.on('drawend',function(event){
                    var feature = event.feature;
                    var geom =feature.getGeometry();
                    //alert(geom.getType());
                    var payload = '';
                    if(geom.getType() === 'Circle')
                    {
                        var circle_radius =  geom.getRadius();
                        var circle_center = geom.getCenter();
                        payload = '{ "type":"Circle", "coordinates":[' + circle_center + '],radius":' + circle_radius + '}';
                    }
                    else 
                    {
                        payload=format.writeGeometry(feature.getGeometry());
                    }   
                    reg = payload;
                    
                    if (typeSelect.value != 'All'){
                        var select_type = 'part';
                        region = '{"brainno": '+ br_no +',"sliceno":"'+slice_no+ '","countall":"'+ select_type +'","marking":'+reg+"}";
                    }
                    
                    //region = '{"brainno": '+ br_no +',"sliceno":"'+slice_no+ '","marking":'+reg+"}";
                    regquery= region;
                    show_points();
                });
            }
            if (value == 'All'){
                show_points();
            }
    
    }
    typeSelect.onchange = function() 
    {
        map.removeInteraction(draw);
        if($('#cellcount_onoffswitch:checkbox:checked').length == 0){
            addCellCountInteraction();
        }
    };
    
    onoffSelect.onchange = function()
    {
        if($('#cellcount_onoffswitch:checkbox:checked').length == 1){
            map.removeInteraction(draw);
        }else{
            addCellCountInteraction();
        }
    }
    
    if($('#cellcount_onoffswitch:checkbox:checked').length == 0){
        addCellCountInteraction();
    }   

    var coordfeature = '{"type":"FeatureCollection","features":[' +
     '{"type":"Feature","id":"currentmarking","properties":{"name":""},"geometry":{"type":"MultiPoint","coordinates":';
    function show_points()
    {
        //if (typeSelect.value == 'All'){
            var select_type = 'all';
            regquery = '{"brainno": '+ br_no +',"sliceno":"'+slice_no+ '","countall":"'+ select_type + '"}';
        //}
        $.ajax({
            url:'/openlayers/regionquery.php',
            type: 'POST',
            //contentType:'application/json; charset = utf-8',
            data: {'qry' :regquery},
                success:function(result){
                //console.log(result);
                
                jsmesg = JSON.parse(result);
                
                //console.log("#pts="+jsmesg.length);
                $('#popup').empty();
                $('#popup').append("<p>Total Cell Counts: <a style='color:yellow'>"+jsmesg.length+"</a></p>");
                if(reg != ""){
                    dimesg = JSON.parse(reg);
                    pix_siz=0.46; //um
                    pix_deep = 20; //um
                    area = Math.abs((dimesg.coordinates[0][2][0] - dimesg.coordinates[0][0][0])*(dimesg.coordinates[0][2][1] - dimesg.coordinates[0][0][1])); // need to revised to count the area
                    ar_mmsq = area * pix_siz*pix_siz/1000000.;
                    vol_mm3 = area * pix_siz * pix_siz * pix_deep / 1000000000.; 
                    $('#popup').append("<p>Area marked: <a style='color:yellow'>" + Math.round(100000*ar_mmsq)/100000 +
                                       "</a> sq.mm<br/>Density: <a style='color:yellow'>"+ Math.round(100*jsmesg.length/ar_mmsq)/100 +
                                       "</a> nuclei/sq.mm<br/><a style='color:yellow'>"+Math.round(1000*jsmesg.length/vol_mm3)/1000+
                                       "</a> /mm</p>");
                }
                                
                ptarr  = jsmesg;
                var geojsonObject = {
                  'type': 'FeatureCollection',
                  'features': [
                    {
                        'type': 'Feature',
                        'id': 1,
                        'geometry': {
                            'type': 'MultiPoint',
                            'coordinates': ptarr
                        }
                    }
                  ]
                };    

                //p_source.clear();
                //p_source.addFeatures(new ol.format.GeoJSON().readFeatures(geojsonObject));
                json_data = (new ol.format.GeoJSON()).readFeatures(geojsonObject);

                for (var i in json_data){
                    vector_data.getSource().addFeature(json_data[i]);
                } 
            }
        });
    }   
});
