/* Kudos to Jeff Ward: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
$(function() {
    var app = window.app;
    app.toggleStatus = typeof localStorage.toggle_status !== 'undefined' ? JSON.parse(localStorage.toggle_status) : {FE: true, FR: true, FB: true, FB: true, BDA: true};
    app.toggleStatus.Pencil = true;
    app.annoated_region = [];

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

    var jsrc = new ol.source.Djatoka({
        url: app.url,
        image: app.rft_id,
    });
    var stroke_fe = new ol.style.Stroke({color: 'green', width: 0});
    var fill_fe = new ol.style.Fill({color: 'green'});
    var marker_lookup = function(res) {
        var micron_per_px = res / app.res;
        var ret = 0.016 / micron_per_px;
        console.log('marker width', ret);
        return ret;

    }
	/* 	End */
      	
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
        layers.push(parcel_layer);
        layers.push(annotation_layer);



        var imgCenter = [imgWidth / 2, -imgHeight / 2];
        app.map_view = new ol.View({
            //zoom: typeof localStorage['last_zoom'] !== 'undefined' ? localStorage['last_zoom'] : 1,
            zoom: 1,
            maxZoom: meta.levels + 1,
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
            if (geom.getType() == 'Point') {
                var text = feature.get('text');
                baseTextStyle.text = text;
                // this is inefficient as it could create new style objects for the
                // same text.
                // A good exercise to see if you understand would be to add caching
                // of this text style
                style = new ol.style.Style({
                    text: new ol.style.Text(baseTextStyle),
                    zIndex: 2
                });
            } else {
                style = highlightStyle;
            }

            return [style];
        }


        
        var featuresarr = new ol.Collection();
        var first_pass_length;
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

        var source_edit = new ol.source.Vector({
            wrapX: false,
            features: (new ol.format.GeoJSON()).readFeatures({'type': 'FeatureCollection', 'features': []})
        });
        var vector_edit = new ol.layer.Vector({
            source: source_edit,
            style: new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.2)'
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
                    radius: 4,
                    fill: null,
                    stroke: new ol.style.Stroke({
                       color: '#ff0000',
                       width: 2
                    }),
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
                color: '#9932CC',
                width: 2
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
              }),
              image: new ol.style.Circle({
                radius: 4,
                fill: null,
                stroke: new ol.style.Stroke({
                   color: '#9932CC',
                   width: 2
                }),
              })
            })
        });

        
        var deleted_ids = [];
        
        deleted_ids = getDeleteID();
        show_points();

        var delids = [];
        var dbdel = getDeleteID();

        layers.push(vector_deletions);
        layers.push(vector_data);
        layers.push(overlay_layer);
        layers.push(vector_edit);

        


        // var select = new ol.interaction.Select({ 
        //     wrapX: false, 
        // });

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

        app.map2 = new ol.Map({
	        target: 'zonemap',
	        controls: [],
	        layers: app.map.getLayers(),
	        view: app.map.getView(),
	    });
      

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
              font: '12px Calibri,sans-serif',
              stroke: new ol.style.Stroke({
                color: '#0000ff',
                width: 2
              })
            }),
        });

        function addMarkingInteraction(){
            typeSelect = document.getElementById('geomtype');
            var value = typeSelect.value;
            if (value !== 'None'){
                if (value == 'Polygon' || value == 'Point'){
                    draw = new ol.interaction.Draw({
                        source : source_edit,
                        type   : typeSelect.value,
                        freehand: typeSelect.value=='Polygon', //true,
                        style : draw_style,
                    });
                }else if (value == 'Anno_Polygon'){
                    draw = new ol.interaction.Draw({
                        source : source_edit,
                        type   : 'Polygon',
                        freehand: true,
                        //condition: ol.events.condition.singleClick,
                        //freehandCondition: ol.events.condition.noModifierKeys,
                        style : draw_style,
                    });
                }

                draw.on('drawend', function(evt) {
                    feature = evt.feature;
                    if(value == 'Anno_Polygon'){
                        swal({
                          title: "Input Annotated Region Name!",
                          text: "Please label annoated region with percise naming structure:",
                          type: "input",
                          showCancelButton: true,
                          closeOnConfirm: false,
                          animation: "slide-from-top",
                          inputPlaceholder: "Region Name"
                        },
                        function(inputValue){
                          if (inputValue === false) return false;
                          
                          if (inputValue === "") {
                            swal.showInputError("You need to write label name here!");
                            return false
                          }

                          if(check_input_label_name(inputValue) == 0){
                            swal.showInputError("There is no match label in atals!");
                            return false
                          }

                          swal("Please refresh page to view the annoated labels!", "You wrote: " + inputValue, "success");
                          console.info(inputValue);
                          ext = feature.getGeometry().getExtent();
                          geoj = JSON.parse((new ol.format.GeoJSON()).writeFeature(feature));
                          geoj.properties = {'name': inputValue, 'acronym':''};
                          
                          app.annoated_region.push(geoj);
                          kinks = turf.kinks(turf.simplify(geoj));
                        });
                    }else{
                        if(feature.getGeometry().getType()=='Point') 
                            return;

                        ext = feature.getGeometry().getExtent();
                        geoj = JSON.parse((new ol.format.GeoJSON()).writeFeature(feature));
                        kinks = turf.kinks(turf.simplify(geoj));
                         

                        if (ext[2]-ext[0] > 120 || ext[3]-ext[1]>120 || ext[2]-ext[0]<6 || ext[3]-ext[1]<6 || kinks.features.length > 0) {
                                //vector_edit.getSource().removeFeature(feature);
                        }
                    }
                });

                vector_edit.on('change', function() { 
                    updatecounts();
                });

                app.map.addInteraction(draw);
               
            }
        }
              
        document.getElementById('geomtype').onchange = function(){
            app.map.removeInteraction(draw);
            addMarkingInteraction();
        }

        var intSelect = document.getElementById('inttype');
        intSelect.onchange=function() {
            $('#gtypesel').css('display','none');
            if(intSelect.value=="Delete"){
              app.map.removeInteraction(draw);
              //app.map.addInteraction(select);
              $('#Toggle2').prop('checked',true);
              $('#Toggle').prop('checked',true);
            }
            else if(intSelect.value=='Draw') {
              $('#Toggle2').prop('checked',true);
              $('#gtypesel').css('display','block');
              //app.map.removeInteraction(select);
                //map.addInteraction(draw);
                addMarkingInteraction();
            }
            else {
              //app.map.removeInteraction(select);
              app.map.removeInteraction(draw);
            }
        };

        app.map.on('click', function(evt) {
            if (evt.dragging) return;
                if (intSelect.value!='Delete') return;

                var pixel = app.map.getEventPixel(evt.originalEvent);
                var feature = app.map.forEachFeatureAtPixel(pixel, 
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
            if(label == 'N'){
                vector_edit.getSource().removeFeature(feature);      
                vector_deletions.getSource().addFeature(feature);  
            }else{
                vector_data.getSource().removeFeature(feature);
                vector_deletions.getSource().addFeature(feature);  
            }
            
          }
        }
            
        $("#added_features").click(function(event){
            event.preventDefault(); 
            alert("Download New Marking Files");
            save_data(0);
        });

        $("#saved_features").click(function(event){
            event.preventDefault();
            var r = confirm("Do you save to continue:");
            if (r == true){
                save_data(1);
            }
        });

        function save_data(stat_comp){
            features_new = vector_edit.getSource().getFeatures();
            features_del = vector_deletions.getSource().getFeatures();
            var del_feat_id = [];
            var del_feat_coordiate = [];       
            var added_features = [];
            var added_features_new_cooridate = [];
            for ( var i in features_del){
                del_feat_id.push(features_del[i].getId());
                del_feat_coordiate.push(features_del[i].getGeometry().j);
            }

            for( var i in features_new){
                added_features.push(new ol.format.GeoJSON().writeFeature(features_new[i]));
                added_features_new_cooridate.push(features_new[i].getGeometry().j);
            }
                                
            //feature_info = {"del_id":JSON.stringify(del_feat_id),"tileno":"94_40","added_feat":"["+added_features.toString()+"]","completed":stat_comp.toString(),"start_time":1488871972.57};
            if (stat_comp == 0){
                if (del_feat_coordiate.length != 0 || added_features_new_cooridate.length != 0){
                    if(label=='N'){
                        finalstring = '';
                        for (var i=0; i < added_features.length; i++){
                            var temp_array = JSON.parse(added_features[i]);
                            var temp_string = JSON.stringify(temp_array.geometry.coordinates);
                            var final_array_string = temp_string.slice(1, -1);
                            finalstring = finalstring + final_array_string;
                            if (i != added_features.length - 1){
                                finalstring = finalstring + ',';
                            }
                        }
                        saveTextAsFile('Del:'+ JSON.stringify(del_feat_coordiate) + '\\\n' +'Add:'+ finalstring, 'Marking-'+slice_no+'.txt'); 
                    }else{
                        saveTextAsFile('Del:'+ JSON.stringify(del_feat_coordiate) + '\\\n' +'Add:'+ JSON.stringify(added_features_new_cooridate), 'Marking-'+slice_no+'.txt'); 
                    }
                }
            }else{
                if(label == 'N'){
                    finalstring = '';

                    if(features_new.length - app.annoated_region.length >= 1){
                        var count_object = features_new.length - app.annoated_region.length;
                        for (var i=0; i < count_object; i++){
                            geoj = JSON.parse((new ol.format.GeoJSON()).writeFeature(features_new[i]));                          
                            app.annoated_region.push(geoj);
                        }
                    }

                    for (var i=0; i < app.annoated_region.length; i++){
                        var label_name = [];
                        if(app.annoated_region[i].properties != null){
                            if(isNaN(app.annoated_region[i].geometry.coordinates[0][app.annoated_region[i].geometry.coordinates[0].length -1][0]) == false){
                                label_name.push(app.annoated_region[i].properties.name);
                                label_name.push(app.annoated_region[i].properties.acronym);
                                app.annoated_region[i].geometry.coordinates[0].push(label_name);
                            }
                        }else{
                            app.annoated_region[i].geometry.coordinates[0].push(['null','']);
                        }

                        var temp_string = JSON.stringify(app.annoated_region[i].geometry.coordinates)
                        var final_array_string = temp_string.slice(1, -1);
                        finalstring = finalstring + final_array_string;
                        if (i != app.annoated_region.length - 1){
                            finalstring = finalstring + ',';
                        }
                    }

                    finalstring = finalstring.replace(/"/g, "'");
                    regquery1 = '{"brainno": ' + br_no + ',"sliceno":"' + slice_no + '","del_id":"' + JSON.stringify(del_feat_id) + '", "add_id": "'+ finalstring + '"}';
                }else{
                    regquery1 = '{"brainno": ' + br_no + ',"sliceno":"' + slice_no + '","del_id":"' + JSON.stringify(del_feat_id) + '", "add_id": "'+ JSON.stringify(added_features_new_cooridate) + '"}';
                }

                $.ajax({
                    type : "POST",
                    url  : "/openlayers/postnewcellcounts.php",
                    data: {'qry' :regquery1},
                    success :function(result){
                        dirty = false;
                        console.log(result);
                    },
                });
            }
        }

        function saveTextAsFile(coordiate_data, filename)
        {
            var textToSave = coordiate_data;
            var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
            var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
            var fileNameToSaveAs = filename;
         
            var downloadLink = document.createElement("a");
            downloadLink.download = fileNameToSaveAs;
            downloadLink.innerHTML = "Download File";
            downloadLink.href = textToSaveAsURL;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
         
            downloadLink.click();
        }

        function getDeleteID(){
            var returnvalue;
            var regquery = '{"brainno": '+ br_no +',"sliceno":"'+slice_no+ '"}';

            $.ajax({
                type : "POST",
                url  : "/openlayers/postdeletcellcounts.php",
                data: {'qry' :regquery},
                async: false,
                success :function(result){
                    returnvalue = result;
                },
            });
            return returnvalue;
        }

        function getAddedID(){
            var returnvalue;
            var regquery = '{"brainno": '+ br_no +',"sliceno":"'+slice_no+ '"}';

            $.ajax({
                type : "POST",
                url  : "/openlayers/postaddcellcounts.php",
                data: {'qry' :regquery},
                async: false,
                success :function(result){
                    if(result =='s'){
                        returnvalue = '';
                    }else if(result !=''){
                        if(label =='N'){
                            result = result.replace(/'/g,'"');
                            returnvalue = JSON.parse("[" + result + "]");
                        }else if (label =='F'){
                            returnvalue = JSON.parse(result);
                        }
                        returnvalue = eval(returnvalue);
                    }else{
                        returnvalue = '';
                    }
                    
                },
            });
            return returnvalue;
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
           dirty = false;
        });


        /**/
        /* Add new function for cell counting mathod from Keerith. */ 
        /**/

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

        /*
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
        */
        //var button = document.getElementById("jsonbutton");
        //button.addEventListener("click",btnclick);
        //button.addEventListener("click",show_points);
        var coordfeature = '{"type":"FeatureCollection","features":[' +
         '{"type":"Feature","id":"currentmarking","properties":{"name":""},"geometry":{"type":"MultiPoint","coordinates":';
        function show_points()
        {
            reg = "";
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
            		if(label =='F'){
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
                                        
                        ptarr = jsmesg;
                    
                        // retrive all cell counted point with delected points.
                        var init_cell_json =[];
                        for (var i=0; i< ptarr.length; i++){
                            init_cell_json[i]=
                                {
                                    "type":"Feature",
                                    "id":i+1,
                                    "geometry":{
                                        "type":"Point",
                                        "coordinates":ptarr[i]
                                    }
                                }
                        }
                        var geojsonObject = {"type":"FeatureCollection","features":init_cell_json};

                        var json_data = (new ol.format.GeoJSON()).readFeatures(geojsonObject);
                        first_pass_length = json_data.length;
                        for (var i in json_data){
                            if (deleted_ids !=[]){
                                deleted_ids = eval(deleted_ids);      
                            }

                            if (deleted_ids.indexOf(json_data[i].getId()) !=-1){
                                vector_deletions.getSource().addFeature(json_data[i]);
                            } 
                            else{
                                vector_data.getSource().addFeature(json_data[i]);
                            }
                        }
                    }else{
                        ptarr = [];
                    }

                    add_json_id = getAddedID();

                    if (add_json_id != ''){
                        var init_cell_add_json =[];
                        if(ptarr.length == 0 && label == 'N'){
                            if(isNaN(add_json_id[0][add_json_id[0].length - 1][0]) == true || (add_json_id[0][add_json_id[0].length - 1][0]) != ''){
                                for (var i = ptarr.length + 1; i < ptarr.length + 1 + add_json_id.length; i++){
                                    var pro_name = add_json_id[i-1][add_json_id[i-1].length - 1][0];
                                    var color_code = retrive_label_color_code(pro_name);
                                    var name_code = retrive_label_name(pro_name);
                                    var pro_acronym = add_json_id[i-1][add_json_id[i-1].length - 1][1];
                                    add_json_id[i-1].pop();
                                    init_cell_add_json[i - ptarr.length -1]=
                                        {
                                            "type":"Feature",
                                            "id":i,
                                            "properties":{
                                                "name":name_code,
                                                "acronym": color_code
                                            },
                                            "geometry":{
                                                "type":"Polygon",
                                                "coordinates":[add_json_id[i-1]]
                                            }
                                        }
                                }
                            }else{
                               for (var i = ptarr.length + 1; i < ptarr.length + 1 + add_json_id.length; i++){
                                    init_cell_add_json[i - ptarr.length -1]=
                                        {
                                            "type":"Feature",
                                            "id":i,
                                            "geometry":{
                                                "type":"Polygon",
                                                "coordinates":[add_json_id[i-1]]
                                            }
                                        }
                                } 
                            }
                            
                        }else{
                            for (var i = ptarr.length + 1; i < ptarr.length + 1 + add_json_id.length; i++){
                                init_cell_add_json[i - ptarr.length -1]=
                                    {
                                        "type":"Feature",
                                        "id":i+1,
                                        "geometry":{
                                            "type":"Point",
                                            "coordinates":add_json_id[i - ptarr.length -1]
                                        }
                                    }
                            }
                        }
                        var geojsonAddedObject = {"type":"FeatureCollection","features":init_cell_add_json};
                        console.info(geojsonAddedObject);
                        // retrive additional manaul marking points
                        var json_data_added = (new ol.format.GeoJSON()).readFeatures(geojsonAddedObject);
                        for (var i in json_data_added){
                            if(json_data_added != 0){
                                var rgb_color = 'rgba(' + json_data_added[i].getProperties().acronym + ' 0.5)';
                                rgb_color = rgb_color.replace(/ /g, ',');
                                style = new ol.style.Style({
                                    fill: new ol.style.Fill({
                                        color: rgb_color
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
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: '#ffcc33',
                                        width: 2
                                    })
                                });
                                
                                vector_edit.getSource().addFeature(json_data_added[i]);
                                json_data_added[i].setStyle(style);

                            }
                        }
                    }                 
                    updatecounts();
                }
            });
        }
	



        /**************************END******************************/



        /********   new function for measurement ******************/

        
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
        


        // atlas - manual detection label overlay style and functions
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
              font: '15px Calibri,sans-serif',
              text: text,
              fill: new ol.style.Fill({
                color: '#330033'
              }),
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
            var region_name_info = document.getElementById('region_name_info');
            if(label != 'F'){            
                if (feature) {
                    //info.innerHTML = feature.getId() + ': ' + feature.get('name');
                    info.innerHTML = feature.get('name'); // remove id
                    region_name_info.innerHTML = "<label>"+feature.get('name')+"</label>"; 
                }else{
                    info.innerHTML = '--&nbsp;';
                    region_name_info.innerHTML = '&nbsp;';
                }
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

        //end of atlas manual detection and fucntions/styles


        app.map_inited = false;
        var view = app.map.getView();
        var extent = null;
        try {
            extent = JSON.parse(localStorage['last_extent']);
        } catch (e) {
            console.log('parsing last_extent error', e);
        }
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
        .on('mousemove', function(e){
                $('#region_name_info').css({
                   left:  e.pageX - 40,
                   top:   e.pageY - 30,
                   position: "absolute",
                   zIndex: 9999
                });
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
    if (app.logged_in) {
        $('.info-mouse-position').show();
    }
});
