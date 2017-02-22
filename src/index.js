'use strict';

var DEFAULT_CONFIG = {
    root: null,
    grid: {
        show:true,
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    },
    axis: [{
            min: 'auto',
            max: 'auto',
            calc: 'add',
            size: 400
        },
        {
            min: 'auto',
            max: 'auto',
            calc: 'add',
            size: 400
        }
    ],
    resize:true,
    width: null,
    height: null,
    margin: {
        top: 20,
        right: 20,
        bottom: 25,
        left: 25
    },
    type: 'line',
    color: {
        stroke: "#000"
    },
    animation: {
        show: true,
        animate: true,
        time: 1000,
        type: 'easeLinear'
    },
    hooks:{
        animateStart:function(d){
        },
        animateEnd:function(){

        }
    }
};

class chartit {

    constructor(config) {
        var config = this.mergeDeep(DEFAULT_CONFIG, config);
        this.config = config;
        this.data = [];
    }

    draw(data) {
        var self=this;
        if(typeof data!== typeof undefined){
            self.data = data;
        }
        self.ranges = self.getRanges();
        var dimensions=this.getDimensions();
        if(self.config.resize===true){
            this.setResizeEvent();
        }
        self.svg = d3.select(self.config.root).append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);
        self.container=self.svg.append("svg:g").attr("transform", "translate(0,0)");
        self.drawAxis();
        if(self.config.animation.show===true){
            self.config.anim = d3.transition()
            .duration(self.config.animation.time)
            .ease(d3[self.config.animation.type])
            .on("start", function(d){self.config.hooks.animateStart(d)})
            .on("end", function(d){self.config.hooks.animateEnd(d)});
        }
        if (self.config.type === 'line') {
            self.drawLines();
        }
    }

    getDimensions() {
        var self=this;
        if(self.config.resize===true){

            var width=document.querySelector(self.config.root).clientWidth;
            self.config.width=width;
        
            var height=document.querySelector(self.config.root).clientHeight;
            self.config.height=height;
      
        }else{
            if(self.config.width===null){
                var width=document.querySelector(self.config.root).clientWidth;
                self.config.width=width;
            }else{
                var width=self.config.width;
            }
            if(self.config.height===null){
                var height=document.querySelector(self.config.root).clientHeight;
                self.config.height=height;
            }else{
                var height=self.config.height;
            }
        }
        return {height:height,width:width};
    }

    update(data){
        var self=this;
        if(typeof data!== typeof undefined){
            self.data = data;
            self.config.animation.animate=true;
        }else{
            self.config.animation.animate=false;
        }
        self.ranges = self.getRanges();
        var dimensions=this.getDimensions();
        self.svg
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);
        self.drawAxis();
        if (self.config.type === 'line') {
            self.drawLines();
        }
    }

    setResizeEvent() {
        var self=this;
        var resizeTimer;
        var interval = Math.floor(1000 / 60 * 10);
         
        window.addEventListener('resize', function (event) {
            if (resizeTimer !== false) {
                clearTimeout(resizeTimer);
            }
            resizeTimer = setTimeout(function () {
                self.update()
            }, interval);
        });
    }

    drawLines() {
        var self = this;
        var lines=self.container.selectAll(".line");
        var redraw=false;

        if(typeof this.lines!==typeof undefined && this.lines.length){
            redraw=true;
        }else{
            this.lines=[];
        }
        for (var j = 0; j < self.data.length; j++) {
            var x = self.ranges[0].axisScale;
            var y = self.ranges[1].axisScale;
            var line = d3.line()
                /*
                Multiple DataRows > 2
                for(var i=0;i<this.this.data[j][k].length;i++){
                    line.
                }*/
                .x(function (d, i) {
                    return x(d[0]) + self.config.margin.left;
                })
                .y(function (d) {
                    return y(d[1]) + self.config.margin.bottom;
                });
            var item = self.data[j];
            
            if(!redraw){
                var linet=self.container;
                linet=linet.append("svg:path");
                this.lines[j]=linet;
            }else{
                var linet=this.lines[j];
            }
                linet.attr("fill", "none")
                .attr("stroke", self.config.color.stroke)
                .attr("d", line(item)).classed("line", true).attr("stroke-dasharray", function (d) {
                    return this.getTotalLength()
                })
                .attr("stroke-dashoffset", function (d) {
                    return this.getTotalLength()
                })
        }
  
        if(self.config.animation.show===true&&self.config.animation.animate===true){
            self.container.selectAll(".line").transition(this.config.anim)
                .attr("stroke-dashoffset", 0);
        }else{
            self.container.selectAll(".line")
                .attr("stroke-dashoffset", 0);
        }
    }

    drawAxis() {
        //TODO Minus Offset
        var svgContainer = this.container;
        for (var i = 0; i < this.ranges.length; i++) {
            var redraw=false;
            if(typeof this.config.axis[i].axisGroup !== typeof undefined){
                redraw=true;
            }
            switch (i) {
                case 0:
                    var axisScale = d3.scaleLinear()
                        .domain([this.ranges[i].min, this.ranges[i].max])
                        .range([0, this.config.width]);
                    var axis = d3.axisBottom()
                        .scale(axisScale);
                    if(!redraw){
                        var AxisGroup = svgContainer
                            .append("g");
                        this.config.axis[i].axisGroup = AxisGroup;
                        
                    }else{
                        var AxisGroup = this.config.axis[i].axisGroup;
                    }
                    
                    AxisGroup.attr("class", "x axis")
                        .call(axis);

                    var bounding=AxisGroup._groups[0][0].getBBox();
                    this.config.axis[i].bounding = bounding;
                    
                    break;
                case 1:
                    var axisScale = d3.scaleLinear()
                        .domain([this.ranges[i].max, this.ranges[i].min])
                        .range([0, this.config.height]);
                    var axis = d3.axisLeft()
                        .scale(axisScale);
                    if(!redraw){
                        var AxisGroup = svgContainer
                            .append("g");
                        this.config.axis[i].axisGroup = AxisGroup;
                    }else{
                        var AxisGroup = this.config.axis[i].axisGroup;
                    }
                    AxisGroup
                        .attr("class", "y axis")
                        .call(axis);
                    var bounding=AxisGroup._groups[0][0].getBBox();
                    this.config.axis[i].bounding = bounding;
                    break;
                    //TODO
                case 2:
                    var axisScale = d3.scaleLinear()
                        .domain([this.ranges[i].min, this.ranges[i].max])
                        .range([this.ranges[i].min, this.config.axis[i].size]);
                    var axis = d3.axisRight()
                        .scale(axisScale);
                    if(!redraw){
                        var AxisGroup = svgContainer
                            .append("g");
                        this.config.axis[i].axisGroup = AxisGroup;
                    }else{
                        var AxisGroup = this.config.axis[i].axisGroup;
                    }
                    AxisGroup.attr("class", "x axis")
                        .attr("transform", "translate(0," + this.config.axis[i].size + ")")
                        .call(axis);
                    break;
                case 3:
                    var axisScale = d3.scaleLinear()
                        .domain([this.ranges[i].min, this.ranges[i].max])
                        .range([this.ranges[i].min, this.config.axis[i].size]);
                    var axis = d3.axisTop()
                        .scale(axisScale);
                    var AxisGroup = svgContainer
                        .append("g").attr("class", "x axis")
                        .attr("transform", "translate(0,0)")
                        .call(axis);
                    break;
            }
            this.ranges[i].axisScale = axisScale;
            this.ranges[i].axis = axis;
        }
        this.innerHeight=this.height;
        this.innerWidth=this.width;
        this.axisLeft=0;
        this.axisBottom=0;
        for (var i = 0; i < this.ranges.length; i++) {
            var AxisGroup = this.config.axis[i].axisGroup;
            switch (i) {
                case 0:
                        var axisLeft=this.config.axis[i+1].bounding.width;
                        var axisBottom=this.config.axis[i].bounding.height;
                        this.axisBottom+=axisBottom;
                        this.innerHeight-=axisBottom;
                        break;
                case 1:
                        var axisLeft=this.config.axis[i].bounding.width;
                        var axisBottom=this.config.axis[i-1].bounding.height;
                        this.axisLeft+=axisLeft;
                        this.innerWidth-=axisLeft;
                        case 2:
                    
                    break;
                case 3:
                    
                    break;
            }
        }
        for (var i = 0; i < this.ranges.length; i++) {
            var AxisGroup = this.config.axis[i].axisGroup;
            switch (i) {
                case 0:
                        this.ranges[i].axisScale=this.ranges[i].axisScale.range([this.axisLeft, this.config.width-(this.config.margin.left+this.axisLeft)]);
                        this.ranges[i].axis = d3.axisBottom()
                        .scale(this.ranges[i].axisScale);
                        AxisGroup.attr("transform", "translate(" + (this.config.margin.left) + "," + (this.config.margin.top-this.axisBottom+this.config.height) + ")").call(this.ranges[i].axis);
                    break;
                case 1:
                        this.ranges[i].axisScale=this.ranges[i].axisScale.range([this.axisBottom/2, this.config.height-(this.config.margin.top+this.axisBottom)]);
                        this.ranges[i].axis = d3.axisLeft()
                        .scale(this.ranges[i].axisScale);
                        AxisGroup.attr("transform", "translate(" + (this.config.margin.left+this.axisLeft) + "," + (this.config.margin.top) + ")").call(this.ranges[i].axis);
                    //TODO
                case 2:
                    
                    break;
                case 3:
                    
                    break;
            }
        }
    }

    getRanges() {
        var ranges = [];
        for (var i = 0; i < this.config.axis.length; i++) {
            var min = this.config.axis[i].min;
            var max = this.config.axis[i].max;
            if (min === 'auto' || max === 'auto') {
                for (var j = 0; j < this.data.length; j++) {
                    for (var k = 0; k < this.data[j].length; k++) {
                        var item = this.data[j][k][i];
                        if (min === 'auto' && max === 'auto') {
                            max = item
                        } else {
                            if (min === 'auto') {
                                if (max < item) {
                                    min = max;
                                    max = item;
                                } else {
                                    min = item;
                                }
                            } else {
                                if (item < min) {
                                    min = item;
                                }
                            }
                            if (max === 'auto') {
                                max = item;
                            } else {
                                if (item > max) {
                                    max = item;
                                }
                            }
                        }
                    }
                }
            }
            var axisRange = {
                min: min,
                max: max
            };
            if (this.config.axis[i].calc === 'add') {
                axisRange = this.addToRange(axisRange);
            }
            ranges.push(axisRange);
        }
        return ranges;
    }

    addToRange(axisRange) {
        var minlength = axisRange.min.toString().length;
        var minzeroes = Math.pow(10, minlength);
        var minadd = minzeroes / 10;
        var minnew = Math.round((axisRange.min - minadd) / (minzeroes / 10)) * (minzeroes / 10);
        if (axisRange.min >= 0) {
            if (minnew < 0 && minlength === 1) {
                minnew = 0;
            }
        }
        var maxlength = axisRange.max.toString().length;
        var maxzeroes = Math.pow(10, maxlength);
        var maxadd = maxzeroes / 10;
        var maxnew = Math.round((axisRange.max + maxadd) / (maxzeroes / 10)) * (maxzeroes / 10);
        if (axisRange.max >= 0) {
            if (maxnew < 0 && maxlength === 1) {
                maxnnew = 0;
            }
        }
        axisRange.min = minnew;
        axisRange.max = maxnew;
        return axisRange;
    }

    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
    }

    mergeDeep(target, source) {
        let output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, {
                            [key]: source[key]
                        });
                    else
                        output[key] = this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, {
                        [key]: source[key]
                    });
                }
            });
        }
        return output;
    }
}


module.exports = chartit;