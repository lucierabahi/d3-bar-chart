// Select the div and append svg
const svg = d3
    .select('.canvas')
    .attr('align', 'center')
    .append('svg')
    .attr('width', 800)
    .attr('height', 400);

// Create margins and dimensions of the graph
const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 800 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

// Create and append the graph
const graph = svg
    .append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Create x and y axis groups
const xAxisGroup = graph
    .append('g')
    .attr('transform', `translate(0, ${graphHeight})`)
    .attr('id', 'x-axis');

const yAxisGroup = graph.append('g').attr('id', 'y-axis');

const tooltip = d3
    .select('.tooltip')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);

// Retrieve the data
d3.json(
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
).then(data => {
    // Create array of objects
    const objFromArray = array => {
        const dataset = [];

        class Object {
            constructor(date, gdp) {
                this.date = date;
                this.gdp = gdp;
            }
        }

        array.forEach((date, i) => {
            let newObj = new Object(date[0], array[i][1]);
            dataset.push(newObj);
        });
        return dataset;
    };

    const dataset = objFromArray(data.data);

    // Create linear scale
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(dataset, dataset => dataset.gdp)])
        .range([graphHeight, 0]);

    // Create band scale
    const x = d3
        .scaleBand()
        .domain(dataset.map(item => item.date))
        .range([0, graphWidth])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    // Join the data to rects
    const rects = graph.selectAll('rect').data(dataset);

    rects
        .attr('width', x.bandwidth)
        .attr('height', dataset => graphHeight - y(dataset.gdp))
        .attr('fill', 'orange')
        .attr('x', dataset => x(dataset.date))
        .attr('y', dataset => y(dataset.gdp))
        .attr('class', 'bar');

    // Append the enter selection to the DOM
    rects
        .enter()
        .append('rect')
        .attr('width', x.bandwidth)
        .attr('height', dataset => graphHeight - y(dataset.gdp))
        .attr('fill', 'orange')
        .attr('x', dataset => x(dataset.date))
        .attr('y', dataset => y(dataset.gdp))
        .attr('class', 'bar')
        .on('mouseover', function(dataset, i) {
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 0.9);
            tooltip
                .html(
                    `Date: ${dataset.date} </br>Value: $ ${dataset.gdp} Billion`
                )
                .attr('data-date', dataset.date)
                .style('transform', 'translateY(100px)');
        })
        .on('mouseout', function(dataset) {
            tooltip
                .transition()
                .duration(200)
                .style('opacity', 0);
        });

    // Create and call the axis
    const xAxis = d3
        .axisBottom(x)
        .scale(x)
        .tickValues(
            x.domain().filter(function(dataset, i) {
                return !(i % 20);
            })
        )
        .tickFormat(dataset =>
            dataset.replace(
                /\b\D(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])\b/gm,
                ''
            )
        );

    const yAxis = d3
        .axisLeft(y)
        .ticks(10)
        .tickFormat(dataset => `$ ${dataset} bn`);

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    xAxisGroup
        .selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end')
        .attr('fill', 'orange');

    const ticks = d3.selectAll('.tick text');
    ticks.attr('class', 'tick');
});
