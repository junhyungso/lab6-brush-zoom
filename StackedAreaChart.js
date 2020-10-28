export default function StackedAreaChart(container) {
    const margin = { top: 50, right: 30, bottom: 30, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    let selected = null, xDomain, data;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},0)`);


    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)// the size of clip-path is the same as
        .attr("height", height); // the chart area
    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`);

    svg.append("g")
        .attr("class", "y-axis")
        // .attr("transform", `translate(0 , ${margin.top})`);


    function update(_data){
        data = _data;
        const keys = selected ? [selected] : data.columns.slice(1)

        const stackData = d3.stack()
            .keys(keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);
        const stackedData = stackData(data)
        xScale.domain(xDomain? xDomain : d3.extent(data, d=>d.date));
        yScale.domain([0, 
            d3.max(stackedData, 
                d => d3.max(d, d => d[1]) // compute the max of the nested array using y1 or d[1]
            )
        ])
        color.domain(keys)

        const area = d3.area()
            .x(d => xScale(d.data.date))
            .y0(d=> yScale(d[0])) 
            .y1(d => yScale(d[1]))

        if(selected){
            area.y0(d=>yScale(0)) 
        }
        const areas = svg.selectAll(".area")
            .data(stackedData, d => d.key);

        areas.enter()
            .append("path")
            .attr('class', 'area')
            .attr("fill", ({key}) => color(key))
            .attr("clip-path", "url(#clip)")
            .on("mouseover", (event, d, i) => tooltip.text(d.key))
            .on("mouseout", (event, d, i) => tooltip.text(""))
            .on("click", (event, d) => {
                if (selected === d.key) {
              selected = null;
            } else {
                selected = d.key;
            }
            update(data); // simply update the chart again
        })
        .merge(areas)
        .attr("d", area);
        
        areas.exit().remove();
        
        const xAxis = d3.axisBottom().scale(xScale);
        svg.select('.x-axis')
        .call(xAxis)

        const yAxis = d3.axisLeft().scale(yScale);
        svg.select('.y-axis')
        .call(yAxis)

        const tooltip = svg
            .append("text")
            .attr('class', 'axis-title')
            .attr('x', margin.left)
            .attr('y', margin.right)
            .text("")  
            .attr("font-size", "14px")
    
    }

    function filterByDate(range){
        xDomain = range;
        update(data);
    }
    return {
        update,
        filterByDate
    }
}