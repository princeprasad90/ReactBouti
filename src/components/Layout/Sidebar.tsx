import sidebarBgImage from 'assets/img/sidebar/sidebar-6.jpg';
import SourceLink from 'components/SourceLink';
import React, {useState,useEffect} from 'react';
import Typography from 'components/Typography';
import Avatar from 'components/Avatar';
import {
  MdKeyboardArrowDown,
  MdPages,
  MdStore,
  MdArrowDownward,
  MdAccountBox,
  MdSettingsApplications
} from 'react-icons/md';
import { NavLink,Redirect } from 'react-router-dom';
import {  Collapse,  Nav,  Navbar,  NavItem,  NavLink as BSNavLink,
} from 'reactstrap';
import bn from 'utils/bemnames';
import { useSelector, useDispatch } from "react-redux";
import {getMenuSuccessRequest,getMenuFailueRequest} from '../../actions/helper/menuActions';
const sidebarBackground = {
  backgroundImage: `url("${sidebarBgImage}")`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
};

const bem = bn.create('sidebar');
const padStyle ={padding:2};
const fontSize = {fontSize:'0.9rem'};
const IconsComponents = {
  'MdSettingsApplications' :MdSettingsApplications,
  'MdAccountBox':MdAccountBox
}
 const Sidebar =()=>{
    const userData = JSON.parse(localStorage.getItem("userData"));
    const [isAppOpen,setisAppOpen] = useState({});
    const [isModOpen, setisModOpen] = useState({});
    const menu = JSON.parse(localStorage.getItem("menu"));
    const [menuC,setmenuC]= useState({});
    const dispatch = useDispatch();

    useEffect(() => {
    getMenu();
    }, []);

const getMenu=()=>{
  if(menu)
  {
 let routesTemp = [];
  menu.appMenuModels.forEach(apm => {
    apm.modules.forEach(module=>{
      module.subModules.forEach(sub=>{   
        sub.icon = (sub.icon===null || sub.icon === undefined)?'MdSettingsApplications':sub.icon;       
        sub.IconComp = IconsComponents[sub.icon];
        sub.IconComp = sub.IconComp===undefined?MdSettingsApplications:sub.IconComp;
        routesTemp.push(sub.route);
      });
    });
  });
  dispatch(getMenuSuccessRequest(routesTemp));
  let appDesc = [];
  let modulesDesc = [];
   menu.appMenuModels.forEach(apm=>{
    appDesc = [...appDesc,apm.appId]
    modulesDesc = [...modulesDesc, ...apm.modules.map(obj=>`${apm.appId}A${obj.modCode}`)];
  });
  let isAppOpenTemp ={};
  appDesc.forEach(item=>{
    isAppOpenTemp[item] = false;
  });
  setisAppOpen({...isAppOpenTemp});
  let isOpenTemp={};
  modulesDesc.forEach(item => {
    isOpenTemp[item] = false;
  });

  setisModOpen({...isOpenTemp});
  setmenuC({...menu});
}
};


  const handleModClick = name => () => {
    setisModOpen(prevState => {
      const wasOpen = prevState[name];
      let temp = {...prevState};    
      for (const [key, value] of Object.entries(temp)) {
        temp[key]=false;      
      }
      temp[name]= !wasOpen;
      return {...temp};
    });
  };
const handleAppClick = AppId => ()=>{
  setisAppOpen(prevState => {
    const wasOpen = prevState[AppId];
    let temp = {...prevState};    
    for (const [key, value] of Object.entries(temp)) {
      temp[key]=false;      
    }
    temp[AppId]= !wasOpen;
    return {...temp};
  });
 
} 

  return (
      <aside className={bem.b()}  >  
        <div className={bem.e('background')} style={sidebarBackground} />
        <div className={bem.e('content')}>
          <Navbar className="text-center">

            <SourceLink className="navbar-brand" >
              <div style={{ display: "block", float: "none", marginRight: "10%", auto: "" }}>
                <Avatar />
              </div>
              <div>
                <span className="text-white">
                  {userData.userName}
                </span>
                <br />
                <small className="text-white" style={{fontSize : '12px'}}> {userData.position} - {userData.departmentName}</small>
                <br />
                <small className="text-white" style={{fontSize : '12px',fontWeight:'bold'}}>   {process.env.REACT_APP_ENV_NAME}</small>
                
              
              </div>
            </SourceLink>
          </Navbar>
          <Nav vertical>
            {
              menuC && menuC.appMenuModels && menuC.appMenuModels.map(({appId,appName,modules},index)=>(
               <div key={index}>
                  <NavItem
                        className={bem.e('nav-item')}
                        onClick={handleAppClick(`${appId}`)}
                      > <BSNavLink className={bem.e('nav-item-collapse')} style={{...padStyle,...fontSize}}>
                      <div className="d-flex ">
                     
                        <MdStore className={bem.e('nav-item-icon')} />
                       
                        <strong ><em>{appName}</em></strong>                    
                      </div>
                      <MdArrowDownward
                        className={bem.e('nav-item-icon')}
                        style={{
                          padding: 0,
                          transform: isAppOpen[`${appId}`]
                            ? 'rotate(0deg)'
                            : 'rotate(-90deg)',
                          transitionDuration: '0.3s',
                          transitionProperty: 'transform',
                        }}
                      />
                    </BSNavLink></NavItem>
                    <Collapse isOpen={isAppOpen[`${appId}`]}>
                  {modules && modules.map(({ modCode, modName, subModules }, index) => (
                    <div key={index}>
                      <NavItem
                        className={bem.e('nav-item')}
                        onClick={handleModClick(`${appId}A${modCode}`)}
                      >
                        <BSNavLink className={bem.e('nav-item-collapse')} style={{...padStyle,...fontSize}}>
                          <div className="d-flex ml-2">
                            <MdPages className={bem.e('nav-item-icon')} />
                            <span className="">{modName}</span>
                          </div>
                          <MdKeyboardArrowDown
                            className={bem.e('nav-item-icon')}
                            style={{
                              padding: 0,
                              transform: isModOpen[`${appId}A${modCode}`]
                                ? 'rotate(0deg)'
                                : 'rotate(-90deg)',
                              transitionDuration: '0.3s',
                              transitionProperty: 'transform',
                            }}
                          />
                        </BSNavLink>
                      </NavItem>

                      <Collapse isOpen={isModOpen[`${appId}A${modCode}`]}>
                        {subModules.map(({ route, modName, IconComp,inMenu }, index) => (
                          <NavItem key={index} className={bem.e('nav-item')}>
                           {inMenu==='True' && <BSNavLink
                              id={`navItem-${modName}-${index}`}
                              className="text-camelcase ml-4"
                              style={{...padStyle,...fontSize}}
                              tag={NavLink}
                              to={route}
                              activeClassName="active"
                              exact={true} >
                              <IconComp className={bem.e('nav-item-icon')} />
                              <span className="" style={{...padStyle,...fontSize}} >{modName}</span>
                            </BSNavLink>}
                          </NavItem>
                        ))}
                      </Collapse>
                    </div>

                  ))}
                  </Collapse>
               </div>
               
              ))}
          {menuC && menuC.modules && menuC.modules.map(({ modCode, modName, subModules }, index) => (
            <div key={index}>
            <NavItem
              className={bem.e('nav-item')}
              onClick={handleModClick(modCode)}
            >
              <BSNavLink className={bem.e('nav-item-collapse')}   style={{...padStyle,...fontSize}}>
                <div className="d-flex">
                  <MdPages className={bem.e('nav-item-icon')} />
                  <span className=" ">{modName}</span>
                </div>
                <MdKeyboardArrowDown
                  className={bem.e('nav-item-icon')}
                  style={{
                    padding: 0,
                    transform: isModOpen[modCode]
                      ? 'rotate(0deg)'
                      : 'rotate(-90deg)',
                    transitionDuration: '0.3s',
                    transitionProperty: 'transform',
                  }}
                />
              </BSNavLink>
            </NavItem>
           
           <Collapse isOpen={isModOpen[modCode]}>
           {subModules.map(({ route, modName, IconComp  }, index) => (             
             <NavItem key={index} className={bem.e('nav-item')}>
               <BSNavLink 
                 id={`navItem-${modName}-${index}`}
                 className="text-camelcase ml-3"
                 style={{...padStyle,...fontSize}}
                 tag={NavLink}
                 to={route}
                 activeClassName="active"
                 exact={true} >
                <IconComp className={bem.e('nav-item-icon')} />
                 <span className="" >{modName}</span>
               </BSNavLink>
             </NavItem>
           ))}
         </Collapse>
            </div>

          ))}                 
          </Nav>
        </div>
      </aside>
    );

}

export default Sidebar;
