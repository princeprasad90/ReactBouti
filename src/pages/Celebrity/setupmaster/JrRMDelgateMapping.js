import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import {  Modal, ModalBody, ModalFooter, ModalHeader, Button, Form, Badge,
  Card, CardBody, CardHeader, Col, FormGroup, Label, Row
} from 'reactstrap';
import { useSelector, useDispatch } from "react-redux";
import Page from 'components/Page';
import { toast } from 'react-toastify';
import { Spinner } from 'react-bootstrap';
import { RoleNames} from 'utils';
import { FaEdit } from 'react-icons/fa';
import * as common from 'network/index';
import {getCelebUsersRolesList} from 'actions/celebrityActions/UserActions';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
const JrRMDelgateMapping = () => {
  const celebUsersRoles = useSelector((state) => state.UserReducer.listCelebUsersRoles);
  const [listRMMapping, setlistRMMapping] = useState([]);
  const [ddlDelegate, setddlDelegate] = useState([]);
  const [editJrRM, setEditJrRM] = useState(null);
  const [Mapgrid, setMapgrid] = useState([]);
  const [editModal, seteditModal] = useState(false);
  const [selectedMapObj, setselectedMapObj] = useState();
  const [isSaving, setisSaving] = useState(false);
  const dispatch = useDispatch();

  const gettableData = async () => {
    try {
      let output = await common.apiCall2('POST', `ApprovalMatrix/GetJrRMApprovalMatrix`, {});
      let { data } = output;
      if (data.status) {
        let tableData = [];
        let { result } = data;
        result.forEach(obj => {
          let userObj = celebUsersRoles.find(a => a.magentoUserId == obj.userId);
          let delegateObj = celebUsersRoles.find(a => a.magentoUserId == obj.delegate1);
          let delegate = null;
          let isDelegateSeniorOrJuniorRM = true;
          if (userObj !== undefined) {
            let isJuniorRM = userObj.celebPriorityRole.roleId === RoleNames.CelebJuniorRM;
            if (delegateObj !== undefined) {
              isDelegateSeniorOrJuniorRM = delegateObj.celebPriorityRole.roleId === RoleNames.CelebJuniorRM ||
                delegateObj.celebPriorityRole.roleId === RoleNames.CelebSeniorRM;
              delegate = delegateObj.userName;
            }
            if (isJuniorRM === true) {
              obj.isDelegateSeniorOrJuniorRM = isDelegateSeniorOrJuniorRM;
              obj.juniorRMName = userObj.userName;
              obj.delegateName = delegate;
              obj.action = <> <a style={{ cursor: 'pointer', color: 'blue' }} data-obj={JSON.stringify(obj)}
                className="ml-3 mr-3 " onClick={handleEdit} ><FaEdit /></a>
                {!isDelegateSeniorOrJuniorRM && <span className="badge badge-pill badge-danger">Wrong Delegate</span>}
              </>
              tableData.push(obj);
            }
          }
        });
        setMapgrid(tableData)
      }
      else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(`Something went wrong`);
    }
  };
  const toggleEditModal = () => {
    seteditModal((prev) => {
      return !prev;
    });
  };
  const RMMappingCRUD = async (obj) => {
    try {
      let output = await common.apiCall2('POST', `RMMapping/Celeb_RMMappingCRUD`, { ...obj });
      let { data } = output;
      return data;
    }
    catch (e) {
      console.log("Error :",e);
      toast.error(`Something went wrong with api`)
    }

  }
  const handleEdit = (e) => {
    let obj = JSON.parse(e.currentTarget.getAttribute('data-obj'));
    let juniorRMTemp = celebUsersRoles.filter(e => e.celebPriorityRole.roleId === RoleNames.CelebJuniorRM);
    let ddlJuniorTemp = juniorRMTemp.map(j => ({ label: j.userName, value: j.magentoUserId }));
    setselectedMapObj(obj);
    setEditJrRM((obj.delegateName) ? { label: obj.delegateName, value: obj.delegate1 } : null);
    let seniorRMOptions = [];
    let seniorRMMapObj = listRMMapping.find(l=>l.juniorMagentoUserId == obj.userId);
    if (seniorRMMapObj !== undefined){
      let seniorRMObj = celebUsersRoles.find(e => e.magentoUserId === seniorRMMapObj.seniorMagentoUserId &&
                                                  e.celebPriorityRole.roleId===RoleNames.CelebSeniorRM);
      if(seniorRMObj!==undefined)                                            
      seniorRMOptions.push({label: seniorRMObj.userName, value: seniorRMObj.magentoUserId})
    }
    let delegateList = [
      {
        label: 'Senior RM',
        options: seniorRMOptions,
      },
      {
        label: 'Junior RM',
        options: ddlJuniorTemp,
      },
    ];
    setddlDelegate(delegateList);
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
      let req = { ...selectedMapObj, delegate1: +editJrRM.value, };
       let response = await common.apiCall2('POST', 'ApprovalMatrix/UpdateApprovalMatrix', req);
       toast.success(response.data);
       setselectedMapObj(null);
       await gettableData();
       toggleEditModal();
      
    } catch (e) {
      toast.error(`Something went wrong`);
    }
    setisSaving(false);
  }
  useEffect(() => {
    getAll();
  }, []);
  const getAll = async () => {
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
  useEffect(() => {
    if (celebUsersRoles.length > 0) {
      gettableData();
    }
  }, [celebUsersRoles,listRMMapping]);

  const Columns = [
    { dataField: 'juniorRMName', text: 'Junior RM', filter: textFilter() },
    { dataField: 'delegateName', text: 'Delegate', filter: textFilter() },
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
                  Junior RM
                </Label>
                <Col sm={9}>
                  <Label style={{ fontSize: '15px' }}>
                    {selectedMapObj && (selectedMapObj.juniorRMName || '')}
                  </Label>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Delegate
                </Label>
                <Col sm={9}>
                  <Select name="editSeniorRM" placeholder='Select Delegate'
                    onChange={(val, act) => setEditJrRM(val)}
                    value={editJrRM}
                    isClearable={true}
                    options={ddlDelegate}
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
            <CardHeader>Junior RM - Delegate Mapping</CardHeader>
            <CardBody>
              <FormGroup check row>
              </FormGroup>
              <hr />
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
export default JrRMDelgateMapping;