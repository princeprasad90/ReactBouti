import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect } from 'react'
import moment from 'moment';
import { Modal, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import {
  Button, Card, CardBody, CardHeader, Col, FormGroup,
  Input, Label, Row, Table, Collapse
} from 'reactstrap';
import Page from 'components/Page';
import {
  listMappedCelebrityAction, listMappedCoordinatorAction, listOrderStatusAction
} from 'actions/celebrityActions/CelebrityActions';
import { getCelebUsersRolesList } from 'actions/celebrityActions/UserActions';
import {  searchOrderReset, RMMappingCRUD } from 'actions/celebrityActions/OrderSearchActions';
import { RoleNames } from 'utils';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import * as common from 'network/index';
import { PaginationTypes, PageSizeVals } from 'constants/common';

const OrderSearch = () => {
  const [objRequest, setobjRequest] = useState({});
  const [orderData, setOrderData ] = useState([]);
  const [orderTableData, setorderTableData] = useState([]);
  const ddlCeleb1 = useSelector((state) => state.CelebrityReducer.listCelebrity);
  const ddlAgent = useSelector((state) => state.CelebrityReducer.listAgents);
  const [ddlSeniorRM, setDdlSeniorRM] = useState([]);
  const [ddlJuniorRM, setddlJuniorRM] = useState([]);
  const [ddlAM, setddlAM] = useState([]);
  const [ddlCeleb, setDdlCeleb] = useState([]);
  const celebUsersRoles = useSelector((state) => state.UserReducer.listCelebUsersRoles);
  const [celebHeirarchy, setCelebHeirarchy] = useState([]);
  const [mappedSeniorRM, setMappedSeniorRM] = useState([]);
  const [mappedJuniorRM, setMappedJuniorRM] = useState([]);
  const [mappedAM, setmappedAM] = useState([]);
  const [mappedCeleb, setMappedCeleb] = useState([]);
  const ddlOrderStatus = useSelector((state) => state.CelebrityReducer.listOrderStatus);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [ShowDetail, setShowDetail] = useState(false);
  const [lstViewData, setlstViewData] = useState([])
  const [isloading, setisloading] = useState(false);
  const [page, setpage] = useState(1);
  const [sizePerPage, setsizePerPage] = useState(10);
  const [totalSize, settotalSize] = useState(0);
  const [selectedSeniorRM, setSelectedSeniorRM] = useState(null);
  const [selectedCoordinator, setselectedCoordinator] = useState(null);
  const [selectedJuniorRM, setSelectedJuniorRM] = useState(null);
  const [selectedCelebrity, setselectedCelebrity] = useState(null);
  const [selectedCountry, setselectedCountry] = useState();
  const [isOpen, setIsOpen] = useState(true);
  const [isDdlEnabled, setIsDdlEnabled] = useState({ seniorRM: false, juniorRM: false, accountManager: false, celebrity: false });
  const dispatch = useDispatch();

  useEffect(() => {  
    getInitSetUp();
    getAll();
  }, []);
  const [countryDrop, setcountryDrop] = useState([
    { label: 'KW', value: 'KW' },
    { label: 'QA', value: 'QA' },
    { label: 'AE', value: 'AE' },
    { label: 'OM', value: 'OM' },
    { label: 'BH', value: 'BH' },
    { label: 'SA', value: 'SA' },
    { label: 'IQ', value: 'IQ' }

  ]);

  useEffect(() => {
    let listforTable = [];
    if ('data' in orderData) {
      orderData.data.forEach(obj => {
        let temp = { ...obj };
        temp.orderIdLink = <a className="btn btn-outline-dark  btn-sm" data-item={JSON.stringify(obj)} onClick={handleShow} >{obj.orderId}</a>;
        temp.createdDate = moment(obj.orderDate).format('YYYY-MM-DD hh:mm:ss');
        listforTable.push(temp);
      });
      setorderTableData([...listforTable]);
      settotalSize(orderData.totalSize);
    }
    else {
      setorderTableData([]);
      settotalSize(0);
    }
  }, [orderData]);

  useEffect(() => {
    
    if (celebUsersRoles.length > 0 && celebHeirarchy.length > 0) {
      let seniorRMSet = new Set();
      let juniorRMSet = new Set();
      let accountManagerSet = new Set();
      let mappedCelebTemp = [];
      celebHeirarchy.forEach(h => {
        if (h.parentSeniorRM !== null)
          seniorRMSet.add(h.parentSeniorRM);
        if (h.parentJuniorRM !== null)
          juniorRMSet.add(h.parentJuniorRM);
        if (h.parentAM !== null)
          accountManagerSet.add(h.parentAM);
        mappedCelebTemp.push({
          label: h.name_EN, value: h.celebrityCode,
          parentAM: h.parentAM, parentJuniorRM: h.parentJuniorRM, parentSeniorRM: h.parentSeniorRM
        })
      });
      setMappedCeleb(mappedCelebTemp);     
      let mappedSeniorRMTemp = [];
      [...seniorRMSet].forEach(s => {       
        let seniorObj = celebUsersRoles.find(c => c.magentoUserId === s);      
        if (seniorObj!=undefined)
          mappedSeniorRMTemp.push({ label: seniorObj.userName, value: seniorObj.magentoUserId });
      });
       mappedSeniorRMTemp.push({ label: 'Independent', value: null });
      setMappedSeniorRM(mappedSeniorRMTemp);
      setDdlSeniorRM(mappedSeniorRMTemp);
      let mappedJuniorRMTemp = [];
      [...juniorRMSet].forEach(j => {
        let juniorObj = celebUsersRoles.find(c => c.magentoUserId === j);
        let seniorRM = celebHeirarchy.find(h => h.parentJuniorRM == j);
        if (juniorObj!=undefined)
        mappedJuniorRMTemp.push({
          label: juniorObj.userName, value: juniorObj.magentoUserId,
          parentSeniorRM: (seniorRM != undefined) ? seniorRM.parentSeniorRM : null
        });

      });
      setMappedJuniorRM(mappedJuniorRMTemp);
      let mappedAMTemp = [];
      [...accountManagerSet].forEach(a => {
        let accountManagerObj = celebUsersRoles.find(c => c.magentoUserId === a);
        let juniorRM = celebHeirarchy.find(h => h.parentAM == a);
        if (accountManagerObj!=undefined)
        mappedAMTemp.push({
          label: accountManagerObj.userName, value: accountManagerObj.magentoUserId,
          parentJuniorRM: juniorRM.parentJuniorRM, parentSeniorRM: juniorRM.parentSeniorRM
        });
      });
      setmappedAM(mappedAMTemp);


    }

  }, [celebHeirarchy])


  useEffect(() => {
    
    if (userData.roles.includes(RoleNames.CelebSuperAdmin) ||
    userData.celebPriorityRole.roleId === RoleNames.CelebSeniorRM) {
      let ddlJuniorRMTemp = [];
      if (userData.roles.includes(RoleNames.CelebSuperAdmin) && celebUsersRoles.length > 0) {
        ddlJuniorRMTemp = [...mappedJuniorRM];
      }
      else if (userData.celebPriorityRole.roleId === RoleNames.CelebSeniorRM) {
        mappedJuniorRM.forEach(j => {
          let juniorRM = celebUsersRoles.find(c => c.magentoUserId === j.juniorMagentoUserId);
          ddlJuniorRMTemp.push({ label: juniorRM.userName, value: juniorRM.magentoUserId, parentSeniorRM: userData.magentoUserId });
        });
      }
      let cascadedJRM = [];
      if (selectedSeniorRM !== null) {
        cascadedJRM = ddlJuniorRMTemp.filter(c => Number(c.parentSeniorRM) === Number(selectedSeniorRM.value));
      }
      else {
        cascadedJRM = [...ddlJuniorRMTemp];
      }
      setSelectedJuniorRM(null);
      setselectedCoordinator(null);
      setselectedCelebrity(null);
      setddlJuniorRM(cascadedJRM);
    }
  }, [celebUsersRoles, mappedJuniorRM, selectedSeniorRM]);
  useEffect(() => {
    if (userData.celebPriorityRole.roleId != RoleNames.CelebAccountManager) {

      let ddlTempAMList = [];
      let cascadedDdlAM = [];
      if (userData.roles.includes(RoleNames.CelebSuperAdmin)) {
        ddlTempAMList = [...mappedAM];
      }
      else if (userData.celebPriorityRole.roleId === RoleNames.CelebSeniorRM ||
        userData.celebPriorityRole.roleId === RoleNames.CelebJuniorRM) {

        if (userData.celebPriorityRole.roleId === RoleNames.CelebSeniorRM) {
          ddlTempAMList = [...ddlAgent, ...mappedAM];
        }
        else if (userData.celebPriorityRole.roleId === RoleNames.CelebJuniorRM) {
          let agentArray = ddlAgent.map(d => ({ ...d, parentJuniorRM: userData.magentoUserId }));
          ddlTempAMList = agentArray;
        }
      }

      if (selectedJuniorRM != null) {
        cascadedDdlAM = ddlTempAMList.filter(d => Number(d.parentJuniorRM) === Number(selectedJuniorRM.value));

      }
      else {
        cascadedDdlAM = ddlTempAMList;
      }
      setddlAM(cascadedDdlAM);
      setselectedCoordinator(null);
      setselectedCelebrity(null);
    }

  }, [ddlAgent, mappedAM, selectedJuniorRM]);
  useEffect(() => {
    let ddlCeleb1Temp = [];
    if (userData.roles.includes(RoleNames.CelebSuperAdmin)) {
      ddlCeleb1Temp = [];//no direct celebs TODO
    }
    else
      if (userData.celebPriorityRole.roleId === RoleNames.CelebSeniorRM) {
        ddlCeleb1Temp = ddlCeleb1.map(c => ({ ...c, parentSeniorRM: userData.magentoUserId }));
      }
      else if (userData.celebPriorityRole.roleId === RoleNames.CelebJuniorRM) {
        ddlCeleb1Temp = ddlCeleb1.map(c => ({ ...c, parentJuniorRM: userData.magentoUserId }));
      }
      else if (userData.celebPriorityRole.roleId === RoleNames.CelebAccountManager) {
        ddlCeleb1Temp = ddlCeleb1.map(c => ({ ...c, parentAM: userData.magentoUserId }));
      }
    let ddlCelebTemp = [...mappedCeleb, ...ddlCeleb1Temp];

    let cascadedDdlCeleb = [];
    if (selectedCoordinator !== null) {
      cascadedDdlCeleb = ddlCelebTemp.filter(c => Number(c.parentAM) === Number(selectedCoordinator.value));
    }
    else if (selectedJuniorRM !== null) {
      cascadedDdlCeleb = ddlCelebTemp.filter(c => Number(c.parentJuniorRM) === Number(selectedJuniorRM.value));
    }
    else if (selectedSeniorRM !== null) {
      cascadedDdlCeleb = ddlCelebTemp.filter(c => Number(c.parentSeniorRM) === Number(selectedSeniorRM.value));
    }
    else {
      cascadedDdlCeleb = ddlCelebTemp;
    }
    let mapObj = new Map();
    cascadedDdlCeleb.forEach(c => {
      mapObj.set(c.value, c);
    });
    let nonDuplicateCelebs = [...mapObj.values()];
    setDdlCeleb(nonDuplicateCelebs);

    setselectedCelebrity(null);


  }, [ddlCeleb1, mappedCeleb, selectedSeniorRM, selectedJuniorRM, selectedCoordinator])
  const getAll = async () => {
    setisloading(true);

    let celebPriorityRole = userData.celebPriorityRole;
    let objCeleb = { userid: userData.magentoUserId }
    objCeleb.userid = userData.magentoUserId;
    if (ddlCeleb1.length === 0) {
      await dispatch(listMappedCelebrityAction(objCeleb));
    }
    if (ddlAgent.length === 0) {
      await dispatch(listMappedCoordinatorAction(objCeleb));
    }
    if (celebUsersRoles.length === 0) {
      await dispatch(getCelebUsersRolesList({}));
    }
    if (userData.roles.includes(RoleNames.CelebSuperAdmin)) {
      let output = await common.apiCall2('POST', "ApprovalMatrix/GetCelebHeirarchy", {});
      let celebHierarchyTemp = output.data.result;
      setCelebHeirarchy(celebHierarchyTemp);

    }
    else if (celebPriorityRole.roleId === RoleNames.CelebSeniorRM) {
      let reqObj = {
        flag: 'GetBySeniorRM',
        seniorMagentoUserId: userData.magentoUserId,
        juniorMagentoUserId: 0
      };
      let data = await RMMappingCRUD(reqObj);
      if (data.status) {
        let juniorRMList = data.result.length > 0 ? data.result : [];
        let juniors = juniorRMList.map(j => j.juniorMagentoUserId);
        let output = await common.apiCall2('POST', "CelebrityRegister/GetMappedJRMAccountMannager", juniors);
        let mappedAMTemp = output.data.result;
        let AMList = mappedAMTemp.map(a => Number(a.value));
        let output2 = await common.apiCall2('POST', "CelebrityRegister/GetMappedCelebritiesOfAMs", AMList);
        let celebList = output2.data.result;
        celebList.forEach(c => {
          let parentAMObj = mappedAMTemp.find(m => Number(m.value) === Number(c.parentAM));
          c.parentJuniorRM = parentAMObj.parentJuniorRM;
          c.parentSeniorRM = userData.magentoUserId;
        });
        setMappedCeleb(celebList);
        setmappedAM(mappedAMTemp);
        setMappedJuniorRM(juniorRMList);
      }
    }
    await dispatch(listOrderStatusAction(objCeleb));

    setisloading(false);
  }
   
  const getInitSetUp = ()=>{
    let isDdlEnabledTemp = { seniorRM: false, juniorRM: false, accountManager: false, celebrity: false };
    if (userData.roles.includes(RoleNames.CelebSuperAdmin)) {
      isDdlEnabledTemp = { ...isDdlEnabledTemp };
    }
    else if (userData.celebPriorityRole.roleId === RoleNames.CelebSeniorRM) {
      isDdlEnabledTemp = { ...isDdlEnabledTemp, seniorRM: true };
      let selectedSeniorRMTemp = { label: userData.userName, value: userData.magentoUserId };
      setSelectedSeniorRM(selectedSeniorRMTemp);
      setDdlSeniorRM([selectedSeniorRMTemp]);
    }
    else if (userData.celebPriorityRole.roleId === RoleNames.CelebJuniorRM) {
      isDdlEnabledTemp = { ...isDdlEnabledTemp, seniorRM: true, juniorRM: true }
      let selectedJuniorRMTemp = { label: userData.userName, value: userData.magentoUserId };
      setSelectedJuniorRM(selectedJuniorRMTemp);
      setddlJuniorRM([selectedJuniorRMTemp]);
    }
    else if (userData.celebPriorityRole.roleId === RoleNames.CelebAccountManager) {
      isDdlEnabledTemp = { seniorRM: true, juniorRM: true, accountManager: true, celebrity: false };
      let setselectedAM = { label: userData.userName, value: userData.magentoUserId };
      setselectedCoordinator(setselectedAM);
      setddlAM([setselectedAM]);

    }
    setIsDdlEnabled({ ...isDdlEnabledTemp });
  }

  const handleTableChange = async (type, { page, sizePerPage }) => {

    let allowedCelebList = [];
    if (selectedCelebrity !== null) {
      allowedCelebList = selectedCelebrity.value;
    }
    else {
      allowedCelebList = ddlCeleb.map(d => d.value).join(',');
    }
    let accountManagerList = [];
    if (selectedCoordinator !== null) {
      accountManagerList = selectedCoordinator.value;
    }
    else {
      accountManagerList = ddlAM.map(d => d.value).join(',');
    };

    objRequest.allowedCelebList = allowedCelebList;
    objRequest.accountManagerList = accountManagerList;
    if (type === PaginationTypes.Clear || type === PaginationTypes.Search) {
      page = 1
    }
    const currentIndex = (page - 1) * sizePerPage;
    setisloading(true);
    let pageSizeAllowed = PageSizeVals.includes(sizePerPage);
    let size = pageSizeAllowed ? sizePerPage : 10;
    objRequest.pageSize = size;
    objRequest.currentIndex = currentIndex;
    let response = await common.apiCall('POST',
    'OrderSearch/OrderSearchByPagination', 'DATA_ORDERSEARCH_SUCCESS', objRequest,'','') 
      let data = response.result; 
    if (response.statusCode == 200) {
        setOrderData(data);
    }
    setisloading(false);
    setpage(page);
    setsizePerPage(sizePerPage);
  }

  const handleReset = async () => {
    setobjRequest({});
    setSelectedSeniorRM(null);
    setSelectedJuniorRM(null);
    setselectedCoordinator(null);
    setselectedCelebrity(null);
    setselectedCountry(null);
    getInitSetUp();
    setOrderData([]);

  }
  const handleShow = async (e) => {
    const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
    let request = { orderId: obj.orderId }
    let output = await common.apiCall2('POST', `OrderSearch/GetOrderDetailByOrderId`, request)
    setlstViewData(output.data.result);
    setShowDetail(true);
  }
  const handleClose = (e) => {
    setShowDetail(false);
  }
  const ordColumns = [
    { dataField: 'orderIdLink', text: 'OrderId' },
    { dataField: 'webOrderNo', text: 'AppOrderNo' },
    { dataField: 'createdDate', text: 'Created Date' },
    { dataField: 'celebName', text: 'Celebrity' },
    { dataField: 'countryCode', text: 'Country' },
    { dataField: 'createdUser', text: 'Account Manager' },
    { dataField: 'notes', text: 'Notes' },
    { dataField: 'orderStatus', text: 'Status' }
  ];

  const handleSelectCountry = (val, act) => {
    setselectedCountry(val);
    if (act.action === 'select-option')
      setobjRequest({ ...objRequest, countryCode: val.value });
    else if (act.action === "clear") {
      let { countryCode, ...rest } = objRequest;
      setobjRequest({ ...rest });
    }
  }
  const toggle = () => setIsOpen(!isOpen);

  const handleExport = async () => {
    let accessToken = JSON.parse(common.getCookie('accessToken'));
    let response = await fetch(`${common.BASE_URL}OrderSearch/GetOrderSearchCSV`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.accessToken}`
      },
      body: JSON.stringify({ ...objRequest })
    });
    let blob = await response.blob();
    let blobUrl = window.URL.createObjectURL(blob);
    let tempLink = document.createElement('a');
    tempLink.href = blobUrl;
    tempLink.setAttribute('download', `${new Date().getTime()}.csv`);
    tempLink.click();
  }
  const handleOrderIdChange = async (e) => {
    let val = e.target.value;
    if (val) {
      setobjRequest({ ...objRequest, orderId: + e.target.value });
    }
    else {
      let { orderId, ...rest } = objRequest;
      setobjRequest({ ...rest });
    }
  }
  return (
    <Page>
      <div>
        <Modal show={ShowDetail} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Order Detail</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table className="customTable" id="vieworder">
              <thead>
                <tr>
                  <th scope="col">OrderId</th>
                  <th scope="col">ItemNo</th>
                  <th scope="col">Description</th>
                  <th scope="col">Qty</th>
                  <th scope="col">GBQty</th>
                  <th scope="col">Exclusive</th>
                  <th scope="col">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {
                  lstViewData && lstViewData.map((obj, index) => {

                    const { orderId, itemNo, itemDesc, qty, givenBeforeQty, exclusiveFor, remarks } = obj;

                    return (
                      <tr key={index}>
                        <td>{orderId}</td>
                        <td>{itemNo}</td>
                        <td>{itemDesc}</td>
                        <td>{qty}</td>
                        <td>{givenBeforeQty}</td>
                        <td>{exclusiveFor}</td>
                        <td>{remarks}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
      <Row >
        <Col>
          <Card className="mb-12">
            <CardHeader>
              <span style={{ cursor: 'pointer' }} onClick={toggle} >Order Search</span>
            </CardHeader>
            <CardBody>
              <Collapse isOpen={isOpen}>
                <div className="row" style={{ fontSize: "0.8rem" }}>
                  <div className="BoxLayout colShadow" >
                    <FormGroup className="InnerBoxLayout">
                      <Label for="Date1">From Date </Label>
                      <Input
                        type="date"
                        name="Date1"
                        placeholder="From date"
                        value={objRequest.orderDateFrom || ''}
                        onChange={e => setobjRequest({ ...objRequest, orderDateFrom: e.target.value })}
                        style={{ fontSize: "0.8rem" }}
                      />
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="exampleTime">To Date</Label>
                      <Input
                        type="date"
                        name="Date2"
                        id="Date2"
                        placeholder="To date"
                        value={objRequest.orderDateTo || ''}
                        onChange={e => setobjRequest({ ...objRequest, orderDateTo: e.target.value })}
                        style={{ fontSize: "0.8rem" }}
                      />
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="exampleTime">SKU</Label>
                      <Input
                        type="text"
                        name="ItemNo"
                        id="ItemNo"
                        placeholder="ItemNo"
                        value={objRequest.itemNo || ''}
                        onChange={e => setobjRequest({ ...objRequest, itemNo: e.target.value })}
                        style={{ fontSize: "0.8rem" }}
                      />
                    </FormGroup>
                  </div>
                  <div className="BoxLayout colShadow" >
                    <FormGroup className="InnerBoxLayout">
                      <Label for="exampleTime">Order No</Label>
                      <Input
                        type="number"
                        name="OrderNo"
                        id="OrderNo"
                        placeholder="Celebrity OrderNo"
                        value={objRequest.orderId || ''}
                        onChange={e => handleOrderIdChange(e)}
                        style={{ fontSize: "0.8rem" }}
                      />
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="exampleSelect">Order Notes</Label>
                      <select
                        className="form-control"
                        name="drpOrderNotes"
                        value={objRequest.notes || 'All'}
                        onChange={(e) =>
                          setobjRequest({ ...objRequest, notes: e.target.value }
                          )
                        }
                        style={{ fontSize: "0.8rem" }}>
                        <option value="All">-- Select --</option>
                        <option value="Auto"> Auto Confirm</option>
                        <option value="TeamLeader"> Approved By TeamLeader</option>
                        <option value="ExclusiveManager"> Approved By Exclusive Manager</option>
                      </select>
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="exampleSelect">Order Staus</Label>
                      <select
                        className="form-control"
                        name="drpOrderStatus"
                        value={objRequest.orderStatus || ''}
                        onChange={(e) =>
                          setobjRequest({ ...objRequest, orderStatus: e.target.value }
                          )
                        }
                        style={{ fontSize: "0.8rem" }}>
                        <option value="">-- Select --</option>
                        {ddlOrderStatus &&
                          ddlOrderStatus.map((data) => {
                            const { id, status } = data;
                            return (
                              <option key={id} value={status}>
                                {status}
                              </option>
                            );
                          })}
                      </select>
                    </FormGroup>
                  </div>
                  <div className="BoxLayout colShadow" >
                    <FormGroup className="InnerBoxLayout">
                      <Label for="Country">Country</Label>
                      <Select name="Country"
                        placeholder='Select Country'
                        value={selectedCountry}
                        onChange={handleSelectCountry}
                        isClearable={true} options={countryDrop} />
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="SeniorRM">Senior RM</Label>
                      <Select name="SeniorRM"
                        placeholder='Select Senior RM'
                        isDisabled={isDdlEnabled.seniorRM}
                        value={selectedSeniorRM}
                        onChange={(val, act) => setSelectedSeniorRM(val)}
                        isClearable={true} options={ddlSeniorRM} />
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="JuniorRM">Junior RM</Label>
                      <Select name="JuniorRM"
                        placeholder='Select Junior RM'
                        isDisabled={isDdlEnabled.juniorRM}
                        value={selectedJuniorRM}
                        onChange={(val, act) => setSelectedJuniorRM(val)}
                        isClearable={true} options={ddlJuniorRM} />
                    </FormGroup>
                  </div>
                  <div className="BoxLayout colShadow" >
                    <FormGroup className="InnerBoxLayout">
                      <Label for="coordinator">Coordinator</Label>
                      <Select name="coordinator"
                        placeholder='Select Coordinator'
                        isDisabled={isDdlEnabled.accountManager}
                        value={selectedCoordinator}
                        onChange={(val, act) => setselectedCoordinator(val)}
                        isClearable={true} options={ddlAM} />
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="selCeleb">Celebrity</Label>
                      <Select name="selCeleb"
                        placeholder='Select Celebrity'
                        isDisabled={isDdlEnabled.celebrity}
                        value={selectedCelebrity}
                        onChange={(val, act) => setselectedCelebrity(val)}
                        isClearable={true} options={ddlCeleb} />
                    </FormGroup>

                    <FormGroup className="InnerBoxLayout" style={{ marginTop: "40px" }}>
                      {isloading && <Spinner animation="border" variant="primary" />}
                      {!isloading && <Button className="btn btn-success" onClick={e => handleTableChange(PaginationTypes.Search, { page, sizePerPage })}
                        style={{ fontSize: "0.8rem", width: "40%", marginLeft: "5%" }}  >Search</Button>}
                      <Button className="btn btn-primary" onClick={handleReset} style={{ fontSize: "0.8rem", width: "40%", marginLeft: "5%", }}  >Reset</Button>
                    </FormGroup>
                  </div>

                </div>
              </Collapse>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="mb-3">
            <CardBody>
              <div style={{ textAlign: "right", fontSize: "10px" }}>
                <Button color="primary" onClick={e => handleExport()} >Export</Button>
              </div>
              {isloading && <Spinner animation="border" variant="primary" />}
              {!isloading && <BootstrapTable
                remote
                keyField="orderId"
                data={orderTableData}
                columns={ordColumns}
                classes="customTable"
                pagination={paginationFactory({ showTotal: true, page, sizePerPage, totalSize })}
                onTableChange={handleTableChange}
              />}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Page>
  );

};
export default OrderSearch;