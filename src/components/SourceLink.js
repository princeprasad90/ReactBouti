import React from 'react';
import { Link, useHistory } from "react-router-dom";

const SourceLink = props => {
  let history = useHistory();
  const handleClick = ()=>{   
    history.push({ pathname: '/OrderApproval' });
    history.go();

  }
  /* eslint-disable jsx-a11y/anchor-has-content */
  return (
    // <a href={process.env.REACT_APP_SOURCE_URL} target="_blank" rel="noopener noreferrer" {...props} />
    <Link  to='/OrderApproval' rel="noopener noreferrer" {...props} />
  );
};

export default SourceLink;
