const w = 900;
const h = 460;
const padding = 60;
const GDP_DATA_URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

// load data
const loadDataSeries = async () => {
  const response = await fetch(GDP_DATA_URL);
  const json = await response.json();

  return json.map((item) => ({
    ...item,
    time: new Date(0, 0, 0, 0, 0, item.Seconds),
  }));
};

const render = async (dataSeries) => {
  const barWidth = graphWidth / dataSeries.length;

  // create xAxis
  const xScale = d3.scaleLinear();
  xScale.domain([
    d3.min(dataSeries, (d) => d.Year) - 1,
    d3.max(dataSeries, (d) => d.Year) + 1,
  ]);
  xScale.range([padding, graphWidth - padding]);

  // create yAxis
  const yScale = d3.scaleLinear();
  yScale.domain([
    d3.min(dataSeries, (d) => d.time),
    d3.max(dataSeries, (d) => d.time),
  ]);
  yScale.range([padding, graphHeight - padding]);

  // create SVG
  const svg = d3
    .select('#graph')
    .append('svg')
    .attr('id', 'title')
    .attr('width', 900)
    .attr('height', 460);

  // create dots
  const dots = svg
    .selectAll('circle')
    .data(dataSeries)
    .enter()
    .append('circle')
    .attr('r', '5px')
    .attr('cx', (d) => xScale(d.Year))
    .attr('cy', (d) => yScale(d.time))
    .attr('data-xvalue', (d) => d.Year)
    .attr('data-yvalue', (d) => d.time)
    .attr('fill', (d) => (d.Doping ? 'rgb(31, 119, 180)' : 'rgb(255, 127, 14)'))
    .attr('class', 'dot');

  // create tooltip

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);

  // show tooltip on mouseover and hide on mouseout
  dots
    .on('mouseover', (event, d) => {
      let html = `
      <p>${d.Name}: ${d.Nationality}</p>
      <p>Year: ${d.Year} Time: ${d.Time}</p>
      ${d.Doping ? '<br>' : ''}
      <p>${d.Doping}</p>`;

      tooltip
        .style('opacity', 1)
        .attr('data-year', d.Year)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`)
        .html(html);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

  // create legend
  const legend = svg.append('g').attr('id', 'legend');

  legend
    .append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .attr('x', graphWidth - 300 - 20)
    .attr('y', graphHeight / 2 - 55)
    .attr('fill', 'rgb(255, 127, 14)');

  legend
    .append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .attr('x', graphWidth - 300 - 20)
    .attr('y', graphHeight / 2 - 35)
    .attr('fill', 'rgb(31, 119, 180)');

  legend
    .append('text')
    .attr('x', graphWidth - 300)
    .attr('y', graphHeight / 2 - 40)
    .text('No doping allegations');
  legend
    .append('text')
    .attr('x', graphWidth - 300)
    .attr('y', graphHeight / 2 - 20)
    .text('Riders with doping allegations');

  // create X-axis
  const xAxis = d3.axisBottom(xScale).tickFormat((d) => d.toFixed(0));

  svg
    .append('g')
    .attr('transform', `translate(0, ${graphHeight - padding})`)
    .attr('id', 'x-axis')
    .call(xAxis);

  // create Y-axis
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));
  svg
    .append('g')
    .attr('transform', `translate(${padding}, 0)`)
    .attr('id', 'y-axis')
    .call(yAxis);
};

// load the data and render everything once content loaded
document.addEventListener('DOMContentLoaded', async () => {
  const dataSeries = await loadDataSeries();

  await render(dataSeries);
});
