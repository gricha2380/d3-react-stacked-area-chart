import React from 'react';

class Header extends React.Component {
  render() {
    let headerStyle = {
      backgroundColor: '#000000',
      top: 0,
      paddingLeft: '25px',
      borderWidth: '2px',
      borderBottomWidth: '5px',
      borderBottomColor: '#222222',
      borderBottomStyle: 'solid'
    };
    return (
      <div id="headline" style={headerStyle}>
      <h1>2018 Artist Playcounts over time</h1>
      <p>
        <div>Each area represents the total number of valid felony, misdemeanor, and violation crimes of a particular complaint description type reported to the New York City Police Department NYPD in 2016 on each day. </div>
        <div>Made with <a href="https://d3js.org/">d3.js</a>, based on <a href="http://nyc-complaints-area.clemens-anzmann.com/">this</a>. Displayed are the top 30 artists including a type named "OTHER" containing the sum of all remaining descriptions.</div>
      </p>
    </div>
    );
  }
}

export default Header;
