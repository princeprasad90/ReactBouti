import React from 'react';

import { Navbar, Nav, NavItem } from 'reactstrap';

import SourceLink from 'components/SourceLink';

const Footer = () => {
  return (
    <span style={{textAlign:'right',fontSize:'0.8rem'}}>
      2021-2025 All rights reserved for Boutiqaat <SourceLink>Boutiqaat</SourceLink>
    </span>
    // <Navbar>
    //   <Nav navbar>
    //     <NavItem>
    //       2021-2025 All rights reserved for Boutiqaat <SourceLink>Boutiqaat</SourceLink>
    //     </NavItem>
    //   </Nav>
    // </Navbar>
  );
};

export default Footer;
