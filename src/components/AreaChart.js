import React, {
  Component
} from 'react';
import * as d3 from 'd3';
import Tooltip from './Tooltip';
import HoverLine from './HoverLine';
import * as dataTransformer from './../utilities/DataTransformer.js';

const totalWidth = window.innerWidth-50;
const totalHeight = 500;
const chartStyles = {
  position: 'absolute',
};
const margin = {
  top: 20,
  right: 20,
  bottom: 110,
  left: 40
};
const margin2 = {
  top: 400,
  right: 20,
  bottom: 50,
  left: 40
};
const width = totalWidth - margin.left - margin.right;
const height = totalHeight - margin.top - margin.bottom;
const height2 = totalHeight - margin2.top - margin2.bottom;

let max = 1600;

function fetchData(rawData) {
  const flattenResult = dataTransformer.flattenData(rawData);
  let keys = flattenResult.keys;

  let tranformedData = dataTransformer.fillZeros(
    dataTransformer.sortData(
      dataTransformer.combineData(flattenResult.data)
    ),
    keys
  );

  return {
    data: tranformedData,
    keys: keys
  };
}

function getDateForMousePos(axis, mousePosX) {
  return dataTransformer.roundDate(
    axis.invert(mousePosX)
  );
}

class AreaChart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      globalTooltipData: {},
      mousePosition: {}
    };
    this.createChart = this.createChart.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate() {}

  createChart() {

    const fetchedDataObj = fetchData(this.props.data);
    const data = fetchedDataObj.data;
    const keys = fetchedDataObj.keys;
    const _this = this;
    let svg = d3.select('#areaChart');

    let x = d3.scaleTime().range([0, width]);
    let x2 = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);
    let y2 = d3.scaleLinear().range([height2, 0]);
    let z = d3.scaleOrdinal(d3.schemeCategory20);

    let xAxis = d3.axisBottom(x);
    let xAxis2 = d3.axisBottom(x2);
    let yAxis = d3.axisLeft(y);

    let stack = d3.stack();
    stack.keys(keys);

    let g = svg.append('g').attr('transform', 'translate(80,20)');

    let brush = d3.brushX()
      .extent([[0, 0], [width, height2]])
      .on('brush end', brushed);

    let zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed);

    let area = d3.area()
      .curve(d3.curveBasis)
      .x(function(d) {
        return x(d.data.date);
      })
      .y0(function(d) {
        return y(d[0]);
      })
      .y1(function(d) {
        return y(d[1]);
      });

    let area2 = d3.area()
      .x(function(d) {
        return x2(d.data.date);
      })
      .y0(function(d) {
        return y2(d[0]);
      })
      .y1(function(d) {
        return y2(d[1]);
      });

    z.domain(keys);

    x.domain(d3.extent(data, function(d) {
      return d.date;
    }));
    x2.domain(x.domain());
    y.domain([0,max]);
    y2.domain([0,max]);

    function make_y_gridlines() {
      return d3.axisLeft(y).ticks(6);
    }

    g.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
    );

    let focus = g.selectAll('.focus')
      .data(stack(data))
      .enter().append('g')
      .attr('class', 'focus');

    focus.append('path')
      .attr('class', 'area')
      .style('fill', function(d) {
        return z(d.key);
      })
      .style('opacity','0.8')
      .attr('d', area)
      .attr('id', function(d) {
        return d.key;
      })
      .on('mousemove', function(d) {
        let hoveredDate = getDateForMousePos(x, d3.mouse(this)[0]);
        let myTimeseries = this.id;
        let myVal = dataTransformer.findValue(d, hoveredDate, this.id);
        _this.setState({
          globalTooltipData: {
            date: hoveredDate.toString(),
            metric: myTimeseries,
            value: myVal,
            colour: z(d.key)
          },
          mousePosition: {
            x: event.clientX,
            y: event.clientY
          }
        });
      })
      .on('mouseover', function(d) {
        d3.select(this)
          .style('opacity','1');
      })
      .on('mouseout', function(d) {
        d3.select(this)
          .style('opacity','0.8');
          _this.setState({
            globalTooltipData: {},
            mousePosition: {}
          });
      });

     g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(yAxis);

    let context = g.selectAll('.context')
      .data(stack(data))
      .enter().append('g')
      .attr('class', 'context')
      .attr('transform', 'translate(' + 0 + ',' + margin2.top + ')');

    context.append('path')
      .attr('class', 'area2')
      .style('fill', function(d) {
        return z(d.key);
      })
      .attr('d', area2);

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + (margin2.top+50) + ')')
      .call(xAxis2);

    g.append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, x.range())
      .attr('transform', 'translate(' + 0 + ',' + margin2.top + ')');

    svg.call(zoom);

    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
      var s = d3.event.selection || x2.range();
      x.domain(s.map(x2.invert, x2));
      focus.select('.area').attr('d', area);
      g.select('.axis--x').call(xAxis);
      g.select('.brush').call(zoom.transform, d3.zoomIdentity
          .scale(width / (s[1] - s[0]))
          .translate(-s[0], 0));
    }

    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
      var t = d3.event.transform;
      x.domain(t.rescaleX(x2).domain());
      focus.select('.area').attr('d', area);
      g.select('.axis--x').call(xAxis);
      g.select('.brush').call(brush.move, x.range().map(t.invertX, t));
    }
  }

  render() {
    return <div>
      <HoverLine
        width={width}
        height={height}
        marginTop={margin.top}
        mousePosition={this.state.mousePosition}
      />
      <svg
        id='areaChart'
        ref={node => this.node = node}
        width={totalWidth}
        height={totalHeight}>
      </svg>
      <Tooltip tooltipData={this.state.globalTooltipData} />
    </div>;
  }
}

export default AreaChart;
