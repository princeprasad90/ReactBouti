import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import {
  Modal, ModalBody, ModalFooter, ModalHeader, Button, Form,
  Card, CardBody, CardHeader, Col, FormGroup, Label, Row
} from 'reactstrap';
import { useSelector, useDispatch } from "react-redux";
import Page from 'components/Page';
import { toast } from 'react-toastify';
import { Spinner } from 'react-bootstrap';
import { RoleNames, AppNames } from 'utils';
import { FaEdit } from 'react-icons/fa';
import * as common from 'network/index';
import { getCelebUsersRolesList } from 'actions/celebrityActions/UserActions';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
const AMJrRMMapping = () => {
  const [juniorRMList, setjuniorRMList] = useState([]);
  const [approvalMatrix, setApprovalMatrix] = useState([]);
  const [accountMangerList, setAccountMangerList] = useState([]);
  const [ddlJunoirRM, setdllJuniorRM] = useState([]);
  const [editJrRM, setEditJrRM] = useState(null);
  const [Mapgrid, setMapgrid] = useState([]);
  const [editModal, seteditModal] = useState(false);
  const [selectedMapObj, setselectedMapObj] = useState();
  const [isSaving, setisSaving] = useState(false);
  const celebUsersRoles = useSelector((state) => state.UserReducer.listCelebUsersRoles);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const dispatch = useDispatch();
  const toggleEditModal = () => {
    seteditModal((prev) => {
      return !prev;
    });
  };
  const handleEdit = (e) => {
    let obj = JSON.parse(e.currentTarget.getAttribute('data-obj'));
    console.log("obj",obj);
    setselectedMapObj(obj);
    setEditJrRM({ label:obj.jrm.userName, value:obj.jrm.magentoUserId });
    toggleEditModal();
  }
  const saveMapping = async (e) => {
    setisSaving(true);
    if (editJrRM === null) {
      toast.error("Please select Junior RM");
      setisSaving(false);
      return;
    }
    try {
      let req = { id:selectedMapObj.id,userId:selectedMapObj.am.magentoUserId, approvar1: +editJrRM.value }
      let response = await common.apiCall2('POST', 'ApprovalMatrix/UpdateApprovalMatrix', req);
      toast.success(response.data);
      setselectedMapObj(null);      
      toggleEditModal();
      await getApprovalMatrix();
    } catch (e) {
      toast.error(`Something went wrong`);
    }
    setisSaving(false);
  }
  useEffect(() => {
    getAll();
  }, []);

  const getApprovalMatrix = async() =>{
    try {
      let output = await common.apiCall2('GET', `ApprovalMatrix/GetApprovalMatrixList`, {});
      let { data } = output;
      setApprovalMatrix(data);      
    } catch (e) {
      toast.error(`Something went wrong`);
    }
  };

  const getAll = async () => {
    if (celebUsersRoles.length === 0) {
      await dispatch(getCelebUsersRolesList({}));
    }
   await getApprovalMatrix();
  
  }
  useEffect(() => {
    if (celebUsersRoles.length > 0 && approvalMatrix.length>0) {
      let juniorRMTemp = celebUsersRoles.filter(e => e.celebPriorityRole.roleId === RoleNames.CelebJuniorRM);
      setjuniorRMList(juniorRMTemp);
      let accountManagerTemp = celebUsersRoles.filter(e => e.celebPriorityRole.roleId === RoleNames.CelebAccountManager);
      setAccountMangerList(accountManagerTemp);
      let ddlJuniorTemp = juniorRMTemp.map(j => ({ label: j.userName, value: j.magentoUserId }));
      setdllJuniorRM(ddlJuniorTemp);
      let tableData=[];
      approvalMatrix.forEach(a=>{
         let am = accountManagerTemp.find(m=>Number(m.magentoUserId)===Number(a.userId));
         let jrm = juniorRMTemp.find(j=>Number(j.magentoUserId)===Number(a.approvar1));
         let wrongMapping = (am === undefined || jrm === undefined);
         am = (am===undefined)?celebUsersRoles.find(m=>Number(m.magentoUserId)===Number(a.userId)):am;
         jrm = (jrm===undefined)?celebUsersRoles.find(j=>Number(j.magentoUserId)===Number(a.approvar1)):jrm;
         let obj = {id:a.id,am,jrm};
         let  action = <> <a style={{ cursor: 'pointer', color: 'blue' }} data-obj={JSON.stringify(obj)}
         className="ml-3 mr-3 " onClick={handleEdit} ><FaEdit /></a> 
         {wrongMapping && <span className="badge badge-pill badge-danger"> Not AM - JrRM Mapping</span>}</>
         if(am!==undefined && jrm!==undefined)
            tableData.push({...obj,action}); 
      });
     setMapgrid(tableData);
    }
  }, [celebUsersRoles,approvalMatrix]);

  const Columns = [
    { dataField: 'am.userName', text: 'Account Manager', filter: textFilter() },
    { dataField: 'jrm.userName', text: 'Junior RM', filter: textFilter() },
    { dataField: 'action', text: '' }
  ];
  return (
    <Page >
      <Modal toggle={toggleEditModal} isOpen={editModal} size="md">
        <ModalHeader toggle={toggleEditModal}>Edit Mapping</ModalHeader>
        <ModalBody>
          <Card body>
            <Form>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Account Manager
                </Label>
                <Col sm={9}>
                  <Label style={{ fontSize: '15px' }}>
                    {selectedMapObj && (selectedMapObj.am.userName || '')}
                  </Label>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Junior RM
                </Label>
                <Col sm={9}>
                  <Select name="editSeniorRM" placeholder='Select Junior RM'
                    onChange={(val, act) => setEditJrRM(val)}
                    value={editJrRM}
                    isClearable={true}
                    options={ddlJunoirRM}
                  />
                </Col>
              </FormGroup>
            </Form>
          </Card>
        </ModalBody>
        <ModalFooter>
          {!isSaving && <Button color="primary" size="sm" onClick={saveMapping} >
            Save
          </Button>}
          {isSaving && <Spinner animation="border" variant="primary" />}
        </ModalFooter>
      </Modal>
      <Row >
        <Col>
          <Card className="mb-3">
            <CardHeader>Account Manager-Junior RM Mapping</CardHeader>
            <CardBody>

              <BootstrapTable id="tblRMMapping" bootstrap4 keyField='id' classes="customTable"
                data={Mapgrid} columns={Columns} filter={filterFactory()}
                pagination={paginationFactory()} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Page>
  );
};
export default AMJrRMMapping;