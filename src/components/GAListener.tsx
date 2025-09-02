import React from 'react';
import PropTypes from 'prop-types';

import ReactGA from 'react-ga';

const hasGAId = !!process.env.REACT_APP_GOOGLE_ANALYTICS;

if (hasGAId) {
  ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS);
}

interface GAListenerProps {
  children: React.ReactNode;
}

class GAListener extends React.Component<GAListenerProps> {
  static contextTypes = {
    router: PropTypes.object,
  };

  context!: { router: any };

  componentDidMount() {
    if (hasGAId) {
      this.sendPageView(this.context.router.history.location);
      this.context.router.history.listen(this.sendPageView);
    }
  }

  sendPageView(location: any) {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
  }

  render() {
    return this.props.children;
  }
}

export default GAListener;
