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

        /*var units = this.getUnits();
        var nominalCount = this.minWidth_ * pointResolution;
        var i = 3 * Math.floor(Math.log(this.minWidth_ * pointResolution) / Math.log(10));
        var count, width;
        while (true) {
            count = ol.control.ScaleLine.LEADING_DIGITS[i % 3] * Math.pow(10, Math.floor(i / 3));
            width = Math.round(count / pointResolution);
            console.log('i', i, 'width', width, 'count', count, 'res', pointResolution);
            if (isNaN(width)) {
                //goog.style.setElementShown(this.element_, false);
                this.renderedVisible_ = false;
                return;
            } else if (width >= this.minWidth_) {
                break;
            }
            ++i;
        }
        */
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

    var jsrc = new ol.source.Djatoka({
        url: app.url,
        image: app.rft_id,
    });

    app.rft_id2 = app.rft_id.replace(/REG/g, "REG-G");
    app.rft_id2 = app.rft_id2.replace(/N/g, "F");     
    var jsrc2 = new ol.source.Djatoka({
        url: app.url,
        image: app.rft_id2,
    });

    var stroke_fe = new ol.style.Stroke({color: 'green', width: 0});
    var fill_fe = new ol.style.Fill({color: 'green'});
    var marker_lookup = function(res) {
        var micron_per_px = res / app.res;
        var ret = 0.016 / micron_per_px;
        console.log('marker width', ret);
        return ret;
    }
    var style_cache = {};
    app.style_cache = style_cache;

	var progress = new Progress(document.getElementById('progress'));
	
	/* 	Loading Progress: Added by Adam Lin */
	
	jsrc.on('tileloadstart', function() {
		//create_slider(fid, pid);
		progress.addLoading();
	});
	
	jsrc.on('tileloadend', function() {
		//create_slider(fid, pid);
		progress.addLoaded();
	});
	jsrc.on('tileloaderror', function() {
	});
	
	/*  End of Loading Progress: Added by Adam Lin */
    
    /*  Atlas Viewer Addition Feature add on : Developed by Keerthi, IIT */
    var featuresarr= new ol.Collection();
    var vsource = new ol.source.Vector({wrapX: false, features: featuresarr, useSpatialIndex: false});
    var overlay_layer = new ol.layer.Vector({
       // map: app.map,
        source: vsource,
        style: new ol.style.Style({
            fill:new ol.style.Fill({
                color: 'rgba(255,255,255,0.2)'
            }),
        
        stroke: new ol.style.Stroke({
            color:'#ffcc33',
            width:2
            }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color:'#ffcc33'
                })
            })
        })
    });

    var atlasstyle = new ol.style.Style({
      fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0)'
      }),
      stroke: new ol.style.Stroke({
            color: '#114F13',
            width: 1
        }),
            text: new ol.style.Text({
            font: '12px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: '#000'
                }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 3
            })
        })
    });

    var atstyles = [atlasstyle];
    var feat;
    /*
    if(false) {
        geourl = '/atlas/nissl/atlas_PMD2290_19.json' //'/portal2/getatlasgeojson/PMD1080/76'
        $.get(geourl, function(data,success) {
                if(data.length>0) {
                  //console.log(data.substring(0,1000))
                  feat = JSON.parse(data);
                }
            });
    }
    */
    var slidenumber, PredictedSectionNumber;
    var f_split = 73;
    var s_split = 219;
    var decode_label_number = pid.split('-');
    
    if (slice_type == 'N'){
        slidenumber = decode_label_number[1].replace('N', '');
    }
    else if (slice_type == 'F'){
        slidenumber = decode_label_number[1].replace('F', '');
    }
    sectionnumber = decode_label_number[3].split("_")[1];
    sectionnumber = Number(sectionnumber);
    //slidenumber = Number(slidenumber) + 8;

    if(slidenumber < f_split){
        ColumnNumber = 3-sectionnumber;
        PredictedSectionNumber = 2;
        PredictedSectionNumber = (slidenumber-1)*2+ColumnNumber;
    }

    if(slidenumber >= f_split && slidenumber <= s_split){
        ColumnNumber = 2-sectionnumber;
        PredictedSectionNumber = 1;
        PredictedSectionNumber = (f_split - 2)*2 + 2 + (slidenumber - f_split)+ColumnNumber;
    }

    if(slidenumber > s_split){
        ColumnNumber = 3-sectionnumber;
        PredictedSectionNumber = 2;
        PredictedSectionNumber = ((f_split-2)*2 + 2) + ((s_split - f_split)+1) + ((slidenumber - s_split + 1)*2 + ColumnNumber);
    }

    // temp - need to fix to align the sections......
    PredictedSectionNumber = 380 - PredictedSectionNumber + 1;
    PredictedSectionNumber = Math.ceil(PredictedSectionNumber * 0.657);
    //PredictedSectionNumber = 250 - PredictedSectionNumber + 1;
    console.info(PredictedSectionNumber);
    var strNoDivs = $('div.gallery-thumbnail > a').length;

    geourl = "http://mitra.brain.riken.jp/openlayers/atlas/m920/"+PredictedSectionNumber + "/" + PredictedSectionNumber + ".json";
    //geourl = "http://mitra.brain.riken.jp/openlayers/atlas/m920/110/110.json";
    console.info('SlideNumber: '+slidenumber);

    console.info(pid + ':' + fid);
	function hexToRgb(hex) {
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	    } : null;
	}
    var atlaslayer = new ol.layer.Vector({
        source: new ol.source.Vector({
                url: geourl, 
                format: new ol.format.GeoJSON()
        }),
        style: function(feature,resolution){
            //tx= atlasstyle.getText(); 
            var color = feature.get('color');
            var color_array = color;
			//ol.color.asArray(color).slice();

	    var cc = hexToRgb(color);	
	    if (!cc) {
		cc = {r: 128, g: 128, b: 128};
        console.log('no color', color);
		} 
	    var atlasstyle = new ol.style.Style({
	      fill: new ol.style.Fill({
		  color: [cc.r, cc.g, cc.b, 0.5]
	      }),
	      stroke: new ol.style.Stroke({
		    color: '#114F13',
		    width: 1
		}),
		    text: new ol.style.Text({
		    font: '12px Calibri,sans-serif',
			fill: new ol.style.Fill({
			    color: '#000'
			}),
		    stroke: new ol.style.Stroke({
			color: '#fff',
			width: 3
		    })
		})
	    });
            //atlasstyle.getFill().setColor([0, 255, 0, 0.2]);
            
            return [atlasstyle];
        }
    }); 
    

    $('#Toggle').change(function (evt){
        checked= evt.target.checked;
        atlaslayer.setVisible(checked);
    });

    app.overlay_layer = atlaslayer;
    app.overlay_layer.setOpacity(1);
    /*  END of Atlas Viewer Addition Feature add on : Developed by Keerthi, IIT */



    jsrc.getImageMetadata(function() {
        var meta = jsrc.getMeta();
        var imgWidth = meta.width;
        var imgHeight = meta.height;
        
        app.meta = meta; // Added by Adam Lin
        
        var proj = new ol.proj.Projection({
            code: 'DJATOKA',
            units: 'pixels',
            //extent: [0, 0, imgWidth, -imgHeight]
            extent: [0, 0, 256 * Math.pow(2, meta.levels - 1), 256 * Math.pow(2, meta.levels - 1)],
            getPointResolution: function (resolution, point) {
                return resolution / app.res;
            }
        });
        var imageLayer = new ol.layer.Tile({
            source: jsrc,
            projection: proj,
        });
        app.jsrc = jsrc;
        app.proj = proj;
        app.layers = imageLayer;
        var layers = [
            imageLayer
        ];
        app.layers = layers;
        var annotation_features = app.annotation_features;
        var annotation_src = new ol.source.Vector({wrapX: false, features: annotation_features});
        app.annotation_src = annotation_src;

        var annotation_layer = new ol.layer.Vector({
            source: annotation_src
        });        



        var parcel_styles = (function() {
            var style_cache = {};
            return function (resolution) {
                var color = this.get('color');
                var key = color;
                if (this.get('highlight')) {
                    key += '_highlight';
                }
                if (style_cache[key]) {
                    return style_cache[key];
                } else {
                    var color_array = ol.color.asArray(color).slice();
                    if (this.get('highlight')) {
                        color_array = [255, 255, 255, 0];
                    }
                    var style = [new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: color_array,
                        }),
                        stroke: new ol.style.Stroke({
                            color: color_array,
                            width: 1,
                        })
                    })];
                    style_cache[key] = style;
                    return style;
                }
            };
        })();
        var parcel_features = app.parcel_features = new ol.Collection();
        app.parcel_lookup = {};
        app.parcel_uuid_lookup = {};
        _.each(app.parcellation, function(v, k, l) {
            var hexColor = v.fill;
            var f = new ol.Feature({
                geometry: new ol.geom.Polygon(v.path)
            });
            f.set('name', v.region);
            f.set('color', v.fill);
            f.setStyle(parcel_styles);
            parcel_features.push(f);
        });

        var parcel_src = new ol.source.Vector({wrapX: false, features: parcel_features});
        app.parcel_src = parcel_src;

        var parcel_layer = new ol.layer.Vector({
            source: parcel_src
        });
        app.parcel_layer = parcel_layer;
        app.parcel_opacity = 0.5;
        parcel_layer.setOpacity(app.parcel_opacity);
        /*
        layers.push(parcel_layer);
        layers.push(annotation_layer);

        Array.prototype.push.apply(layers, [
            layer_fe,
            layer_fr,
            layer_fb,
            layer_dy,
            layer_bda
        ]);
            layer_fe_inj,
            layer_fr_inj,
            layer_fb_inj,
            layer_dy_inj,
            layer_bda_inj
        ]);
        */
        var imgCenter = [imgWidth / 2, -imgHeight / 2];
        app.map_view = new ol.View({
            //zoom: typeof localStorage['last_zoom'] !== 'undefined' ? localStorage['last_zoom'] : 1,
            zoom: 1,
            maxZoom: meta.levels,
            projection: proj,
            center: imgCenter,
            extent: [0, -1.5 * imgHeight, 1.5 * imgWidth, 0]
            //extent: [0, 0, imgWidth, imgHeight]
        });
        var custom_controls = [];
        if (app.features_fe.length > 0) {
            custom_controls.push(new app.ToggleLayer({name: 'FE', index: 1, symbol: '\u25a0'}));
        }
        if (app.features_fr.length > 0) {
            custom_controls.push(new app.ToggleLayer({name: 'FR', index: 2, symbol: '\u25b2'}));
        }
        if (app.features_fb.length > 0) {
            custom_controls.push(new app.ToggleLayer({name: 'FB', index: 3, symbol: '\u25a0'}));
        }
        if (app.features_dy.length > 0) {
            custom_controls.push(new app.ToggleLayer({name: 'DY', index: 4, symbol: '\u25cf'}));
        }
        if (app.features_bda.length > 0) {
            custom_controls.push(new app.ToggleLayer({name: 'BDA', index: 5, symbol: '\u25cf'}));
        }
        if (app.logged_in) {
            custom_controls.push(new app.Annotation({}));
        }
        Array.prototype.push.apply(custom_controls, [
                //new ol.control.OverviewMap(),
                //new app.ToggleMeta({}),
                //new app.BackButton(),
                //new app.FlatButton(),
                //new app.ParcelButton(),
                mousePositionControl,
                scaleLine,
                new app.SagittalNav()
        ]);

        var baseTextStyle = {
            font: 'bold 16px Calibri,Arial,sans-serif',
            textAlign: 'center',
            textBaseline: 'middle',
            offsetX: 0,
            offsetY: -15,
            rotation: 0,
            fill: new ol.style.Fill({
                color: [0,0,0,1]
            }),
            stroke: new ol.style.Stroke({
                color: [255,255,255,0.8],
                width: 4
            })
        };

        var highlightStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [255,0,0,6],
                width: 2
            }),
            fill: new ol.style.Fill({
                color: [255,0,0,0.2]
            }),
            zIndex: 1
        });


        function styleFunction(feature, resolution) {
            var style;
            var geom = feature.getGeometry();
            if (geom.getType() == 'Polygon') {
                var text = feature.get('text');
                baseTextStyle.text = text;
                style = new ol.style.Style({
                    text: new ol.style.Text(baseTextStyle),
                    Fill: new ol.style.Fill({
                        color: [255,0,0,0.2]
                    }),
                    zIndex: 2
                });
            } else {
                style = highlightStyle;
            }

            return [style];
        }


        
        var featuresarr = new ol.Collection();
        var vsource = new ol.source.Vector({wrapX: false, features: featuresarr, useSpatialIndex: false});
        var overlay_layer = new ol.layer.Vector({
           // map: app.map,
            source: vsource,
            style2: new ol.style.Style({
                fill:new ol.style.Fill({
                    color: 'rgba(255,255,255,0.2)'
                }),
            style: styleFunction,
            stroke: new ol.style.Stroke({
                color:'#ffcc33',
                width:2
                }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color:'#ffcc33'
                    })
                })
            })
        });


        // var tempCol = new ol.Collection();
        // var tempSrc = new ol.source.Vector({wrapX: false, features: tempCol, useSpatialIndex: false});
        // var overlay_layer = new ol.layer.Vector({
        //     map: app.map,
        //     style: styleFunction,
        //     source: tempSrc
        // });


        layers.push(overlay_layer);
        if(app.fluolayer!=undefined) {
            layers.push(app.fluolayer);
        }

        app.custom_controls = custom_controls; //Added by Adam Lin
        app.map = new ol.Map({
            target: 'map',
            layers: layers,
            view: app.map_view,
            pixelRatio: 1,
            controls: ol.control.defaults({
                attribution: false
            }).extend(custom_controls),
            logo: false
        });
        
        app.map.addLayer(atlaslayer);

        app.map2 = new ol.Map({
	        target: 'zonemap',
	        controls: [],
	        layers: app.map.getLayers(),
	        view: app.map.getView(),
	    });
      

        /**/
        /* Add new function for overlay detected flour - Adam - during trip in CSHL 03.10.2017 . */ 
        /**/

        jsrc2.getImageMetadata(function() {
            var meta2 = jsrc2.getMeta();
            var imgWidth = meta2.width;
            var imgHeight = meta2.height;
            var pervious_coord =[];
            var current_coord =[];

            var imageLayer2 = new ol.layer.Tile({
                source: jsrc2,
                projection: app.proj,
                opacity:0.5,
            });
            app.imageLayer2 = imageLayer2;

            var imgCenter2 = [imgWidth / 2, -imgHeight / 2];

            app.map3_view = new ol.View({
                zoom: 1,
                maxZoom: meta2.levels,
                projection: app.proj,
                center: imgCenter2,
                extent: [0, -1.5 * imgHeight, 1.5 * imgWidth, 0]
            });
            app.map.addLayer(imageLayer2);
            app.fluolayer = imageLayer2;
        });


        var p_source = new ol.source.Vector({
            features: [] //point_feature]
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

        app.map.addLayer(p_layer);
        app.map.on('click',function(evt){
            var feature = app.map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
                    return feature;
            });
            if (feature) {
                var geometry = feature.getGeometry();
                var coord = geometry.getCoordinates();
            }
         });
        $(app.map.getViewport()).on('mousemove',function(e)
        {
        });
        
        var typeSelect = document.getElementById('mtype');
        var onoffSelect = document.getElementById('cellcount_onoffswitch');
        var draw;
        var regquery='';
        
        function addInteraction() 
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
                    app.map.addInteraction(draw);
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
            app.map.removeInteraction(draw);
            if($('#cellcount_onoffswitch:checkbox:checked').length == 0){
            	addInteraction();
			}
        };
        
        onoffSelect.onchange = function()
        {
        	if($('#cellcount_onoffswitch:checkbox:checked').length == 1){
            	app.map.removeInteraction(draw);
			}else{
				addInteraction();
			}
        }
        
        if($('#cellcount_onoffswitch:checkbox:checked').length == 0){
            addInteraction();
        }                                                                  

        //var button = document.getElementById("jsonbutton");
        //button.addEventListener("click",btnclick);
        //button.addEventListener("click",show_points);
        var coordfeature = '{"type":"FeatureCollection","features":[' +
         '{"type":"Feature","id":"currentmarking","properties":{"name":""},"geometry":{"type":"MultiPoint","coordinates":';
        function show_points()
        {
            if (typeSelect.value == 'All'){
                var select_type = 'all';
                regquery = '{"brainno": '+ br_no +',"sliceno":"'+slice_no+ '","countall":"'+ select_type + '"}';
            }
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
                        'geometry': {
                               'type': 'MultiPoint',
                            'coordinates': ptarr
                        }
                        }
                      ]
                    };                    
                    p_source.clear();
                    p_source.addFeatures(new ol.format.GeoJSON().readFeatures(geojsonObject));
                }
            });
        }
	



        /**************************END******************************/



        /********   new function for measurement - cell counting ******************/

        
        var measure_source = new ol.source.Vector({
            features: [] //point_feature]
        });

        var measure_vector = new ol.layer.Vector({
          source: measure_source,
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
              color: '#ffcc33',
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
        
        var sketch;
        var helpTooltipElement;
        var helpTooltip;
        var measureTooltipElement;
        var measureTooltip;     
        
        var continuePolygonMsg = 'Click to continue drawing the polygon';
        var continueLineMsg = 'Click to continue drawing the line';
        
        var pointerMoveHandler = function(evt) {
          if (evt.dragging) {
            return;
          }
          /** @type {string} */
          var helpMsg = 'Click to start drawing';
          /** @type {ol.Coordinate|undefined} */
          var tooltipCoord = evt.coordinate;
        
          if (sketch) {
            var output;
            var geom = (sketch.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
              output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
              helpMsg = continuePolygonMsg;
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
              output = formatLength( /** @type {ol.geom.LineString} */ (geom));
              helpMsg = continueLineMsg;
              tooltipCoord = geom.getLastCoordinate();
            }
            $('#dis_measure_txt').html("<p>Distance: <a style='color:yellow'>"+output+"</a></p>");
          }
        };
        

        var measureSelect = document.getElementById('measure_type');
        var draw; // global so we can remove it later
        
        app.map.addLayer(measure_vector);
        app.map.on('pointermove', pointerMoveHandler);

        function addmeasureInteraction() {
          var value = measureSelect.value;
          if (value == 'LineString' || value == 'Polygon'){
                    draw = new ol.interaction.Draw({
                            source: vsource,
                            type: (value),
                            style: new ol.style.Style({
                                fill: new ol.style.Fill({
                                  color: 'rgba(255, 255, 255, 0.2)'
                                }),
                                stroke: new ol.style.Stroke({
                                  color: 'rgba(152, 60, 202, 0.8)',
                                  lineDash: [10, 10],
                                  width: 2
                                }),
                                image: new ol.style.Circle({
                                  radius: 5,
                                  stroke: new ol.style.Stroke({
                                    color: 'rgba(0, 0, 0, 0.7)'
                                  }),
                                  fill: new ol.style.Fill({
                                    color: 'rgba(255, 255, 255, 0.2)'
                                  })
                                })
                            })
                    })
                                   
                  app.map.addInteraction(draw);
                  usingDivMeasureTooltip();
                  draw.on('drawstart',
                      function(evt) {
                        sketch = evt.feature;
                      }, this);
                
                  draw.on('drawend',
                      function(evt) {
                        measureTooltipElement.className = 'tooltip tooltip-static';
                        sketch = null;
                        measureTooltipElement = null;
                        usingDivMeasureTooltip();
                      }, this);
            }
        }

        function usingDivMeasureTooltip(){
            measureTooltipElement = document.createElement('div');
            measureTooltipElement.className = 'tooltip tooltip-measure';
            $('.tooltip .tooltip-measure').css({"position":"relative", "top":500,"left":505});
        }

        measureSelect.onchange = function(e) {
          app.map.removeInteraction(draw);
          addmeasureInteraction();
        };

        var formatLength = function(line) {
          var length = Math.round(line.getLength() * 100) / 100 / 2;
          var output;
          if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) +
                ' ' + 'mm';
          } else {
            output = (Math.round(length * 100) / 100) +
                ' ' + 'um';
          }
          return output;
        };

        var formatArea = function(polygon) {
          var area = polygon.getArea();
          var output;
          if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'mm<sup>2</sup>';
          } else {
            output = (Math.round(area * 100) / 100) +
                ' ' + 'um<sup>2</sup>';
          }
          return output;
        };
        
        /********           END          ******************/
            var highlightStyleCache = {};
            var featureOverlay = new ol.layer.Vector({
              source : new ol.source.Vector(),
              map: app.map,
              style: function(feature, resolution) {
                var text = resolution < 5000 ? feature.get('name') : '';
                if (!highlightStyleCache[text]) {
                  highlightStyleCache[text] = [new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: '#f00',
                  width: 1
                }),
                fill: new ol.style.Fill({
                  color: 'rgba(255,0,0,0.1)'
                }),
                text: new ol.style.Text({
                  font: '12px Calibri,sans-serif',
                  text: text,
                  fill: new ol.style.Fill({
                    color: '#ffffff'
                  }),
                  /*stroke: new ol.style.Stroke({
                    color: '#f00',
                    width: 3
                  })*/
                })
                  })];
                }
                return highlightStyleCache[text];
              }
            });

            var highlight;
            var displayFeatureInfo = function(pixel) {
                var feature = app.map.forEachFeatureAtPixel(pixel, 
                        function(feature, layer) {
                     return feature;
                });

              var info = document.getElementById('info');
              if (feature) {
                info.innerHTML = feature.getId() + ': ' + feature.get('name');
              } else {
                info.innerHTML = '--&nbsp;';
              }

              if (feature !== highlight) {
                if (highlight) {
                  featureOverlay.getSource().removeFeature(highlight);
                }
                if (feature) {
                  featureOverlay.getSource().addFeature(feature);
                }
                highlight = feature;
              }

            };


        app.map.on('pointermove', function(evt) {
          if (evt.dragging) {
            return;
          }
          var pixel = app.map.getEventPixel(evt.originalEvent);
          displayFeatureInfo(pixel);
        });

        app.map.on('click', function(evt) {
          displayFeatureInfo(evt.pixel);
        });
        




        app.map_inited = false;
        var view = app.map.getView();
        var extent = null;
        try {
            extent = JSON.parse(localStorage['last_extent']);
        } catch (e) {
            console.log('parsing last_extent error', e);
        }
        app.marmoset_id = brain_id + label;
        //console.log(app.marmoset_id, localStorage['last_marmoset_id'], app.marmoset_id == localStorage['last_marmoset_id']);
        if (extent !== null && app.marmoset_id == localStorage['last_marmoset_id']) {
            view.fit(extent, app.map.getSize());
        } 
        if (app.marmoset_id != localStorage['last_marmoset_id']) {
            localStorage['last_marmoset_id'] = app.marmoset_id;
        }
        app.map.on('change:size', function(evt) {
            if (!app.map_inited) {
                var map = evt.target;
                var view = map.getView();
                var extent = JSON.parse(localStorage['last_extent']);
                if (extent !== null) {
                    //view.fit(extent, map.getSize());
                    console.log('yes!');
                }
                app.map_inited = true;
            }
        });

        app.map.on('moveend', function(evt) {
            var map = evt.map;
            var view = map.getView();
            var extent = view.calculateExtent(map.getSize());

            left = extent[0];
            top_1 = extent[3];
            width = extent[2]-left;
            height = top_1 - extent[1];

            factor_x = 187.0/24000;
            factor_y = 150.0/18000;   
            
            width_f =  factor_x*width;
            height_f = factor_y*height;
            left_f = left*factor_x; 
            top_f =-top_1*factor_y; 
            if ( (left_f < 0 && width_f > 187) || (top_f < 0 && height_f > 140 ) ){
                $('#zone').css('display','none');      
            }
            else
            {
                $('#zone').css({'width':(width_f) + 'px','height':(height_f)+'px', 'left':(left_f)+'px', 'top':top_f+'px','display':'block'});
            }

            localStorage['last_extent'] = JSON.stringify(extent);
            localStorage['last_zoom'] = JSON.stringify(view.getZoom());
        });

        app.map_view.on('change:resolution', function(evt) {
            var view = evt.target;
            var map = app.map;
            var extent = view.calculateExtent(map.getSize());
            localStorage['last_extent'] = JSON.stringify(extent);
            localStorage['last_zoom'] = JSON.stringify(view.getZoom());
            /*var center = viewState.center;
            var projection = viewState.projection;
            var pointResolution =
                projection.getPointResolution(viewState.resolution, center);
                */
            var zoom  = evt.target.getZoom();
            if (zoom >= 5) {
            }
        });

        app.highlit_features = new ol.Collection();
        var highlight_style = new ol.style.Style({
            stroke: new ol.style.Stroke({color: [0, 0, 0, 1], width: 2}),
            fill: new ol.style.Fill({color: [255, 255, 255, 0]})
        });
        app.map.on('pointermove', function(browserEvent) {
            // first clear any existing features in the overlay
            //overlay_layer.getSource().clear(true);
            //app.highlit_features.clear(true);
            var coordinate = browserEvent.coordinate;
            var pixel = browserEvent.pixel;
            var itered_features = 0;
            app.map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                itered_features++;
                if (layer != parcel_layer) {
                    return;
                }
                var contour = new ol.Feature(new ol.geom.Polygon(feature.getGeometry().getCoordinates()));
                contour.setStyle(highlight_style);
                var to_remove = [];
                app.highlit_features.forEach(function(f) {
                    if (f == feature || f.getGeometry().getType() == 'Point') {
                        return;
                    } else {
                        f.unset('highlight');
                        to_remove.push(f);
                    }
                });
                _.each(to_remove, function(f) {
                    app.highlit_features.remove(f);
                });
                app.highlit_features.push(feature);
                feature.set('highlight', true);
                /*
                var geometry = feature.getGeometry();
                var point;
                switch (geometry.getType()) {
                    case 'MultiPolygon':
                        var poly = geometry.getPolygons().reduce(function(left, right) {
                            return left.getArea() > right.getArea() ? left : right;
                        });
                        point = poly.getInteriorPoint().getCoordinates();
                        break;
                    case 'Polygon':
                        point = geometry.getInteriorPoint().getCoordinates();
                        break;
                    default:
                        point = geometry.getClosestPoint(coordinate);
                        }
                        */       
                textFeature = new ol.Feature({
                    geometry: new ol.geom.Point(coordinate),
                    text: feature.get('name'),
                });
                overlay_layer.getSource().addFeature(contour);
                overlay_layer.getSource().addFeature(textFeature);
            });
            if (itered_features == 0) {
                app.highlit_features.forEach(function(f) {
                    f.unset('highlight');
                });
                app.highlit_features.clear();
            }
        });

        if (app.logged_in) {
            var modify = new ol.interaction.Modify({
                features: annotation_features,
                deleteCondition: function(event) {
                    return ol.events.condition.shiftKeyOnly(event) &&
                    ol.events.condition.singleClick(event);
                }
            });
            app.map.addInteraction(modify);
        }
    });
    
    /*  Atlas Viewer Addition Feature add on : Developed by Keerthi, IIT */
    //jsrc2.getImageMetadata(function() {

        // var meta2 = jsrc2.getMeta();
        // var imgWidth = meta2.width;
        // var imgHeight = meta2.height;

        // var imageLayer2 = new ol.layer.Tile({
        //     source: jsrc2,
        //     projection: app.proj,
        //     opacity:0.5,
        // });

        // var imgCenter2 = [imgWidth /2, -imgHeight / 2];

        // app.map_view2 = new ol.View({
        //     zoom: 1, 
        //     maxZoom: meta2.levels,
        //     projection: app.proj,
        //     center: imgCenter2,
        //     extent: [0, -1.5 * imgHeight, 1.5 * imgWidth, 0]
        // });

        //app.map.addLayer(imageLayer2);
        //app.map.addLayer(atlaslayer);

    //});
    /*  END of Atlas Viewer Addition Feature add on : Developed by Keerthi, IIT */


    //layers[1].setVisible(false);
    var update_flatmap_position = function() {
        var top = $(window).height() / 2 - $('#flatmap-image').height() / 2;
        var left = $(window).width() / 2 - $('#flatmap-image').width() / 2;
        $('#flatmap-holder').css({
            top: top,
            left: left
        });
    };
    $('#flatmap-image').load(function() {
        $('#flatmap-image-caption').text(app.flatmap_caption);
        $('#flatmap-holder').show();
        update_flatmap_position();
        $('#loading-monkey').hide();
    });
    $(window)
        .on('resize', function(e) {
            if (app.flatmap_on) {
                update_flatmap_position();
            }
        });
    $(document)
        .on('click.memo-edit', '#memo-edit .btn-save-annotation', function(e) {
            var uuid = $('#memo-edit').data('annotation_uuid');
            var memo = $('#memo-content').val();
            console.log('uuid', uuid);
            var f = app.annotation_uuid_lookup[uuid];
            f.set('memo', memo);
            $('#memo-text-' + uuid).text(memo);
        })
        .on('keydown', function(e) {
            switch (e.keyCode) {
                case 37: // left
                    if (app.flatmap_on) {
                        var count = $('#flatmap-ul li').length;
                        var index = app.flatmap_index;
                        index -= 1;
                        if (index < 0) {
                            index += count;
                        }
                        var flatmap_anchor = $('#flatmap-ul li:eq(' + index +') a');
                        var flatmap = $('#flatmap-image').attr('src', flatmap_anchor.attr('href'));
                        app.flatmap_caption = flatmap_anchor.data('caption');
                        app.flatmap_index = index;
                    } else {
                        if (!e.shiftKey) {
                            // left arrow
                            window.location.href = app.prev_section_with_cells_url;
                        } else {
                            // shift left
                            window.location.href = app.prev_section_url;
                        }
                    }
                    break;
                case 39: // right
                    if (app.flatmap_on) {
                        var count = $('#flatmap-ul li').length;
                        var index = app.flatmap_index;
                        index += 1;
                        if (index >= count) {
                            index -= count;
                        }
                        var flatmap_anchor = $('#flatmap-ul li:eq(' + index +') a');
                        var flatmap = $('#flatmap-image').attr('src', flatmap_anchor.attr('href'));
                        app.flatmap_caption = flatmap_anchor.data('caption');
                        app.flatmap_index = index;
                    } else {
                        if (!e.shiftKey) {
                            // right arrow
                            window.location.href = app.next_section_with_cells_url;
                        } else  {
                            // shift right
                            window.location.href = app.next_section_url;
                        }
                    }
                    break;
                case 27: // Esc
                    if (app.flatmap_on) {
                        app.flapmap_on = false;
                        $('#flatmap-holder').hide();
                        $('#flatmap-overlay').hide();
                        $('#loading-monkey').show();
                    } 
                    break;
                case 65: //'a'
                    var parcel_layer = app.parcel_layer; 
                    if (app.parcel_opacity >= 0) {
                        var op = parcel_layer.getOpacity();
                        op -= 0.1;
                        if (op < 0) {
                            op = 0;
                        }
                        app.parcel_opacity = op;
                        app.parcel_layer.setOpacity(op);
                    }
                    break
                case 68: //'d'
                    if (app.parcel_opacity >= 0) {
                        var parcel_layer = app.parcel_layer; 
                        var op = parcel_layer.getOpacity();
                        op += 0.1;
                        if (op > 1) {
                            op = 1;
                        }
                        app.parcel_opacity = op;
                        app.parcel_layer.setOpacity(op);
                    }
                    break
                case 83: //'s'
                    var parcel_layer = app.parcel_layer; 
                    app.parcel_opacity = - app.parcel_opacity;
                    if (app.parcel_opacity > 0) {
                        parcel_layer.setOpacity(app.parcel_opacity);   
                    } else {
                        parcel_layer.setOpacity(0);   
                    }
                    break
                default:
                    console.log('key code', e.keyCode);
                    break;
            }
        })
        /*
		.on('click', '.flatmap-link', function(e) {
            app.flatmap_on = true;
            e.preventDefault();
            var container = $('#flatmap-image-container');
            var index = $(this).data('index');
            app.flatmap_index = index;
            var flatmap_anchor = $('#flatmap-ul li:eq(' + index +') a');
            app.flatmap_caption = flatmap_anchor.data('caption');
            $('#flatmap-overlay').show();
            var flatmap = $('#flatmap-image').attr('src', flatmap_anchor.attr('href'));
        })
        .on('click', '#flatmap-holder,#flatmap-overlay', function(e) {
            app.flatmap_on = false;
            $('#flatmap-holder').hide();
            $('#flatmap-overlay').hide();
            $('#loading-monkey').show();
        });
		*/
        /*
        .on('mouseenter', '.reconstruction-preview', function(e) {
            var area = $(this).data('region');
            console.log('area', area);
            $('#reconstruction-thumbnail img')[0].src = 'http://www.3dbar.org:8080/getThumbnail?cafDatasetName=mbisc_11;structureName=' + area;
            $('#reconstruction-thumbnail')
                .css({left: $('#brain-meta').width() + $('#brain-meta').position().left + 10})
                .show();
        })
        .on('mouseleave', '.reconstruction-preview', function(e) {
            $('#reconstruction-thumbnail').hide();
        });
        */
    if (app.logged_in) {
        $('.info-mouse-position').show();
    }
});
