define( ['qlik'], function (qlik) {
	'use strict';
	var app = qlik.currApp();

	// ****************************************************************************************
	// Dimensions & Measures
	// ****************************************************************************************
	var dimensions = {
		uses: "dimensions",
		min: 1,
		max: 3
	};

	var measures = {
		uses: "measures",
		min: 1,
		max: 1
	};

	var sorting = {
		uses: "sorting"
	};

	// ****************************************************************************************
	// Other Settings
	// ****************************************************************************************

	var bubbleSize = {
		ref: "props.bubbleSize",
		show: true,
		type: "array",
		component: "slider",
		label: "Range slider",
		min: 1,
		max: 100,
		step: 1,
		defaultValue: [5, 50]
	};

	var labels = {
		type: "string",
		component: "dropdown",
		label: "Show Labels",
		ref: "props.labels",
		options: [{
			value: "a",
			label: "All"
		}, 
		{
			value: "n",
			label: "None"
		}, 
		{
			value: "t",
			label: "By treshold"
		}],
		defaultValue: "t"
	};

	var labelTreshold = {
		type: "number",
		label: "Label Treshold",
		ref: "props.labelTreshold",
		defaultValue: "0.7",
		max: "1",
		min: "0",
		expression: "optional",
		show: function (data) { 
	    	return data.props.labels === "t";
	    }
	};

	var marginX = {
		type: "number",
		component: "slider",
		label: "X Margin",
		ref: "props.marginX",
		min: 0,
		max: 0.5,
		step: 0.01,
		defaultValue: 0.1
	}

	var marginY = {
		type: "number",
		component: "slider",
		label: "Y Margin",
		ref: "props.marginY",
		min: 0,
		max: 0.5,
		step: 0.01,
		defaultValue: 0.1
	}

	var custom = {
		type: "boolean",
		component: "switch",
		label: "Custom colors",
		ref: "props.customColors",
		options: [{
			value: true,
			label: "Custom"
		}, {
			value: false,
			label: "Auto"
		}],
		defaultValue: false
	};

	var colors = {
		type: "string",
		component: "dropdown",
		label: "Color by",
		ref: "props.colors",
		options: [{
			value: "s",
			label: "Single color"
		}, 
		{
			value: "d",
			label: "By dimension"
		}, 
		{
			value: "m",
			label: "By measure"
		}],
		show: function(data){
			return data.props.customColors
		},
		defaultValue: "s"
	};

	var colorDimension ={
		type: "string",
		component: "dropdown",
		label: "Color dimension",
		ref: "props.colorDimension",
		options: function (data) { 
			console.log(data)
			var options = data.qHyperCubeDef.qDimensions.map((dimension,index) =>{
				return {
					value: index,
					label: "Dimension "+(index+1)
				}
			});
	    	return options;
	    },
		show: function (data) { 
	    	return data.props.colors === "d" && data.props.customColors;
	    },
		defaultValue: "dimension0",
	};

	var singleColor = {
		label:"Color",
		component: "color-picker",
		ref: "props.singleColor",
		type: "integer",
		defaultValue: 1,
		show: function (data) { 
	    	return data.props.colors === "s"&& data.props.customColors ;
	    }
	};

	var colorScale = {
		type: "string",
		component: "dropdown",
		label: "Color scale",
		ref: "props.colorScale",
		options: function (data) { 
			return app.theme.getApplied().then(qTheme=>{
				return qTheme.properties.scales.map((scale,index)=>{
					return {
						value: index,
						label: scale.name
					}
				})
				
			});
			
	    },
		show: function (data) { 
	    	return data.props.colors === "m" && data.props.customColors;
	    },
		defaultValue:0,
	}

	var reverseColor= {
		type: "boolean",
		label: "Reverse color",
		ref: "props.reverseColor",
		defaultValue: false,
		show: function (data) { 
	    	return data.props.colors === "m" && data.props.customColors;
	    }
	}

	var colorSchema = {
		type: "string",
		component: "dropdown",
		label: "Color schema",
		ref: "props.colorschema",
		options: function (data) { 
			return app.theme.getApplied().then(qTheme=>{
				return qTheme.properties.palettes.data.map((palette,index)=>{
					return {
						value: index,
						label: palette.name
					}
				})
				
			});
			
	    },
		show: function (data) { 
	    	return data.props.colors === "d" && data.props.customColors;
	    },
		defaultValue:0,
	}

	var showLegend = {
		type: "boolean",
		component: "switch",
		label: "Show legend",
		ref: "props.showLegend",
		options: [{
			value: true,
			label: "Show"
		}, {
			value: false,
			label: "Hide"
		}],
		defaultValue: true,
		show: function(data){
			return data.props.colors !== "s" && data.props.customColors
		}
	};

	var legendPosition = {
		type: "string",
		component: "dropdown",
		label: "Legend position",
		ref: "props.legendPosition",
		options: [{
			value: "t",
			label: "Top"
		}, 
		// {
		// 	value: "b",
		// 	label: "Bottom"
		// }, 
		// {
		// 	value: "l",
		// 	label: "Left"
		// }, 
		{
			value: "r",
			label: "Right"
		}],
		defaultValue: "b",
		show: function (data) { 
	    	return data.props.colors !== "s" && data.props.customColors && data.props.showLegend;
	    }
	};

	var showLegendTitle = {
		type: "boolean",
		component: "switch",
		label: "Show legend title",
		ref: "props.showLegendTitle",
		options: [{
			value: true,
			label: "Show"
		}, {
			value: false,
			label: "Hide"
		}],
		defaultValue: true,
		show: function(data){
			return data.props.colors !== "s" && data.props.customColors && data.props.showLegend;
		}
	};

	var showAxisX = {
		type: "boolean",
		component: "switch",
		label: "Show X axis",
		ref: "props.showAxisX",
		options: [{
			value: true,
			label: "Show"
		}, {
			value: false,
			label: "Hide"
		}],
		defaultValue: true
	};
	var dimensionX = {
		type: "string",
		component: "dropdown",
		label: "X axis dimension",
		ref: "props.dimensionX",
		options: function (data) { 
			console.log(data)
			var options = data.qHyperCubeDef.qDimensions.map((dimension,index) =>{
				return {
					value: index,
					label: "Dimension "+(index+1)
				}
			});
	    	return options;
	    },
		show: function (data) { 
	    	return data.props.showAxisX;
	    },
		defaultValue: 0,
	};
	var showAxisTitleX = {
		type: "boolean",
		component: "switch",
		label: "Show X axis title",
		ref: "props.showAxisTitleX",
		options: [{
			value: true,
			label: "Show"
		}, {
			value: false,
			label: "Hide"
		}],
		defaultValue: true,
		show: function (data) { 
	    	return data.props.showAxisX;
	    }
	};

	var showAxisLabelX = {
		type: "boolean",
		component: "switch",
		label: "Show X axis label",
		ref: "props.showAxisLabelX",
		options: [{
			value: true,
			label: "Show"
		}, {
			value: false,
			label: "Hide"
		}],
		defaultValue: true,
		show: function (data) { 
	    	return data.props.showAxisX;
	    }
	};

	var axisLabelOrientationX = {

		type: "string",
		component: "dropdown",
		label: "X axis label orientation",
		ref: "props.axisLabelOrientationX",
		options: [{
			value: "o",
			label: "Horizontal"
		}, 
		{
			value: "t",
			label: "Tilted"
		}, 
		{
			value: "v",
			label: "Vertical"
		}],
		defaultValue: "o",
		show: function (data) { 
	    	return data.props.showAxisX;
	    }
	};

	var showAxisY = {
		type: "boolean",
		component: "switch",
		label: "Show Y axis",
		ref: "props.showAxisY",
		options: [{
			value: true,
			label: "Show"
		}, {
			value: false,
			label: "Hide"
		}],
		defaultValue: true
	};
	var dimensionY = {
		type: "string",
		component: "dropdown",
		label: "Y axis dimension",
		ref: "props.dimensionY",
		options: function (data) { 
			console.log(data)
			var options = data.qHyperCubeDef.qDimensions.map((dimension,index) =>{
				return {
					value: index,
					label: "Dimension "+(index+1)
				}
			});
	    	return options;
	    },
		show: function (data) { 
	    	return data.props.showAxisY;
	    },
		defaultValue: 1,
	};
	var showAxisTitleY = {
		type: "boolean",
		component: "switch",
		label: "Show Y axis title",
		ref: "props.showAxisTitleY",
		options: [{
			value: true,
			label: "Show"
		}, {
			value: false,
			label: "Hide"
		}],
		defaultValue: true,
		show: function (data) { 
	    	return data.props.showAxisY;
	    }
	};

	var showAxisLabelY = {
		type: "boolean",
		component: "switch",
		label: "Show Y axis label",
		ref: "props.showAxisLabelY",
		options: [{
			value: true,
			label: "Show"
		}, {
			value: false,
			label: "Hide"
		}],
		defaultValue: true,
		show: function (data) { 
	    	return data.props.showAxisY;
	    }
	}
	var axisLabelOrientationY = {
		type: "string",
		component: "dropdown",
		label: "Y axis label orientation",
		ref: "props.axisLabelOrientationY",
		options: [{
			value: "o",
			label: "Horizontal"
		}, 
		{
			value: "t",
			label: "Tilted"
		}, 
		{
			value: "v",
			label: "Vertical"
		}],
		defaultValue: "o",
		show: function (data) { 
	    	return data.props.showAxisY;
	    }
	};

	// ****************************************************************************************
	// Property Panel Definition
	// ****************************************************************************************

	// Appearance Panel
	var appearancePanel = {
		uses: "settings",
		items: {
			settings: {
				type: "items",
				label: "Presentation",
				items: {
					bubbleSize: bubbleSize,
					labels: labels,
					labelTreshold: labelTreshold,
					marginX: marginX,
					marginY: marginY
				}
			},
			color: {
				type: "items",
				label: "Colors and legend",
				items: {
					custom: custom,
					colors: colors,
					colorDimension:colorDimension,
					singleColor:singleColor,
					colorScale:colorScale,
					colorSchema:colorSchema,
					reverseColor: reverseColor,
					showLegend: showLegend,
					legendPosition: legendPosition,
					showLegendTitle:showLegendTitle
				}
			},
			xaxis: {
				type: "items",
				label: "X Axis",
				items: {
					showAxisX:showAxisX,
					dimensionX:dimensionX,
					showAxisTitleX:showAxisTitleX,
					showAxisLabelX:showAxisLabelX,
					axisLabelOrientationX:axisLabelOrientationX
				}
			},
			yaxis: {
				type: "items",
				label: "Y Axis",
				items: {
					showAxisY:showAxisY,
					dimensionY:dimensionY,
					showAxisTitleY:showAxisTitleY,
					showAxisLabelY:showAxisLabelY,
					axisLabelOrientationY:axisLabelOrientationY
				}
			}
		}
	};



	// Return values
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: dimensions,
			measures: measures,
			sorting: sorting,
			//addons: addons,
			appearance: appearancePanel

		}
	};

} );
