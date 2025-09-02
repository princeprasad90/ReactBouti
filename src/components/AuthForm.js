import React, { useState} from 'react';
import { useDispatch } from "react-redux";
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import jsCookie from "js-cookie";
import { userLogin } from 'actions/AuthAction';
import {getCelebPriorityRole} from 'actions/helper/RoleActions';
import { getCreateMenuAction,getMenuSuccessRequest } from "../actions/helper/menuActions";
import { useHistory } from "react-router-dom";
import {  Spinner } from 'react-bootstrap';
const AuthForm = () => {
  const [user, setUser] = useState({});
  const [issubmiting, setissubmiting] = useState(false);
  const { register, handleSubmit, errors } = useForm();
  const dispatch = useDispatch();
  let history = useHistory();
  const onSubmit = async (model) => {
    setissubmiting(true);
    user.UserName = model.txtUserName;
    user.Password = model.txtPassword;
    let response = await dispatch(userLogin(user));
    if (response.statusCode == 200) {
      let data = response.result;
      const token = {
        "accessToken": data.bearerToken,
        "expiry": time,
        "userCode": data.userCode,
        "userName": data.userName,
        "roleCode": data.roleCode,
        "deptCode": data.deptCode,
        "empCode": data.empCode,
        "magentoUserId": data.magentoUserId,
        "isDelegate": data.isDelegate,
      }
      data.celebPriorityRole = getCelebPriorityRole(data.roles);
      localStorage.setItem('userData', JSON.stringify(data));
      let menu = await dispatch(getCreateMenuAction(data.userCode));
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
        dispatch(getMenuSuccessRequest(routesTemp));
      }
     

      const dt = new Date();
      dt.setMinutes( dt.getMinutes() + 60);
      const time = new Date(dt);
      const maxAge = time;
      jsCookie.set('accessToken', token, { expires: maxAge })
      history.push({ pathname: '/Welcome' });
      // history.go();
    }
   else {
    setissubmiting(false);
   }
  }

  const handleEnter = (e)=>{
    if (e.key ==='Enter'|| e.keyCode===13){
      handleSubmit(onSubmit)();
    }
  }
  return (
    <div>
      <NotificationContainer />
      <Form onSubmit={handleSubmit(onSubmit)}>
        {(
          <div className="text-center pb-4">
            <img
              // src={logo200Image}
              src='https://www.boutiqaat.com/static/images/logo.svg'
              className="rounded"
              style={{ width: 185, height: 60, cursor: 'pointer' }}
              alt="logo"
            />
            <div ><span >{process.env.REACT_APP_ENV_NAME} Celebrity Portal</span></div>
          </div>
        )}
        <FormGroup>
          <Label for={"UserName"}>{"UserName"}</Label>
          <input type="text" name="txtUserName" className="form-control" placeholder="UserName"
            ref={register({ required: true })}
            value={user.UserName || ''}
            onChange={e => setUser({ ...user, UserName: e.target.value })} />
          {errors.txtUserName && errors.txtUserName.type === 'required' && <span className="text-danger">Enter UserName</span>}
        </FormGroup>
        <FormGroup>
          <Label for={"Password"}>{"Password"}</Label>
          <input type="password" name="txtPassword" className="form-control" placeholder="ActiveDirectory Password"
            ref={register({ required: true })}
            value={user.Password || ''}
            onKeyDown={e=>handleEnter(e)}
            onChange={e => setUser({ ...user, Password: e.target.value })} />
          {errors.txtPassword && errors.txtPassword.type === 'required' && <span className="text-danger">Enter ActiveDirectory Password</span>}
        </FormGroup>
        <hr />
        {issubmiting && <Spinner animation="border" variant="primary" />}
        {!issubmiting && <Button size="lg" className="bg-gradient-theme-left border-0" block onClick={handleSubmit(onSubmit)}>
          Login
        </Button> }
      </Form>

    </div>
  )
}
export default AuthForm;
export const STATE_LOGIN = 'LOGIN';
export const STATE_SIGNUP = 'SIGNUP';
