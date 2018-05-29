import React from 'react';

const style = {
  marginLeft: 50,
  fontFamily: 'Sans-serif',
};

function getDateString(dateObject) {
  let dateString = '';
  if(dateObject) {
    dateObject = new Date(dateObject);
    dateString = `${(dateObject.getMonth() + 1)}-${dateObject.getDate()}-${dateObject.getFullYear()}`;
  }
  return dateString;
}

function getDataString(metric, value, date) {
  let dataString = '';
  if(metric && value && date) {
    dataString = `${metric} - 
    ${value} plays 
    ${date}`;
  }
  return dataString;
}

class Tooltip extends React.Component {
  render() {
    let metricStyle = {
      color: this.props.tooltipData.colour
    };
    return (
      <div id='tooltip' style={style}>
        <p style={metricStyle}>{
          getDataString(
            this.props.tooltipData.metric,
            this.props.tooltipData.value,
            getDateString(
              this.props.tooltipData.date
            )
          )
        }</p>
      </div>
    );
  }
}

export default Tooltip;
