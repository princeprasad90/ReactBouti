import React, { useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';

const ProtectedRoute = ({ component: Component, layout: Layout, ...rest }) => {
  let routes = useSelector((state) => state.MenuReducer.routes);

  if(routes.length==0)
  { const menu = JSON.parse(localStorage.getItem("menu"));
    if(menu)
    {
      let routesTemp = [];
      menu.appMenuModels.forEach(apm => {
        apm.modules.forEach(module => {
          module.subModules.forEach(sub => {
            routesTemp.push(sub.route);
          });
        });
      });
     routes =routesTemp;
    }
  }
  const checkExists = ()=>{
    let includes = routes.includes(rest.path);
    if(!includes) toast.error("No Access Rights");
    return includes;
  }
  const exists = checkExists();
  const [con, setcon] = useState(exists);


  return (
    <Route {...rest} render={
      props => {
        if (con) {
          return <Component {...rest} {...props} />
        } else {
          return <Redirect to={
            {
              pathname: '/welcome'
            }
          } />
        }
      }
    } />
  );
}
export default ProtectedRoute;
