"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// load the data and render everything once content loaded
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    const svgWidth = 1000;
    const svgHeight = 700;
    const legendWidth = 300;
    const path = d3.geoPath();
    var color = d3
        .scaleThreshold()
        .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
        .range(d3.schemeGreens[9]);
    const loadData = () => __awaiter(void 0, void 0, void 0, function* () {
        const TOPOLOGY_DATA_URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
        const EDUCATION_DATA_URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
        const [topology, education] = yield Promise.all([
            d3.json(TOPOLOGY_DATA_URL),
            d3.json(EDUCATION_DATA_URL),
        ]);
        if (!topology || !education) {
            throw Error('Unable to get the data');
        }
        const geoJsonData = topojson.feature(topology, topology.objects.counties);
        if (geoJsonData.type !== 'FeatureCollection') {
            throw Error('Unable to get the data');
        }
        const educationDictionary = education.reduce((acc, value) => {
            acc[value.fips] = value;
            return acc;
        }, {});
        geoJsonData.features.forEach((feature) => {
            const educationData = feature.id
                ? educationDictionary[feature.id]
                : undefined;
            if (educationData) {
                feature.properties = educationData;
            }
        });
        return geoJsonData.features;
    });
    const createSvg = () => {
        return d3
            .select('#graph')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
    };
    const createTooltip = () => {
        return d3
            .select('body')
            .append('div')
            .attr('class', 'tooltip')
            .attr('id', 'tooltip')
            .style('opacity', 0);
    };
    const createLegend = (svg) => {
        const paddingX = 500;
        const paddingY = 40;
        //axis
        const colorDomain = color.domain();
        const scale = d3.scaleLinear();
        scale.domain([colorDomain[0], colorDomain[colorDomain.length - 1]]);
        scale.range([0, legendWidth]);
        const axis = d3
            .axisBottom(scale)
            .tickValues(colorDomain)
            .tickFormat((d) => d.toFixed(1));
        svg
            .append('g')
            .attr('transform', `translate(${paddingX}, ${paddingY})`)
            .call(axis);
        const width = scale(colorDomain[1]) - scale(colorDomain[0]);
        const height = width / 3;
        colorDomain.pop();
        return svg
            .append('g')
            .attr('id', 'legend')
            .selectAll('rect')
            .data(colorDomain)
            .enter()
            .append('rect')
            .attr('width', width)
            .attr('height', width / 3)
            .attr('x', (_, i) => paddingX + i * width)
            .attr('y', paddingY - height)
            .attr('fill', (d) => color(d))
            .attr('stroke', 'black')
            .attr('stroke-width', 1);
    };
    const createCounties = (svg, tooltip, features) => {
        return svg
            .append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'county')
            .attr('data-fips', (d) => d.properties.fips)
            .attr('data-education', (d) => d.properties.bachelorsOrHigher)
            .attr('fill', (feature) => {
            return color(feature.properties.bachelorsOrHigher);
        })
            .on('mouseover', (event, feature) => {
            const { bachelorsOrHigher, area_name, state } = feature.properties;
            let html = `<p>${area_name}, ${state}: ${bachelorsOrHigher}</p>`;
            tooltip
                .style('opacity', 1)
                .attr('data-education', bachelorsOrHigher)
                .style('left', `${event.pageX}px`)
                .style('top', `${event.pageY - 56}px`)
                .html(html);
        })
            .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });
    };
    const render = (features) => __awaiter(void 0, void 0, void 0, function* () {
        // create SVG
        const svg = createSvg();
        // create tooltip
        const tooltip = createTooltip();
        // create counties
        createCounties(svg, tooltip, features);
        // cerate legend
        createLegend(svg);
    });
    const data = yield loadData();
    yield render(data);
}));
//# sourceMappingURL=app.js.map