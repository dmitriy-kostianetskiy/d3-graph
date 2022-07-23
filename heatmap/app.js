const svgWidth = 1000;
const svgHeight = 550;
const graphWidth = 1000;
const graphHeight = 460;
const legendWidth = 300;
const paddingX = 60;
const paddingY = 30;
const GDP_DATA_URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const colorMap = [
  [, 2.8, 'rgb(56, 85, 132)'],
  [2.8, 3.9, 'rgb(69, 117, 180)'],
  [3.9, 5.0, 'rgb(116, 173, 209)'],
  [5.0, 6.1, 'rgb(171, 217, 233)'],
  [6.1, 7.2, 'rgb(224, 243, 248)'],
  [7.2, 8.3, 'rgb(255, 255, 191)'],
  [8.3, 9.5, 'rgb(254, 224, 144)'],
  [9.5, 10.6, 'rgb(253, 174, 97)'],
  [10.6, 11.7, 'rgb(244, 109, 67)'],
  [11.7, 12.8, 'rgb(215, 48, 39)'],
  [12.8, , 'rgb(136, 23, 1)'],
];

const loadData = async () => {
  const response = await fetch(GDP_DATA_URL);
  const json = await response.json();

  const dataSeries = json.monthlyVariance.map((d) => ({
    temperature: json.baseTemperature + d.variance,
    year: d.year,
    month: d.month,
  }));

  return {
    baseTemperature: json.baseTemperature,
    minYear: d3.min(dataSeries, (d) => d.year),
    maxYear: d3.max(dataSeries, (d) => d.year),
    minMonth: d3.min(dataSeries, (d) => d.month),
    maxMonth: d3.max(dataSeries, (d) => d.month),
    dataSeries,
  };
};

const setDescription = (minYear, maxYear, baseTemperature) => {
  const temperature = baseTemperature.toFixed(2);
  const title = `${minYear} - ${maxYear}: base temperature ${temperature}℃'`;

  document.querySelector('#description').textContent = title;
};

const getColor = (temperature) => {
  let [, , c] = colorMap.find(
    ([left, right, c]) =>
      (left ? temperature > left : true) &&
      (right ? temperature <= right : true)
  );

  return c;
};

const createXScale = (minYear, maxYear) => {
  const xScale = d3.scaleLinear();
  xScale.domain([minYear, maxYear + 1]);
  xScale.range([paddingX, graphWidth - paddingX]);

  return xScale;
};

const createYScale = (minMonth, maxMonth) => {
  const yScale = d3.scaleLinear();
  yScale.domain([minMonth, maxMonth + 1]);
  yScale.range([paddingY, graphHeight - paddingY]);

  return yScale;
};

const createXAxis = (svg, xScale) => {
  const xAxis = d3.axisBottom(xScale).tickFormat((d) => d.toFixed(0));

  svg
    .append('g')
    .attr('transform', 'translate(0,' + (graphHeight - paddingY) + ')')
    .attr('id', 'x-axis')
    .call(xAxis);

  return xAxis;
};

const formatMonth = (month) => d3.timeFormat('%B')(new Date(2020, month - 1));

const createYAxis = (svg, yScale) => {
  const yAxis = d3.axisLeft(yScale).tickFormat(formatMonth);

  yAxis.tickValues([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  svg
    .append('g')
    .attr('transform', 'translate(' + paddingX + ',0)')
    .attr('id', 'y-axis')
    .call(yAxis);

  return yAxis;
};

const createSvg = () => {
  return d3
    .select('#graph')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);
};

const createBars = (svg, xScale, yScale, dataSeries, tooltip) => {
  return svg
    .selectAll('rect')
    .data(dataSeries)
    .enter()
    .append('rect')
    .attr('width', xScale(2) - xScale(1))
    .attr('height', yScale(2) - yScale(1))
    .attr('x', (d) => xScale(d.year))
    .attr('y', (d) => yScale(d.month))
    .attr('data-month', (d) => d.month)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => d.temperature)
    .attr('fill', (d) => getColor(d.temperature))
    .attr('class', 'cell')
    .on('mouseover', (event, d) => {
      let html = `
      <p>${d.year} - ${formatMonth(d.month)}</p>
      <p>${d.temperature.toFixed(2)} ℃</p>`;

      tooltip
        .style('opacity', 1)
        .attr('data-year', d.year)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 56}px`)
        .html(html);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });
};

const createTooltip = () => {
  return d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);
};

const createLegend = (svg, colorMap) => {
  const offset = graphHeight + paddingY;
  // scale
  const scale = d3.scaleLinear();
  scale.domain([colorMap.length - 1, 0]);
  scale.range([0, legendWidth]);

  //axis
  const axis = d3.axisBottom(scale).tickFormat((d) => {
    if (d === 0) {
      return colorMap[d][1];
    }

    if (d === colorMap.length - 1) {
      return colorMap[d][1];
    }

    return colorMap[d][1].toFixed(2);
  });

  svg
    .append('g')
    .attr('transform', `translate(${paddingX}, ${offset})`)
    .call(axis);

  const boxSize = scale(1) - scale(2);

  return svg
    .append('g')
    .attr('id', 'legend')
    .selectAll('rect')
    .data(colorMap)
    .enter()
    .append('rect')
    .attr('width', boxSize)
    .attr('height', boxSize)
    .attr('x', (_, i) => paddingX + scale(i))
    .attr('y', offset - boxSize)
    .attr('fill', (d) => d[2])
    .attr('stroke', 'black')
    .attr('stroke-width', 1);
};

const render = async (data) => {
  // const barWidth = w / dataSeries.length;

  const xScale = createXScale(data.minYear, data.maxYear);
  const yScale = createYScale(data.minMonth, data.maxMonth);

  // create SVG
  const svg = createSvg();

  // create tooltip
  const tooltip = createTooltip();

  // create bars
  createBars(svg, xScale, yScale, data.dataSeries, tooltip);

  // cerate legend
  createLegend(svg, colorMap);

  // create X-axis
  createXAxis(svg, xScale);
  createYAxis(svg, yScale);
};

// load the data and render everything once content loaded
document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadData();

  setDescription(data.minYear, data.maxYear, data.baseTemperature);
  await render(data);
});
