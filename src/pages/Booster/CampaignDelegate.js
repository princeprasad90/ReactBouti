import React, { useEffect, useState } from 'react';
import {  Card,  CardBody,  CardHeader,  Col,  Row,  Button,  Form,  FormGroup,
  Input,  Label,} from 'reactstrap';
import PageSpinner from 'components/PageSpinner';
import Page from 'components/Page';
import * as common from 'network/index';
import {  toast } from 'react-toastify';
import {AccessButtons,checkAccessControl} from 'actions/celebrityActions/celebAccessControl';
import { getCelebUsersRolesList } from 'actions/celebrityActions/UserActions';
import {   RMMappingCRUD } from 'actions/celebrityActions/OrderSearchActions';
import { useSelector, useDispatch } from "react-redux";
import { RoleNames } from 'utils';

function CampaignDelegate() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [isSettuped, setisSettuped] = useState(false);
  const [isDelegateAllowed, setisDelegateAllowed] = useState(false);
  const [delegateObj, setDelegateObj] = useState(null);
  const [delegateName, setDelegateName] = useState('');
  const [validDelegate, setvalidDelegate] = useState(true);
  const [userDelegate, setuserDelegate] = useState({
    userCode: 0,
    isDelegate: 0,
  });
  const celebUsersRoles = useSelector((state) => state.UserReducer.listCelebUsersRoles);
  const [currentUser, setcurrentUser] = useState(
    JSON.parse(localStorage.getItem('userData')),
  );
  const [delegateRadios, setdelegateRadios] = useState([
    { id: 1, isDelegate: 1, status: 'Enable' },
    { id: 0, isDelegate: 0, status: 'Disable' },
  ]);
  const dispatch = useDispatch();
  useEffect(() => {
    let isDelegateAllowedTemp = checkAccessControl(AccessButtons.DelegateEnable,true);
    setisDelegateAllowed(isDelegateAllowedTemp);
    const { isDelegate  , magentoUserId} = currentUser;	
    setuserDelegate({ ...userDelegate, userCode: magentoUserId });

    getAll(magentoUserId);
    const row = delegateRadios.map(item => {
      if (item.isDelegate == isDelegate) {
        item.isDelegate = 1;
      } else {
        item.isDelegate = 0;
      }
      return item;
    });
    setdelegateRadios([...row]);
  }, []);

  const getAll = async(magentoUserId)=>{
    
    try{
    
      let delegateRes = await common.apiCall2('GET', `ApprovalMatrix/GetApprovalMatrixById/${magentoUserId}`, {});
      setDelegateObj(delegateRes.data);
    }
     catch(error){
      console.log(error);
     }
  }

// useEffect(() => {
//   if(celebUsersRoles.length>0 && delegateObj!==null && delegateObj!==undefined )
//   {
    
//     let validDelegate = true;
//     let name = '';
//     try{
//       let {delegate1} = delegateObj;
//       if(delegate1==null || delegate1==undefined){
//         validDelegate = false;
//         name = 'No Delegate assined';
//       }
//       else{
//         let obj = celebUsersRoles.find(d=>Number(d.magentoUserId)===Number(delegate1));
//         if(obj!==undefined){
//           let delegatePriorityRole = obj.celebPriorityRole;
//           if(delegatePriorityRole.roleId === RoleNames.CelebJuniorRM){
//             validDelegate = true;
//             name = obj.userName;
//           }
//           else if (delegatePriorityRole.roleId === RoleNames.CelebSeniorRM){
//            getJuniorsBySeniorRM(obj.magentoUserId,obj.userName);
            
//           }
//         }
//         else{
//           validDelegate = false;
//           name = 'Not Valid User';
//         }
//         setvalidDelegate(validDelegate);
//         setDelegateName(name);
//       }
//     }
//     catch(e){
//       console.log(e);
//     }

//   }
  
// }, [celebUsersRoles,delegateObj])

// const getJuniorsBySeniorRM = async(magentoUserId,userName)=>{
//   let reqObj = {
//     flag: 'GetBySeniorRM',
//     seniorMagentoUserId: magentoUserId,
//     juniorMagentoUserId: 0
//   };
//   let data = await RMMappingCRUD(reqObj);  
//   let juniorsMapArray = data.result;
//   let juniorExists = juniorsMapArray.some(j=>Number(j.juniorMagentoUserId)===Number(currentUser.magentoUserId));
//   let validDelegate = juniorExists;
//   let name =juniorExists? userName:'Not Users Senior';
//   setvalidDelegate(validDelegate);
//   setDelegateName(name);

// }
  const SETDELEGATE = e => {

    let delegID = e.target.value;
    
    const delegates = delegateRadios.map(item => {
      if (item.id == delegID) {
        item.isDelegate = 1;
      } else {
        item.isDelegate = 0;
      }
      return item;
    });

    setdelegateRadios([...delegates]);
  
  };

  const SAVERULE = () => {
    setisSettuped(true);
    let delegate = delegateRadios.filter(r => r.isDelegate)[0];
    let objDelegate={};
    objDelegate.userCode=userData.magentoUserId;
    objDelegate.isDelegate=delegate.id;
    common.apiCall2('POST',`UserRegister/UpdateIsDelegateCampaign`, objDelegate)
      .then(res => {
        setisSettuped(false);
        let {data} = res;
        if (data.result !==null && data.result !== undefined)
        {
          userData.isDelegate = data.result.isDelegate;
          localStorage.setItem('userData', JSON.stringify(userData));

        }
       if(data.message.includes('success'))
       {
        toast.info(res.data.message);
       }
      else
      {
        toast.error(res.data.message);
      }
        
      })
      .catch(e=>console.error('error',e));
  };

  return (
    <Page className="TablePage">
     
      <Row>
        <Col>
          <Card className="mb-3 mt-2">
          <CardHeader>Delegate Master-Campaign</CardHeader>

            <CardBody>
              <Row>
                <Col>
                  <Card body>
                    <Form className="ml-4">
                      <span>DelegateName : {delegateName}</span>
                      <FormGroup tag="fieldset" row>
                        <Col sm={10}>
                          {delegateRadios.map((delegate, index) => {
                            const { id, status, isDelegate } = delegate;
                            return (
                              <FormGroup check key={index}>
                                <Label check>
                                  <Input
                                    type="radio"
                                    name="delegateRadio"
                                    value={id}
                                    checked={isDelegate}
                                    onChange={SETDELEGATE}
                                  />
                                  {status}
                                </Label>
                              </FormGroup>
                            );
                          })}
                        </Col>
                      </FormGroup>
                 
                      <div style={{ float: 'left', position: 'relative' }}>
                      { validDelegate && isDelegateAllowed &&  <a href="#" onClick={SAVERULE} color="primary" className="caret btn-sm mr-10">Save
                        </a>}

                      </div>
                      {isSettuped && <PageSpinner />}
                    </Form>
                  </Card>
                </Col>
              </Row>
            </CardBody>
          </Card> 
        </Col>
      </Row>
    </Page>
  );
}

export default CampaignDelegate;
