import React, { useEffect, useState } from 'react';
import {  Card,  CardBody,  CardHeader,  Col,  Row,Spinner,
  Table,  Button, Form,  FormGroup,  Input,  Label,
  Modal,  ModalHeader,  ModalBody,  ModalFooter,
} from 'reactstrap';
import { FaEdit } from 'react-icons/fa';
import Page from 'components/Page';
import { toast } from 'react-toastify';
import {RoleNames} from '../../../utils/roleNames'
import * as common from '../../../network/index';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';

const UserMaster = () => {
  const [userMaster, setuserMaster] = useState({
    id: 0,
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    posId: 0,
    departmentId: 0,
    managerId: 0,
    isBlocked: false,
  });
  const [userMasters, setuserMasters] = useState([]);
  const [userMastersTable, setuserMastersTable] = useState([]);
  // const [rolesDrop, setrolesDrop] = useState([]);
  const [departmentsDrop, setdepartmentsDrop] = useState([]);
  const [positionList, setpositionList] = useState([]);
  const [positionDrop, setpositionDrop] = useState([]);
  const [selectedDept, setselectedDept] = useState();
  // const [managersDrop, setmanagersDrop] = useState([]);
  // const [enablemanagerDrop, setenablemanagerDrop] = useState(true);
  const [editMode, seteditMode] = useState(false);


  const [modal, setModal] = useState(false);
  const Columns = [{
    dataField: 'userName', text: 'Username', filter: textFilter()
  },
  { dataField: 'role', text: 'Role' },
  { dataField: 'department', text: 'Department' },
  { dataField: 'IsBlocked', text: 'IsBlock' },
  { dataField: 'Isdelegate', text: 'IsDelegate' },
  { dataField: 'edit', text: 'Edit' }
  ];
const [isLoading, setisLoading] = useState(false);

  useEffect(() => {
    // Grid
    common.apiCall2('GET',`UserRegister/GetUserRegisterList`).then(res => {
      setuserMasters(res.data);
    });

       // Position Drop
    common.apiCall2('GET',`AdminRole/GetPositionsList`).then(res => {
      setpositionList(res.data);
    });

    // // Role Drop
    // common.apiCall2('GET',`AdminRole/GetRolesList`).then(res => {
    //   setrolesDrop(res.data);
    // });

    // Department Drop
    common.apiCall2('GET',`AdminDepartment/GetDepartmentsList`).then(res => {
      setdepartmentsDrop(res.data);
    });

    // Manager Drop
    // common.apiCall2('GET',`UserRegister/GetUserManagerList`).then(res => {
    //   setmanagersDrop(res.data);
    // });
  }, []);

  useEffect(() => {
    let listforTable = [];
    userMasters.forEach(obj=>{
      let temp = {...obj};
      temp.IsBlocked = (obj.isBlocked===0)?'NO':'YES';
      temp.Isdelegate = (obj.isDelegate===0)?'NO':'YES';
      temp.edit = <a style={{cursor:'pointer',color:'blue'}} onClick={() => BINDUSER(obj)} >
        <FaEdit />
      </a>;
      listforTable.push(temp);
    });
    setuserMastersTable([...listforTable]);
  }, [userMasters]);

  useEffect(() => {
    let tempList = [];
    if(!editMode){
       tempList = positionList.filter(p=>p.deptId===selectedDept);
    }
    else
    {
      tempList = [...positionList];
    }
    setpositionDrop(tempList);
  }, [selectedDept,positionList,editMode])
  let errorMessages = [];

  const CREATEUSERPOPUP = () => {
    setModal(!modal);

    seteditMode(false);

    setuserMaster({
      id: 0,
      userName: '',
      firstName: '',
      lastName: '',
      email: '',
      posId: 0,
      departmentId: 0,
      managerId: 0,
      isBlocked: false,
    });
  };

  const BINDUSER = model => {
    setModal(!modal);

    //const { roleCode } = model;
    // if (roleCode == 4) {
    //   setenablemanagerDrop(true);
    // } else {
    //   setenablemanagerDrop(false);
    // }

    seteditMode(true);
    console.log("In Edit mode",model);
    setuserMaster({
      id: model.id,
      userName: model.userName,
      email: model.email,
      posId:model.posId,
      departmentId: model.deptCode,
      managerId: model.managerId,
      isBlocked: model.isBlocked,
      blockedReason:model.blockedReason
    });
  };

  // const ROLECHANGE = e => {
  //   let roleId = e.target.value;
  //   if (roleId == 4) {
  //     setenablemanagerDrop(true);
  //   } else {
  //     setenablemanagerDrop(false);
  //   }
  //   setuserMaster({ ...userMaster, roleId: +roleId });
  // };

  const VALIDATION = model => {
    let validation = true;
    errorMessages = [];
    if (model.userName == '') {
      errorMessages.push('Username is required');
      validation = false;
    }
    if (model.firstName == '') {
      errorMessages.push('firstName is required');
      validation = false;
    }
    if (model.lastName == '') {
      errorMessages.push('LastName is required');
      validation = false;
    }

    if (model.email == '') {
      errorMessages.push('Email is required');
      validation = false;
    }
    
    if (editMode && model.isBlocked && !model.blockedReason ){
      console.log("editmode",editMode,model);

    }
    // if (model.roleId == 0) {
    //   errorMessages.push('Role is required');
    //   validation = false;
    // }

    // if (model.roleId == 4 && model.managerId == 0) {
    //   errorMessages.push('Manager is required');
    //   validation = false;
    // }

    if (model.departmentId == 0) {
      errorMessages.push('Department is required');
      validation = false;
    }

    return validation;
  };

  const RESETUSER = _ => {
    seteditMode(false);

    setuserMaster({
      id: 0,
      userName: '',
      firstName: '',
      lastName: '',
      email: '',
      posId: 0,
      departmentId: 0,
      managerId: 0,
      isBlocked: false,
    });
  };

  const ADDUSER = _ => {
    setisLoading(true);
      let validation = VALIDATION(userMaster);
    if (!validation) {
      let msg = '';
      errorMessages.forEach(v => {
        msg += v + ` , `;
      });
      toast.error(msg);
    } 
    else {
      try{
        common.apiCall2('POST',`UserRegister/AddUserRegister`, userMaster)
        .then(res => {
          toast.info(res.data);
          setisLoading(false);
        });
      }catch(e){
        toast.error("Something went wrong in API");
        setisLoading(false);
      }
    }
   
  };

  const handleDeptChange = (e)=>{
    console.log("Dept Changed", e,e.target.value);
    let selectedDept = +e.target.value;
    setselectedDept(selectedDept);
                      setuserMaster({
                        ...userMaster,
                        departmentId: selectedDept,
                      });
  }

  return (
    <Page >
      <Modal isOpen={modal} toggle={CREATEUSERPOPUP} size="md">
        <ModalBody>
          <Card body>
            <Form>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Email
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="email"
                    name="emailID"
                    placeholder="Email"
                    disabled={editMode}
                    value={userMaster.email || ''}
                    onChange={e =>
                      setuserMaster({
                        ...userMaster,
                        email: e.target.value,
                      })
                    }
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Username
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="text"
                    name="username"
                    placeholder="Username"
                    disabled={editMode}
                    value={userMaster.userName || ''}
                    onChange={e =>
                      setuserMaster({
                        ...userMaster,
                        userName: e.target.value,
                      })
                    }
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  FirstName
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="text"
                    name="firstname"
                    placeholder="Firstname"
                    disabled={editMode}
                    value={userMaster.firstName || ''}
                    onChange={e =>
                      setuserMaster({
                        ...userMaster,
                        firstName: e.target.value,
                      })
                    }
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  LastName
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="text"
                    name="lastname"
                    placeholder="Lastname"
                    disabled={editMode}
                    value={userMaster.lastName || ''}
                    onChange={e =>
                      setuserMaster({
                        ...userMaster,
                        lastName: e.target.value,
                      })
                    }
                  />
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Department
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="select"
                    name="departmentId"
                    disabled={editMode}
                    value={userMaster.departmentId || 0}
                    onChange={handleDeptChange}
                  >
                    <option>-- Select --</option>
                    {departmentsDrop.map((departmentObj, index) => {
                      const { id, deptName } = departmentObj;
                      return (
                        <option key={index} value={id}>
                          {deptName}
                        </option>
                      );
                    })}
                  </Input>
                </Col>
              </FormGroup>
             
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Position
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="select"
                    name="posId"
                    disabled={editMode}
                    value={userMaster.posId || 0}
                    onChange={e =>
                      setuserMaster({
                        ...userMaster,
                        posId: +e.target.value,
                      })
                    }
                  >
                    <option>-- Select --</option>
                    {positionDrop.map((positionObj, index) => {
                      const { id, position } = positionObj;
                      return (
                        <option key={index} value={id}>
                          {position}
                        </option>
                      );
                    })}
                  </Input>
                </Col>
              </FormGroup>
              {/* <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Role
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="select"
                    name="roleId"
                    disabled={editMode}
                    value={userMaster.roleId || 0}
                    onChange={ROLECHANGE}
                  >
                    <option>-- Select --</option>
                    {rolesDrop.map((roleObj, index) => {
                      const { id, roleName } = roleObj;
                      return (
                        <option key={index} value={id}>
                          {roleName}
                        </option>
                      );
                    })}
                  </Input>
                </Col>
              </FormGroup> */}

           

              {/* {enablemanagerDrop && (
                <FormGroup row>
                  <Label sm={3} style={{ fontSize: '15px' }}>
                    Manager
                  </Label>
                  <Col sm={9}>
                    <Input
                      style={{ fontSize: '15px' }}
                      type="select"
                      name="managerId"
                      disabled={editMode}
                      value={userMaster.managerId || 0}
                      onChange={e =>
                        setuserMaster({
                          ...userMaster,
                          managerId: +e.target.value,
                        })
                      }
                    >
                      <option>-- Select --</option>
                      {managersDrop.map((managerObj, index) => {
                        const { magentoUserId: id, userName } = managerObj;
                        return (
                          <option key={index} value={id}>
                            {userName}
                          </option>
                        );
                      })}
                    </Input>
                  </Col>
                </FormGroup>
              )} */}

              {editMode && (
                <FormGroup row>
                  <Label for="checkbox2" sm={3} style={{ fontSize: '15px' }}>
                    Blocked
                  </Label>
                  <Col sm={{ size: 9 }}>
                    <FormGroup check>
                        <Input
                          type="checkbox"
                          name="isBlocked"
                          onChange={e =>setuserMaster({
                              ...userMaster,
                              isBlocked: e.target.checked,
                            })
                          }
                          checked={userMaster.isBlocked || false}
                        />
                    </FormGroup>
                  </Col>
                </FormGroup>
              )}

              {editMode && (
                <FormGroup row>
                  <Label for="BlockedReason" sm={3} style={{ fontSize: '15px' }}>
                  Blocked Reason
                  </Label>
                  <Col sm={{ size: 9 }}>
                    <FormGroup check>
                      <Input
                        type="textarea"
                        name="BlockedReason"
                        id="BlockedReason"
                        value={userMaster.blockedReason}
                        onChange={e =>setuserMaster({
                          ...userMaster,
                          blockedReason: e.target.value,
                        })
                      }
                      />
                    </FormGroup>
                  </Col>
                </FormGroup>
              )}
            </Form>
          </Card>
        </ModalBody>
        <ModalFooter>
         {!isLoading && <Button color="primary" size="sm" onClick={ADDUSER}>
            SAVE
          </Button>}
          {isLoading && <Spinner animation="border" variant="primary" />}
          {!editMode && (
            <Button color="warning" size="sm" onClick={RESETUSER}>
              CLEAR
            </Button>
          )}

          <Button
            color="secondary"
            size="sm"
            onClick={() => {
              setModal(!modal);
            }}
          >
            CLOSE
          </Button>
        </ModalFooter>
      </Modal>

      <Row>
        <Col>
          <Card className="mb-3">
            <CardHeader>User Master</CardHeader>
            <div style={{ float: 'left', position: 'relative' }}>
              <a href="#" onClick={CREATEUSERPOPUP} color="primary" className="caret btn-sm mr-10">+ Add User
               </a>
            </div>
            <CardBody>
              <BootstrapTable bootstrap4 keyField='userName' classes="customTable"
                data={userMastersTable} columns={Columns} filter={ filterFactory()}
                pagination={paginationFactory()} />
            </CardBody>
          </Card>
        </Col>
      </Row>

    </Page>
  );
};

export default UserMaster;
