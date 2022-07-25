// load the data and render everything once content loaded
document.addEventListener('DOMContentLoaded', async () => {
  interface DataItem {
    name: string;
    category: string;
    value: string;
  }

  const svgWidth = 1000;
  const svgHeight = 1500;

  const treeMapWidth = 900;
  const treeMapHeight = 500;

  const color = d3
    .scaleOrdinal()
    .range([
      '#1f77b4',
      '#aec7e8',
      '#ff7f0e',
      '#ffbb78',
      '#2ca02c',
      '#98df8a',
      '#d62728',
      '#ff9896',
      '#9467bd',
      '#c5b0d5',
      '#8c564b',
      '#c49c94',
      '#e377c2',
      '#f7b6d2',
      '#7f7f7f',
      '#c7c7c7',
      '#bcbd22',
      '#dbdb8d',
      '#17becf',
      '#9edae5',
    ]);

  const loadData = async (): Promise<DataItem> => {
    const GAMES_DATA_URL =
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';

    const data = await d3.json<DataItem>(GAMES_DATA_URL);
    if (!data) {
      throw new Error('Unable to load the data');
    }

    return data;
  };

  const createSvg = (): d3.Selection<
    SVGSVGElement,
    unknown,
    HTMLElement,
    any
  > => {
    return d3
      .select('#graph')
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);
  };

  const createTooltip = (): d3.Selection<
    HTMLDivElement,
    unknown,
    HTMLElement,
    any
  > => {
    return d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .attr('id', 'tooltip')
      .style('opacity', 0);
  };

  const createLegend = (
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    categories: string[]
  ) => {
    const paddingX = 500;
    const paddingY = 550;

    const third = Math.floor(categories.length / 2);

    const cells = svg
      .append('g')
      .attr('id', 'legend')
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('transform', function (d, i) {
        const div = Math.floor(i / third);
        const mod = i % third;

        const x = paddingX - div * 200 + div * 20;
        const y = paddingY + mod * 30;

        return `translate(${x},${y})`;
      });

    cells
      .append('rect')
      .attr('class', 'legend-item')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', (d) => color(d) as any);

    cells
      .append('text')
      .attr('x', 25)
      .attr('y', 15)
      .text((d) => d);
  };

  const createTreemap = (
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
    data: DataItem
  ) => {
    const root = d3
      .hierarchy(data)
      .sum((d) => {
        return +d.value;
      })
      .sort((a, b) => {
        return b.height - a.height || (b.value ?? 0) - (a.value ?? 0);
      });

    const treemap = d3
      .treemap<DataItem>()
      .size([treeMapWidth, treeMapHeight])
      .padding(1);

    const leaves = treemap(root).leaves();

    const cells = svg
      .selectAll('g')
      .data(leaves)
      .enter()
      .append('g')
      .attr('transform', function (d) {
        return 'translate(' + d.x0 + ',' + d.y0 + ')';
      });

    cells
      .append('rect')
      .attr('class', 'tile')
      .attr('data-name', (d) => d.data.name)
      .attr('data-category', (d) => d.data.category)
      .attr('data-value', (d) => d.data.value)
      .attr('fill', (d) => color(d.data.category) as any)
      .attr('width', (d) => {
        return d.x1 - d.x0;
      })
      .attr('height', (d) => {
        return d.y1 - d.y0;
      })
      .on('mouseover', (event, feature) => {
        const { name, category, value } = feature.data;
        let html = `<p>${name}, ${category}: ${value}</p>`;
        tooltip
          .style('opacity', 1)
          .attr('data-value', value)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 56}px`)
          .html(html);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    cells
      .append('text')
      .attr('class', 'tile-text')
      .selectAll('tspan')
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) => 13 + i * 10)
      .text((d) => d);

    const categories = leaves
      .map((x) => x.data.category)
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

    createLegend(svg, categories);
  };

  const render = async (data: DataItem) => {
    // create SVG
    const svg = createSvg();

    // create tooltip
    const tooltip = createTooltip();

    // create counties
    createTreemap(svg, tooltip, data);
  };

  const data = await loadData();

  await render(data);
});
