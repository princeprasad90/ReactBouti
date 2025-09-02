import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {  Card, CardBody, CardHeader, Col, Row, ModalHeader, Button, Form,
  FormGroup,  Label, Modal, ModalBody, ModalFooter
} from 'reactstrap';
import { FaEdit, FaBan } from 'react-icons/fa';
import * as common from 'network/index';
import Page from 'components/Page';
import { toast } from 'react-toastify';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import { RoleNames } from 'utils';
import Select from 'react-select';
import {RMMappingCRUD} from 'actions/celebrityActions/OrderSearchActions';
import {getCelebUsersRolesList} from 'actions/celebrityActions/UserActions';

const RMMapping = () => {
  const [listRMMapping, setlistRMMapping] = useState([]);
  const celebUsersRoles = useSelector((state) => state.UserReducer.listCelebUsersRoles);
  const [seniorRMList, setseniorRMList] = useState([]);
  const [juniorRMList, setjuniorRMList] = useState([]); 
  const [seniorRMDropDownList, setseniorRMDropDownList] = useState([]);
  const [juniorRMDropDownList, setJuniorRMDropDownList] = useState([]);
  const [tableRMMapping, settableRMMapping] = useState([]);
  const [addModal, setaddModal] = useState(false);
  const [editModal, seteditModal] = useState(false);
  const [newSrRM, setnewSrRM] = useState(null);
  const [newJrRM, setnewJrRM] = useState(null);
  const [editSrRM, seteditSrRM] = useState(null);
  const [selectedMapObj, setselectedMapObj] = useState(null);
  const dispatch = useDispatch();

  const Columns = [{ dataField: 'juniorRM.userName', text: 'JuniorRM', filter: textFilter() },
  { dataField: 'seniorRM.userName', text: 'SeniorRM', filter: textFilter() },
  { dataField: 'action', text: '' }];

  const toggleAddModal = () => {
    setaddModal((prev) => {
      return !prev;
    });
  };
  const toggleEditModal = () => {
    seteditModal((prev) => {
      return !prev;
    });
  };
  const handleEdit = (e)=>{
   let obj = JSON.parse(e.currentTarget.getAttribute('data-obj'));
   setselectedMapObj(obj);
   let seniorRM = obj.seniorRM;
   let seniorRMDropDownOption = seniorRMDropDownList.find(s=>Number(s.value)===seniorRM.magentoUserId)
   seteditSrRM(seniorRMDropDownOption?seniorRMDropDownOption:null);
   toggleEditModal();
  }

  useEffect(() => {
    let init = async () => {
      try {  
        if (celebUsersRoles.length === 0) {
          await dispatch(getCelebUsersRolesList({}));
        }

        let reqObj = {
          flag:'Read',
          seniorMagentoUserId: 0,
          juniorMagentoUserId: 0
        };
        let data = await RMMappingCRUD(reqObj);
        setlistRMMapping(data.status?data.result:[]);
      }
      catch (e) {
        toast.error(`Something went wrong with Api`);
      }
    }
    init();
  }, []);

  useEffect(() => {
    let seniorRMTemp = celebUsersRoles.filter(e => e.celebPriorityRole.roleId === RoleNames.CelebSeniorRM);
    setseniorRMList(seniorRMTemp);
    let juniorRMTemp = celebUsersRoles.filter(e => e.celebPriorityRole.roleId === RoleNames.CelebJuniorRM);
    setjuniorRMList(juniorRMTemp);
    let tableRMMappingTemp = [];
    listRMMapping.forEach(l => {
      let seniorRM = seniorRMTemp.find(s => s.magentoUserId === l.seniorMagentoUserId);
      let juniorRM = juniorRMTemp.find(j => j.magentoUserId === l.juniorMagentoUserId);

      if (seniorRM !== undefined && juniorRM !== undefined) {
        let obj = {seniorRM, juniorRM};
        let action = <><a style={{ cursor: 'pointer', color: 'blue' }} data-obj = {JSON.stringify(obj)} className="ml-3 mr-3 " onClick={handleEdit} ><FaEdit /></a>
        <a style={{ cursor: 'pointer', color: 'red' }} data-obj = {JSON.stringify(obj)} onClick={handleDelete}  ><FaBan /></a></>;
         tableRMMappingTemp.push({ ...obj, action, id:l.id });
      }
      else if(seniorRM === undefined || juniorRM === undefined)
      {
         seniorRM = celebUsersRoles.find(s => s.magentoUserId === l.seniorMagentoUserId);
         juniorRM = celebUsersRoles.find(j => j.magentoUserId === l.juniorMagentoUserId);
        let obj = {seniorRM, juniorRM};
        let action = <><a style={{ cursor: 'pointer', color: 'blue' }} data-obj = {JSON.stringify(obj)} className="ml-3 mr-3 " onClick={handleEdit} ><FaEdit /></a>
        <a style={{ cursor: 'pointer', color: 'red' }} data-obj = {JSON.stringify(obj)} onClick={handleDelete}  ><FaBan /></a>
        <span className="badge badge-pill badge-danger">Wrong Mapping </span></>;
         tableRMMappingTemp.push({ ...obj, action, id:l.id });
      }
      settableRMMapping(tableRMMappingTemp);
    });
    let juniorRMDropDownListTemp = [];
    juniorRMTemp.forEach(j => {
      let exists = listRMMapping.find(l => l.juniorMagentoUserId === j.magentoUserId);
      if (exists == undefined) {
        juniorRMDropDownListTemp.push({ label: j.userName, value: j.magentoUserId });
      }
    });
    setJuniorRMDropDownList(juniorRMDropDownListTemp);
  }, [celebUsersRoles, listRMMapping]);

  useEffect(() => {
    let seniorRMDropDownListTemp = seniorRMList.map(s => ({ label: s.userName, value: s.magentoUserId }));
    setseniorRMDropDownList(seniorRMDropDownListTemp);
  }, [seniorRMList]);

  const createMapping = async(e) => {
       if (newSrRM === null) {
          toast.error("Please select Senior RM");
          return;
        }
        if (newJrRM === null) {
          toast.error("Please select Junior RM");
          return;
        }
        let reqObj = {
          flag:"Create",
          seniorMagentoUserId: Number(newSrRM.value),
          juniorMagentoUserId: Number(newJrRM.value)
        };
        let data = await RMMappingCRUD(reqObj);
        setlistRMMapping(data.status?data.result:[]);
        toggleAddModal();
        setnewSrRM(null);
        setnewJrRM(null);
  }
  const updateMapping = async(e) => {
    if (editSrRM === null) {
      toast.error("Please select Senior RM");
      return;
    }   
    let reqObj = {
      flag:'Update',
      seniorMagentoUserId: Number(editSrRM.value),
      juniorMagentoUserId: Number(selectedMapObj.juniorRM.magentoUserId)
    };
    let data = await RMMappingCRUD(reqObj);
    setlistRMMapping(data.status?data.result:[]);
    toggleEditModal();
    seteditSrRM(null);
    setselectedMapObj(null);
}
const handleDelete = async(e)=>{
  if (window.confirm('Are you sure to delete .. ?')) {
    console.log("okay")
    let obj = JSON.parse(e.currentTarget.getAttribute('data-obj'));
    let reqObj = {
      flag:'Delete',
      id:obj.id,
      seniorMagentoUserId: obj.seniorRM.magentoUserId,
      juniorMagentoUserId: obj.juniorRM.magentoUserId
    };
    let data = await RMMappingCRUD(reqObj);
    setlistRMMapping(data.status?data.result:[]);
  }
}

  return (
    <Page >
      <Modal toggle={toggleAddModal} isOpen={addModal} size="md">
        <ModalHeader toggle={toggleAddModal}>Add New Mapping</ModalHeader>
        <ModalBody>
          <Card body>
            <Form>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Senior RM
                </Label>
                <Col sm={9}>
                  <Select name="selSeniorRM" placeholder='Select Senior RM'
                    onChange={(val, act) => setnewSrRM(val)}
                    value={newSrRM}
                    isClearable={true} options={seniorRMDropDownList} />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Junior RM
                </Label>
                <Col sm={9}>
                  <Select name="selJuniorRM" placeholder='Select Junior RM'
                    onChange={(val, act) => setnewJrRM(val)}
                    value={newJrRM}
                    isClearable={true} options={juniorRMDropDownList} />
                </Col>
              </FormGroup>
            </Form>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button color="primary"  onClick={createMapping} size="sm" >
            Save
          </Button>
        </ModalFooter>
      </Modal>
      <Modal toggle={toggleEditModal} isOpen={editModal} size="md">
        <ModalHeader toggle={toggleEditModal}>Edit Mapping</ModalHeader>
        <ModalBody>
          <Card body>
            <Form>
             <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Junior RM
                </Label>
                <Col sm={9}>
                <Label  style={{ fontSize: '15px' }}>
                  {selectedMapObj && (selectedMapObj.juniorRM.userName||'')}
                </Label>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Senior RM
                </Label>
                <Col sm={9}>
                  <Select name="editSeniorRM" placeholder='Select Senior RM'
                    onChange={(val, act) => seteditSrRM(val)}
                    value={editSrRM}
                    isClearable={true} options={seniorRMDropDownList} />
                </Col>
              </FormGroup>
              
            </Form>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button color="primary"  onClick={updateMapping} size="sm" >
            Save
          </Button>
        </ModalFooter>
      </Modal>
      <Row>
        <Col>
          <Card className="mb-3">
            <CardHeader>RM Mapping </CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <div style={{ float: 'left', position: 'relative' }}>
                    <a href="#" onClick={toggleAddModal} color="primary" className="caret btn-sm mr-10">+Add RM Mapping
                    </a>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Card body>
                    <BootstrapTable id="tblRMMapping" bootstrap4 keyField='id' classes="customTable"
                      data={tableRMMapping} columns={Columns} filter={filterFactory()}
                      pagination={paginationFactory()} />
                  </Card>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Page>
  );
};

export default RMMapping;
