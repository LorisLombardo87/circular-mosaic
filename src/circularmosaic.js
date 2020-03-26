


define([
        'jquery',
        /*'underscore',*/
        './properties',
        './initialproperties',
        './lib/js/extensionUtils',
        'text!./lib/css/style.css',
        'qlik',

        './lib/js/d3.v4',
        './lib/js/d3.min',
        './lib/js/d3-scale-chromatic.v1.min'

        // 'https://d3js.org/d3.v4.js',
        // 'https://d3js.org/d3-scale-chromatic.v1.min.js'

        /*
        './lib/js/d3.v4',
        './lib/js/d3-scale-chromatic.v1.min',
        './lib/js/d3-interpolate.v1',
        './lib/js/d3-color.v1',
        './lib/js/d3-scale.v1'*/
],
function ($, /*_,*/ props, initProps, extensionUtils, cssContent, qlik, d3, d3v3) {
    'use strict';

    extensionUtils.addStyleToHeader(cssContent);

    //console.log('[Circular Mosaic] - Initializing');

    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
    d3.selection.prototype.moveToBack = function() {  
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        });
    };

    var data = [];
    var object_id = '';

    var xDimValues =[];
    var xDim = 0;
    var xDimLabel = '';
    var yDimValues =[];
    var yDim = 0;
    var yDimLabel = '';
    var maeasureName = '';
    var qMax = 0;
    var qMin = 0;
    var columns = [];
    var paletteIndex = 0;

    var target = null;
    var textBody = null;
    var labelM = null;
    var label0 = null;
    var label1 = null;
    var node = null;
    var axisXLables = null;
    var axisXTitle = null;
    var axisYLables = null;
    var axisYTitle = null;
    var simulation = null;
    var legend = null;
    var legendHolder = null;

    var size = null;
    var color = null;
    var verticalGroup = null;
    var orizontalGroup = null;

    var circleSizeRange = [];
    var maxr = 55;
    var minr = 7;
    var minviztresh = 0.7;
    var marginX = 0.1;
    var marginY = 0.1;
    var showXAxisTitle = true;
    var showAxisLabelX= true;
    var showXAxix = true;
    var showYAxisTitle = true;
    var showAxisLabelY= true;
    var showYAxix= true;
    var minrviz = minviztresh*maxr;
    var colorDim = 2;
    var colorType = 'd';
    var showLegend = true;
    var legendPosition = 'b';
    var showLegendTitle = true;
    var axisLabelOrientationX= 'o';
    var axisLabelOrientationY= 'o';

    var app = qlik.currApp();
    var qTheme = null;

    function getSizeScale(domain, range){
      return d3.scaleLinear()
        .domain(domain)
        .range(range)  // circle will be between 7 and 55 px wide
    }

    function getColorScale(palette){
      return  d3.scaleOrdinal(palette);
    }

    function getColorMeasureScale(domain,scale){
      return  d3.scaleQuantize()
        .domain(domain)
        .range(scale);
    }    

    function getVerticalGroup(dimValues,width){
      return d3.scaleLinear()
        .domain([0,dimValues.length-1])
        .range([width*marginX, width*(1-marginX)])
    }
    
    function getHorizontalGroup(dimValues,height){
      return d3.scaleLinear()
        .domain([0,dimValues.length-1])
        .range([height*marginY, height*(1-marginY)])
    }

    function getTextL(svgclass,d){
      var classes = 'text#circular-mosaic-text-'+d.rowno+' tspan.'+svgclass;
      var width = ($(classes).length>0) ? -1*$(classes)[0].textLength.baseVal.value :0;
      return width;
    } 

     // function to manage events on circles
     function mouseover(d) {

      d3.select('#circular-mosaic-text-'+d.rowno).moveToFront();

      var smallCircleText = textBody.filter(function(e){
        return e.index === d.index && size(d['measure'])<minrviz;
      });
      smallCircleText.style("opacity", 1);

      var dimension1Lables = label1.filter(function(e){
        return e.index === d.index;
      });
      dimension1Lables.style("opacity", 1);
    };

    function mousemove(d) {
      // console.log('[Circular Mosaic] -  mousemove',d);
    };

    function mouseleave(d) {

      d3.select('#circular-mosaic-text-'+d.rowno).moveToBack();

      var smallCircleText = textBody.filter(function(e){
        return e.index === d.index && size(d['measure'])<minrviz;
      });
      smallCircleText.style("opacity", 0);

      var dimension1Lables = label1.filter(function(e){
        return e.index === d.index;
      });
      dimension1Lables.style("opacity", 0);
    };

    function mouseenter(d){
      //console.log('[Circular Mosaic] -  mouseenter',d);
    };

    //function to manage events on the axis
    function mouseenterLabel(d){
      //console.log('[Circular Mosaic] -  mouseenterLabel',d);
      if( showYAxix && d3.select(this).classed('axis-x')){
      // simulation = d3.forceSimulation()
      //   .force("x", d3.forceX().strength(0.6).x( function(d){return showXAxix?verticalGroup(xDimValues.indexOf(d['dimension0'])):width/2; } ))
      //   .force("y", d3.forceY().strength(0.6).y( height/2 ));
      }

      else if( showXAxix && d3.select(this).classed('axis-y') ){
      // simulation = d3.forceSimulation()
      //     .force("x", d3.forceX().strength(0.6).x( width/2 ))
      //     .force("y", d3.forceY().strength(0.6).y( function(d){return showYAxix?orizontalGroup(yDimValues.indexOf(d['dimension1'])):height/2; } ))
      }
    //simulation.alpha(1).restart();
    }

    function mouseleaveLabel(d){
    //console.log('[Circular Mosaic] -  mouseleaveLabel',d);
    // simulation = d3.forceSimulation()
    //         .force("x", d3.forceX().strength(0.6).x( function(d){return showXAxix?verticalGroup(xDimValues.indexOf(d['dimension0'])):width/2; } ))
    //         .force("y", d3.forceY().strength(0.6).y( function(d){return showYAxix?orizontalGroup(yDimValues.indexOf(d['dimension1'])):height/2; } ))

    //simulation.alpha(1).restart();
    }     

    //functions to manage drag event
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(.03).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(.03);
      d.fx = null;
      d.fy = null;
    }

    function drawChart(width,height){
      //[Circular Mosaic] -  setting the D3 SVG scene 

      // append the svg object to the body of the page
      $('#'+object_id).empty();
      var svg = d3.select('#'+object_id)
          .append("svg")
          .attr("width", width) 
          .attr("height", height)
      
      

      // start D3 design
      target = svg.append("g")
              .selectAll("circle")
              .data(data)
              .enter();

      //svg text container for circles' label
      textBody = target.append("text")
              .attr('style','font-size  : '+qTheme.properties.object.label.value.fontSize+';fill: '+qTheme.properties.object.label.value.color+';')
              .attr('id',function(d){
                var vid = 'circular-mosaic-text-'+d.rowno;
                return vid;
              })
              .attr('class',function(d){
                var vclass = (size(d['measure'])<minrviz?'circular-mosaic-circle-small':'');
                return vclass;
              })
              .attr('opacity',function(d){ return size(d['measure'])<minrviz?0:1});

      
      
      //lable that holds the measure
      labelM = textBody.append("tspan")
      .attr('class',d=>{return 'measure';})                                                                        
      .text(d=>{return d['measure'] && !(isNaN(size(d['measure']))) ?(maeasureName+': '+d['measureText']):""; })
      .attr('style','font-size  : '+qTheme.properties.object.label.value.fontSize+';fill: '+qTheme.properties.object.label.value.color+';'); 
      
      //lable that holds always visible dimensions
      label0 = textBody.append("tspan")
      .attr('class',d=>{return 'dimension0';})
        .attr('dy','1.4em').attr('dx',d=>{return getTextL('measure'   ,d)})  
        .text(d=>{

          var labels = [];

          if((d['dimension0'] && !(isNaN(size(d['measure']))) ) && !showXAxix ){
            labels.push( d['dimension0']);
          }

          if((d['dimension1'] && !(isNaN(size(d['measure'])))) && !showYAxix){
            labels.push( d['dimension1']);
          }

          if((d['dimension2'] && !(isNaN(size(d['measure']))))){
            labels.push( d['dimension2']);
          }

          return labels.join(' - '); 
        })
        .attr('style','font-size  : '+qTheme.properties.object.label.value.fontSize+';fill: '+qTheme.properties.object.label.value.color+';');

        //lable that holds visible on hover dimensions  
        label1 = textBody.append("tspan")
        .attr('class',d=>{return 'dimension1';})
        .attr('dy','1.4em').attr('dx',d=>{
          var dclass = getTextL('dimension0',d)==0?'measure':'dimension0';
          var dy = getTextL(dclass,d) ;
          return dy;
        })  
        .style("opacity", 0)
        .text(d=>{
          var labels = [];

          if((d['dimension0'] && !(isNaN(size(d['measure']))) ) && showXAxix ){
            labels.push( d['dimension0']);
          }

          if((d['dimension1'] && !(isNaN(size(d['measure'])))) && showYAxix){
            labels.push( d['dimension1']);
          }
          return labels.join(' - '); 
        })
        .attr('style','font-size  : '+qTheme.properties.object.label.value.fontSize+';fill: '+qTheme.properties.object.label.value.color+';');

        // Initialize the circles
        node = target
            .append("circle")
            .attr("class", "node")
            .attr("r", function(d){ return size(d['measure'])})
            .attr("cx", function(d){return showXAxix?verticalGroup(xDimValues.indexOf(d['dimension'+xDim])):width/2; } )
            .attr("cy", function(d){return showYAxix?orizontalGroup(yDimValues.indexOf(d['dimension'+yDim])):height/2; })
            .style("fill", function(d){ return colorType=='m'?color(d['measure']):color(d["dimension"+colorDim]);})
            .style("fill-opacity", 1)
            .attr("stroke", "black")
            .style("stroke-width", 1)
            .on("mouseover", mouseover) // What to do when hovered
            .on("mousemove", mousemove)
            .on("mouseenter", mouseenter)
            .on("mouseleave", mouseleave)
            .call(d3.drag() // call specific function when circle is dragged
                 .on("start", dragstarted)
                 .on("drag", dragged)
                 .on("end", dragended));           

      // defining axis labels and titles
      if(showXAxix && showAxisLabelX){
        axisXLables = xDimValues.map(value=>{
          var axisXlable = svg.append("text")
            .attr('class','axis axis-x')
            // .attr('x',verticalGroup(xDimValues.indexOf(value)))
            // .attr('y',height-10)
            .attr('style','font-size  : '+qTheme.properties.object.axis.label.name.fontSize+';fill: '+qTheme.properties.object.axis.label.name.color+'; text-anchor: start')
            .text(value)
            .on("mouseover", mouseenterLabel)
            .on("mouseout", mouseleaveLabel)
            .attr('transform','translate('+verticalGroup(xDimValues.indexOf(value))+','+(height-20)+')rotate('+(axisLabelOrientationX=='v'?'-90':(axisLabelOrientationX=='t'?'-45':'0'))+')');
        })
      }

      if(showXAxix && showXAxisTitle){
        axisXTitle = svg.append("text")
          .attr('class','axis axis-title')
          .attr('x',10)
          .attr('y',height-10)
          .attr('style','font-size  : '+qTheme.properties.object.axis.title.fontSize+';fill: '+qTheme.properties.object.axis.title.color+'; text-anchor: middle')
          .text(xDimLabel);
      }
      
      if(showYAxix && showAxisLabelY){
        axisYLables = yDimValues.map(value=>{
          var axisYlable = svg.append("text") 
            .attr('class','axis axis-y')
            // .attr('x',10)
            // .attr('y',orizontalGroup(yDimValues.indexOf(value)))
            .attr('style','font-size  : '+qTheme.properties.object.axis.label.name.fontSize+';fill: '+qTheme.properties.object.axis.label.name.color+'; text-anchor: start"')
            .text(value)
            .on("mouseover", mouseenterLabel)
            .on("mouseout", mouseleaveLabel)
            .attr('transform','translate(10,'+orizontalGroup(yDimValues.indexOf(value))+')rotate('+(axisLabelOrientationY=='v'?'-90':(axisLabelOrientationY=='t'?'-45':'0'))+')');
        })
      }

      if(showYAxix && showYAxisTitle){
        axisYTitle = svg.append("text")  
        .attr('class','axis axis-title')
        .attr('x',10)
        .attr('y',10)
        .attr('style','font-size  : '+qTheme.properties.object.axis.title.fontSize+';fill: '+qTheme.properties.object.axis.title.color+';text-anchor: start')
        .text(yDimLabel);
      }

      if(showLegend && colorType=='d'){
        legendHolder =svg.append("g")
          
        legend = legendHolder.selectAll('g')
          .data(color.domain())
          .enter();
          

        
        legend.append('rect').attr('width', 15)
          .attr('x', function(d,i){
            return ((i+1) * 15)+5;
          })
          .attr('y', 50)
          .attr('height', 15)
          .style('fill', function(d){
            return color(d);
          });
        
        legend.append('text')
          .text(function(d){
            return d;
          })
          .attr('style','font-size  : '+qTheme.properties.object.legend.label.fontSize+';fill: '+qTheme.properties.object.legend.label.color+'; text-anchor: start"')
          .attr('transform',function(d,i){
            return  "translate("+(((i+1) * 15)+15)+",50)rotate(-90)";
          });
        
        if(showLegendTitle){
          legendHolder.append('text')
          .attr('style','font-size  : '+qTheme.properties.object.legend.title.fontSize+';fill: '+qTheme.properties.object.legend.title.color+';text-anchor: start')
          .text(columns[colorDim])
          .attr('transform',"translate(15,65)rotate(-90)");
        }

      }
      else if (showLegend && colorType=='m'){
        legendHolder =svg.append("g");
          
        legend = legendHolder.selectAll('g')
          .data(color.ticks())
          .enter();

        
        legend.append('rect').attr('width', 15)
          .attr('x', function(d,i){
            return ((i+1) * 15)+5;
          })
          .attr('y', 50)
          .attr('height', 15)
          .style('fill', function(d){
            return color(d);
          });
        
        legend.append('text')
          .text(function(d){
            return d;
          })
          .attr('style','font-size  : '+qTheme.properties.object.legend.label.fontSize+';fill: '+qTheme.properties.object.legend.label.color+'; text-anchor: start"')
          .attr('transform',function(d,i){
            return  "translate("+(((i+1) * 15)+15)+",50)rotate(-90)";
          });
        
        if(showLegendTitle){
          legendHolder.append('text')
          .attr('style','font-size  : '+qTheme.properties.object.legend.title.fontSize+';fill: '+qTheme.properties.object.legend.title.color+';text-anchor: start')
          .text(maeasureName)
          .attr('transform',"translate(15,65)rotate(-90)");
        }

      }

      if(showLegend && legendPosition == "t"){
        
      }
      else if(showLegend && legendPosition == "b"){
        legendHolder.attr("transform","translate(0,"+(height-50)+")")

      }
      else if(showLegend && legendPosition == "l"){
        legendHolder.attr("transform","translate(50,0)rotate(90)")

      }
      else if(showLegend && legendPosition == "r"){
        legendHolder.attr("transform","translate("+(width-50)+",0)rotate(90)")

      }


      // initialize simulations
      // defining forces
      simulation = d3.forceSimulation()
        .force("x", d3.forceX().strength(0.5).x( function(d){return showXAxix?verticalGroup(xDimValues.indexOf(d['dimension'+xDim])):width/2; } ))
        .force("y", d3.forceY().strength(0.5).y( function(d){return showYAxix?orizontalGroup(yDimValues.indexOf(d['dimension'+yDim])):height/2; } ))
        .force("collide", d3.forceCollide().strength(.6).radius(function(d){return size(d.measure)*1.2; })) // Force that avoids circle overlapping
        //.force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        //.force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0

      // Apply these forces to the nodes and update their positions.
      // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
      simulation
        .nodes(data)
        .on("tick", function(d){
          node
          .attr("cx", function(d){ return d.x; })
          .attr("cy", function(d){ return d.y; });

          textBody
          .attr("x", function(d){ return d.x+0.8*(size(d['measure'])); })
          .attr("y", function(d){ return d.y+(size(d['measure'])); });
        });
    }

    function prepareData(layout){
      var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix
      columns = []
      .concat(layout.qHyperCube.qDimensionInfo.map(dimension =>{
          return dimension.qFallbackTitle;
      }))
      .concat(layout.qHyperCube.qMeasureInfo.map(measure =>{
          return measure.qFallbackTitle;
      }));

      xDimValues =[];
      xDimLabel = (xDim==columns.length-1)?'':columns[xDim];

      yDimValues =[];
      yDimLabel = (yDim==columns.length-1)?'':columns[yDim];

      maeasureName = columns[columns.length-1];

      qMax = layout.qHyperCube.qMeasureInfo[0].qMax;
      qMin = layout.qHyperCube.qMeasureInfo[0].qMin;

      //console.info('[Circular Mosaic] - columns ', columns);

      data = qMatrix.map((row,i) =>{
          var dataRow = {};

          for (let colid=0; colid<row.length; colid++) {
              var value = isNaN(Number(row[colid].qNum))?row[colid].qText:row[colid].qNum;

              if(colid<layout.qHyperCube.qDimensionInfo.length){
                dataRow['dimension'+colid] = value;
              }
              else{
                dataRow['measure'] = value;
                dataRow['measureText'] = row[colid].qText;
              }
          }
          dataRow['rowno'] = i;
          
          return dataRow;
      });

      // only nodes with a measure
      data = data.filter(function(d){ 
        
        var filter = (!(isNaN(d['measure']))) && (d['measure']>0)

          if(filter && xDimValues.indexOf(d['dimension'+xDim])===-1){
                      xDimValues.push(d['dimension'+xDim]);
                  }

          if(yDim < columns.length && filter && yDimValues.indexOf(d['dimension'+yDim])===-1){
                      yDimValues.push(d['dimension'+yDim]);
          }

        return filter; 
      });

      //console.info('[Circular Mosaic] - data', data);

      //console.info('[Circular Mosaic] - xDimValues', xDimValues);
      //console.info('[Circular Mosaic] - yDimValues', yDimValues);
    }

    return {

        definition: props,

        initialProperties: initProps,

        snapshot: { canTakeSnapshot: true },

        resize : function( $element, layout ) {
          // set the dimensions of the graph
            var width = $element[0].offsetWidth;
            var height = $element[0].offsetHeight;

            verticalGroup = getVerticalGroup(xDimValues, width);
            orizontalGroup = getHorizontalGroup(yDimValues, height);              

            drawChart(width,height);
        },

        paint: function ( $element , layout ) {

            
            //console.info('[Circular Mosaic] - $element', $element);
            //console.info('[Circular Mosaic] - layout', layout);

            // set the dimensions of the graph
            var width = $element[0].offsetWidth;
            var height = $element[0].offsetHeight;

            //[Circular Mosaic] -  initializzation
            //console.log('[Circular Mosaic] - d3 version',d3.version);
            object_id =  'circular-mosaic-'+layout.qInfo.qId;

            $element.empty();
            var $container = $(document.createElement('div'));
            $container.addClass('circular-mosaic-container');
            $container.attr('id', object_id)

            $element.append($container);

            //visualization paramentes
            circleSizeRange = layout.props.bubbleSize;
            maxr = circleSizeRange[1];
            minviztresh = parseFloat(layout.props.labelTreshold);

            marginX = parseFloat(layout.props.marginX);
            marginY = parseFloat(layout.props.marginY);

            showXAxisTitle = layout.props.showAxisTitleX && layout.props.showAxisX;
            showAxisLabelX = layout.props.showAxisLabelX && layout.props.showAxisX;
            showXAxix = layout.props.showAxisX;
            axisLabelOrientationX = layout.props.axisLabelOrientationX;

            showYAxisTitle = layout.props.showAxisTitleY && layout.props.showAxisY;
            showAxisLabelY = layout.props.showAxisLabelY && layout.props.showAxisY;
            showYAxix= layout.props.showAxisY;
            axisLabelOrientationY = layout.props.axisLabelOrientationY;

            colorType = layout.props.colors;

            showLegend = layout.props.showLegend;
            legendPosition = layout.props.legendPosition;
            showLegendTitle = layout.props.showLegendTitle;

            if(layout.props.labels == "a"){
              minrviz = 0;
            }
            else if (layout.props.labels =="n"){
              minrviz = maxr+1;
            }
            else if (layout.props.labels =="t"){
              minrviz = minviztresh*maxr;
            }
            

            colorDim = layout.props.colorDimension;
            xDim = layout.props.dimensionX;
            yDim = layout.props.dimensionY;

            paletteIndex = parseInt(layout.props.colorschema);

             qTheme = null;

            (async()=>{ 

                //[Circular Mosaic] -  qlik data preparation

                qTheme = await app.theme.getApplied();
                //console.info('[Circular Mosaic] - qTheme', qTheme);

                prepareData(layout);

                // Size scale for circles
                size = getSizeScale([0, qMax],circleSizeRange)

                // Color palette from theme
                var palette = [];
                if(colorType=='d'){
                  palette = qTheme.properties.palettes.data[paletteIndex].type == 'pyramid'?qTheme.properties.palettes.data[paletteIndex].scale[qTheme.properties.palettes.data[paletteIndex].scale.length-1]:qTheme.properties.palettes.data[paletteIndex].scale;
                  color = getColorScale(palette);
                }
                else if(colorType=='m'){
                  var scale = qTheme.properties.scales[layout.props.colorScale].type == 'class-pyramid'? qTheme.properties.scales[layout.props.colorScale].scale[qTheme.properties.scales[layout.props.colorScale].scale.length-1]:qTheme.properties.scales[layout.props.colorScale].scale;
                  scale = layout.props.reverseColor? scale.reverse():scale;
                  color = getColorMeasureScale([qMin, qMax],scale);
                }
                else if(colorType=='s'){
                  palette.push(layout.props.singleColor.color);
                  color = getColorScale(palette);
                }

                // scale that gives a X and Y target position for each circle
                verticalGroup = getVerticalGroup(xDimValues, width);
                orizontalGroup = getHorizontalGroup(yDimValues, height);              

                drawChart(width,height);

            })();

        }
    };

});
