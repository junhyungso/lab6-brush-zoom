export default function AreaChart(container){

    const margin = { top: 50, right: 30, bottom: 30, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    const brush = d3
    .brushX()
    .extent([[margin.left,margin.top],[width + margin.left, height + margin.top]])
    .on('brush', brushed)
    .on('end', brushed);

    const listeners = { brushed: null };

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${margin.left}, ${height+margin.top})`);

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left} , ${margin.top})`);

    svg.append("g")
    .attr('class', 'brush')
    .call(brush);
    
    function brushed(event) {
        if (event.selection) {
          listeners["brushed"](event.selection.map(d=> xScale.invert(d-margin.left)));
        }
      }
    function unbrushed(event) {
        if (event.selection) {
          listeners["brushed"]([xScale.invert(0),xScale.invert(width)])
            // event.selection.map(d=> xScale.invert(d-margin.left)));
        }
      }

    function update(data){ 
        xScale.domain(d3.extent(data, d=>d.date))
        yScale.domain([0, d3.extent(data, d=>d.total)[1]])

        const area = d3.area()
            // .defined(function(d) { return d.average >= 0; })
            .x(function(d) { return xScale(d.date)+margin.left; })
            .y0(yScale(0)+margin.top) 
            .y1(function(d) { return yScale(d.total)+margin.top; })


        svg.append('path')
        .datum(data)
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill', 'blue');
        
        const xAxis = d3.axisBottom().scale(xScale);
        svg.select('.x-axis')
        .call(xAxis)

        const yAxis = d3.axisLeft().scale(yScale).ticks(3);
        svg.select('.y-axis')
        .call(yAxis)
        // update scales, encodings, axes (use the total count)
        
    }
    function on(event, listener){
        listeners[event] = listener;
    }

    return {
        update,
        on
         // ES6 shorthand for "update": update
    };
}