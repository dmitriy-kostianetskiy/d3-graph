const w = 900;
const h = 460;
const padding = 60;
const GDP_DATA_URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const formatYear = d3.timeFormat('%Y');

// load US GDP Data
const loadGdpDataSeries = async () => {
  const response = await fetch(GDP_DATA_URL);
  const json = await response.json();

  return json.data.map((d) => ({
    gdp: d[1],
    date: new Date(d[0]),
  }));
};

// extract Quarter from date
const getQuarter = (date) => {
  const month = date.getMonth();

  if (month >= 10) {
    return 'Q4';
  }

  if (month >= 7) {
    return 'Q3';
  }

  if (month >= 4) {
    return 'Q2';
  }

  return 'Q1';
};

const getTooltipDateLabel = (date) => {
  return 'Year: ' + formatYear(date) + ' ' + getQuarter(date);
};

const getTooltipGDPLabel = (gdp) => {
  return '$ ' + gdp.toFixed(1) + ' Billion';
};

const render = async (dataSeries) => {
  const barWidth = w / dataSeries.length;

  // create xAxis
  const xScale = d3.scaleLinear();
  xScale.domain([
    d3.min(dataSeries, (d) => d.date),
    d3.max(dataSeries, (d) => d.date),
  ]);
  xScale.range([padding, w - padding]);

  // create yAxis
  const yScale = d3.scaleLinear();
  yScale.domain([0, d3.max(dataSeries, (d) => d.gdp)]);
  // invert vertically since 0,0 is top-left corner but we want bottom-left corner to be 0,0
  yScale.range([h - padding, padding]);

  // create SVG
  const svg = d3
    .select('#graph')
    .append('svg')
    .attr('id', 'title')
    .attr('width', 900)
    .attr('height', 460);

  // create bars
  const bars = svg
    .selectAll('rect')
    .data(dataSeries)
    .enter()
    .append('rect')
    .attr('width', barWidth)
    .attr('height', (d) => h - yScale(d.gdp) - padding)
    .attr('x', (d) => xScale(d.date))
    .attr('y', (d) => yScale(d.gdp))
    .attr('data-date', (d) => d.date)
    .attr('data-index', (_, i) => i)
    .attr('data-gdp', (d) => d.gdp)
    .attr('class', 'bar');

  // create tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);

  // show tooltip on mouseover and hide on mouseout
  bars
    .on('mouseover', (event, d) => {
      let html = `
      <p>${getTooltipDateLabel(d.date)}</p>
      <p>${getTooltipGDPLabel(d.gdp)}</p>`;

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

  // create X-axis
  const xAxis = d3.axisBottom(xScale).tickFormat(formatYear);

  svg
    .append('g')
    .attr('transform', 'translate(0,' + (h - padding) + ')')
    .attr('id', 'x-axis')
    .call(xAxis);

  // create Y-axis
  const yAxis = d3.axisLeft(yScale);
  svg
    .append('g')
    .attr('transform', 'translate(' + padding + ',0)')
    .attr('id', 'y-axis')
    .call(yAxis);
};

// load the data and render everything once content loaded
document.addEventListener('DOMContentLoaded', async () => {
  const dataSeries = await loadGdpDataSeries();

  await render(dataSeries);
});
