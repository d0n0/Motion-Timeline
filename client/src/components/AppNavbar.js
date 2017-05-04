import React from 'react';
import {  Nav, Navbar, NavbarBrand, NavItem, Button } from 'reactstrap';
import DatePicker from './DatePicker.js';
import FontAwesome from 'react-fontawesome';

const scroll = require('react-scroll').animateScroll;

const options = {
  duration: 300,
  smooth: true
}

const scrollToTop = () => {
  scroll.scrollToTop(options);
};

const scrollToBottom = () => {
  scroll.scrollToBottom(options);
};

const AppNavbar = ({ callBacks, isExistToken, autoUpdate }) => {

  if (isExistToken) {
    return (
      <Navbar color="atomdark" className="navbar-inverse" toggleable="xs" fixed="top">
        <NavbarBrand className="hidden-xs-down" href="/">Motion-Timeline</NavbarBrand>
        <Nav className="ml-auto">
          <NavItem>
            <FontAwesome className="nav-arrow" onClick={scrollToTop} name="arrow-circle-o-up" size="2x" inverse />
          </NavItem>
          <NavItem>
            <FontAwesome className="nav-arrow" onClick={scrollToBottom} name="arrow-circle-o-down" size="2x" inverse />
          </NavItem>
          <NavItem>
            <Button className="auto-button" color="danger" onClick={callBacks.switchAutoUpdate}>
              {autoUpdate ? (
                <FontAwesome name="eye" size="2x" inverse />
              ) : (
                <FontAwesome name="eye-slash" size="2x" inverse />
              )}
            </Button>
          </NavItem>
          <NavItem>
            <DatePicker className="input-sm" callBack={callBacks.setDate} />
          </NavItem>
        </Nav>
      </Navbar>
    );
  } else {
    return (
      <Navbar color="atomdark" className="navbar-inverse" fixed="top">
        <NavbarBrand href="/">Motion-Timeline</NavbarBrand>
      </Navbar>
    );
  }
};

export default AppNavbar;
