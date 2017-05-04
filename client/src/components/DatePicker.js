import React from 'react';
import { Container } from 'reactstrap';
import moment from 'moment';
import DatePicker from 'react-datepicker';

class Header extends React.Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.state = { selected: moment() };
  }

  handleChange(date) {
    this.setState({ selected: date });
    this.props.callBack(date);
  }

  render() {
    return (
      <Container fluid>
        <DatePicker
          dateFormat="YYYY/MM/DD"
          selected={this.state.selected}
          onChange={this.handleChange}
          withPortal
          className="form-control"
        />
      </Container>
    );
  }
}

export default Header;