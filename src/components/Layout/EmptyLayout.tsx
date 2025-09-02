import { Content } from 'components/Layout';
import React from 'react';
import sidebarBgImage from 'assets/img/login_bg.png';
const sidebarBackground = {
  backgroundImage: `url("${sidebarBgImage}")`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
};

const EmptyLayout = ({ children, ...restProps }) => (
  <main className="cr-app bg-light" style={sidebarBackground}  {...restProps} >
    <Content fluid>{children}</Content>
  </main>
);

export default EmptyLayout;
