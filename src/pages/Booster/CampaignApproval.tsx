import React, { useEffect, useState, useRef } from 'react';
import Page from 'components/Page';
import { Modal, Spinner } from 'react-bootstrap';
import {
    Card, CardBody, CardHeader, Col, Row, Collapse, Label, Button, FormGroup, Input, Form, Table
} from 'reactstrap';
import * as common from '../../network/index';
import Select from 'react-select';
import BootstrapTable from 'react-bootstrap-table-next';
import { toast } from 'react-toastify';
import moment from 'moment';
import { GetCampaignApprovalData, LoadFilterData,LoadFilterDataMatrix, EditCampaign,GetCampaignApprovalDataByMatrix,EditCampaignApprovalMatrix } from 'actions/boosterActions/CampaignActions';
import { allListCelebrityAction,GetCelebrityListCampaign } from 'actions/celebrityActions/CelebrityActions';
import {RoleNames} from 'utils/roleNames';
import { useSelector, useDispatch } from "react-redux";
import { FaCheck, FaEdit, FaBan } from "react-icons/fa";
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
function CampaignApproval(props) {

    const [objRequest, setobjRequest] = useState({});    
    const userData = JSON.parse(localStorage.getItem("userData"));
    const [isloading, setisloading] = useState(false);
    const [selectedCelebrity, setselectedCelebrity] = useState();
    const [selectedTitle, setselectedTitle] = useState();
    const [selectedType, setselectedType] = useState();
    const [selectedReason, setselectedReason] = useState();
    const [isOpen, setIsOpen] = useState(true);
    const dispatch = useDispatch();
    const [lstApprovalData, setlstApprovalData] = useState([]);
    const [lstOrderTableData, setlstOrderTableData] = useState([]);
    const [magentoUserId, setMagentoUserId] = useState(JSON.parse(localStorage.getItem('userData')).magentoUserId,);
    const PageSizeVals = [10, 25, 30, 50];
    const ddlAllCeleb = useSelector((state) => state.CelebrityReducer.allCelebs);
    const [ddlcelebrity, setddlcelebrity] = useState([]);
    const [ddlcampId, setddlcampId] = useState([]);
    const [ddlcampType, setddlcampType] = useState([]);
    const [ddlcampReason, setddlcampReason] = useState([])
    const [ListItemNo, setListItemNo] = useState([])
    const [ListCelebrity, setListCelebrity] = useState([])
    const [CampDetailsshow, setCampDetailsshow] = useState(false);
    const [isApprovalEnabled, setisApprovalEnabled] = useState(false);
    const [details, setdetails] = useState({});
    const rowStyle = { textAlign: 'center',background:'silver' };
    const ApprovalLevel=userData.roleId=="3"?1:userData.roleId=="2"?2:userData.roleId=="15"?3:5;
    useEffect(() => {
        LoadFilters();       
        let objLoad = ({ Flag: 'PAGELOAD',MagentoUserId:userData.magentoUserId,RoleId:userData.roleId }); 
        GetCelebrityByApprovalMatrix();       
        BindGrid(objLoad);
    }, []);
    const GetCelebrityByApprovalMatrix = async () => {
      
        let tempCeleb =  await dispatch(GetCelebrityListCampaign({ userid: userData.magentoUserId,RoleId:Number(userData.roleId )}));      
        let celebArray = tempCeleb.result.map(c=>{return {value:c.value,label:`${c.value}-${c.label}`}});
        setddlcelebrity(celebArray);
    }
    const LoadFilters = async () => {
        let objLoad = ({
            flag: 'CAMPAIGNAPPROVAL_PAGELOAD', userId: userData.magentoUserId.toString(),RoleId:Number(userData.roleId )
        });        
        //let LoadFilterDataResponse = await dispatch(LoadFilterData(objLoad));
        let LoadFilterDataResponse = await dispatch(LoadFilterDataMatrix(objLoad));
        let CampaignTitle=LoadFilterDataResponse.result.campTitle==undefined?'':JSON.parse(LoadFilterDataResponse.result.campTitle);
        setddlcampId([...CampaignTitle]);
        let CampaignType=LoadFilterDataResponse.result.campType==undefined?'':JSON.parse(LoadFilterDataResponse.result.campType);
        setddlcampType([...CampaignType]);
        let CampaignReason=LoadFilterDataResponse.result.reason==undefined?'':JSON.parse(LoadFilterDataResponse.result.reason);
        setddlcampReason([...CampaignReason]);       
        if (ddlAllCeleb.length === 0) {
            let objCeleb = { userid: -1 }
            await dispatch(allListCelebrityAction(objCeleb));
        }
    }
    const handleSelectCelebChange = (val, act) => {
        setselectedCelebrity(val);
        if (act.action === 'select-option')
            setobjRequest({ ...objRequest, celebrityCode: val.value.toString() });
        else if (act.action === "clear") {
            let { celebrityCode, ...rest } = objRequest;
            setobjRequest({ ...rest });
        }
    }
    const handleTitleChange = (val, act) => {        
        setselectedTitle(val);
        if (act.action === 'select-option')
            setobjRequest({ ...objRequest, CmpTitle: val.label });
        else if (act.action === "clear") {
            let { CmpTitle, ...rest } = objRequest;
            setobjRequest({ ...rest });
        }
    }
    const handleTypeChange = (val, act) => {        
        setselectedType(val);
        if (act.action === 'select-option')
            setobjRequest({ ...objRequest, CmpType: val.label });
        else if (act.action === "clear") {
            let { CmpType, ...rest } = objRequest;
            setobjRequest({ ...rest });
        }
    }
    const handleReasonChange = (val, act) => {        
        setselectedReason(val);
        if (act.action === 'select-option')
            setobjRequest({ ...objRequest, Reason: val.label });
        else if (act.action === "clear") {
            let { CmpType, ...rest } = objRequest;
            setobjRequest({ ...rest });
        }
    }
    const handleConfirm = async (e) => {
        if (window.confirm('Are you sure to Confirm.. ?')) {
            const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
            let objConfirm = ({ Flag: 'APPROVE', CampainId: obj.campaignId, UpdatedBy: magentoUserId.toString(),ApprovalLevel: ApprovalLevel });
            let CampaignConfirmResponse = await dispatch(EditCampaignApprovalMatrix(objConfirm));
            if (CampaignConfirmResponse.statusCode === "500") {
                toast.error(CampaignConfirmResponse.message);
                handleReset();
            }
            else {
                toast.success(CampaignConfirmResponse.message);
                handleReset();
            }
        }

    }
    const handleCancel = async (e) => {
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        console.log("Reject",obj);
        if (window.confirm(`Are you sure to cancel Campaing#${obj.campaignId}.. ?`)) {
            console.log("Reject Consent");
            let objCancel = ({ Flag: 'REJECT', CampainId: obj.campaignId, UpdatedBy: magentoUserId.toString(),ApprovalLevel: ApprovalLevel});
            let CampaignCancelResponse = await dispatch(EditCampaignApprovalMatrix(objCancel));
            if (CampaignCancelResponse.statusCode === "500") {
                toast.error(CampaignCancelResponse.message);
                handleReset();
            }
            else {
                toast.success(CampaignCancelResponse.message);
                handleReset();
            }
        }
    }
    const handleSearch = async () => {
        let objSearch = ({
            Flag: 'SEARCH',MagentoUserId:userData.magentoUserId,RoleId:userData.roleId, ItemNo: objRequest.itemNo ? objRequest.itemNo : '', CelebrityId: objRequest.celebrityCode ? objRequest.celebrityCode : '',
            CampaignType: objRequest.CmpType ? objRequest.CmpType : '', CampaignTitle: objRequest.CmpTitle ? objRequest.CmpTitle : '',
            StartDate: objRequest.orderDateFrom ? objRequest.orderDateFrom : '', Reason: objRequest.Reason ? objRequest.Reason : '',
        });
        BindGrid(objSearch);
    }
    const handleReset = async () => {
        setobjRequest({});
        setselectedCelebrity(null);
        setselectedCelebrity(null);
        setselectedTitle(null);
        setselectedType(null);
        setselectedReason(null);
        setlstApprovalData([]);
        let objLoad = ({ Flag: 'PAGELOAD',MagentoUserId:userData.magentoUserId,RoleId:userData.roleId });
        BindGrid(objLoad);
    }
    const columns = [{ dataField: 'campId', text: '#' },

    { dataField: 'id', text: 'id', hidden: true },
    { dataField: 'title', text: 'Details'},
    { dataField: 'fromDate', text: 'From Date'},
    { dataField: 'toDate', text: 'To Date' },
    { dataField: 'commision', text: 'Extra Commission %' },
    { dataField: 'createdOn', text: 'Created Date' },
    { dataField: 'campaignType', text: 'Type'},
    { dataField: 'approvalReason', text: 'Reason' },
    { dataField: 'action', text: 'Action' }
    ];
    const BindGrid = async (obj) => {
        //let isApprovalEnabledTemp =userData.roles.includes(RoleNames.BoosterManagement);
        let isApprovalEnabledTemp =userData.roleId==3?true:userData.roleId==15?true:userData.roleId==2?true:false;
        setisApprovalEnabled(isApprovalEnabledTemp);
        let listforTable_Approval = [];
        let Camp_List_Approval = [];
        let CampaignApprovalResponse = await dispatch(GetCampaignApprovalDataByMatrix(obj));
        Camp_List_Approval = (CampaignApprovalResponse ? CampaignApprovalResponse.result : {});
        Camp_List_Approval.forEach(obj => {
            let temp = {
                ...obj,
                campId: <a className="btn btn-outline-dark  btn-sm" style={{ 'cursor': 'pointer' }} data-item={JSON.stringify(obj)} onClick={handleDetails} >{obj.campaignId}</a>,
                fromDate: moment(obj.fromDate).format('YYYY-MM-DD'),
                toDate: moment(obj.toDate).format('YYYY-MM-DD'),
                createdOn: moment(obj.createdOn).format('YYYY-MM-DD hh:mm:ss'),
                action:(isApprovalEnabledTemp ===true)? <>
                    <a style={{ cursor: 'pointer', color: 'green' }} className=" m-1" data-item={JSON.stringify(obj)} onClick={handleConfirm}   ><FaCheck /></a>
                    <a style={{ cursor: 'pointer', color: 'red' }} className=" m-1" data-item={JSON.stringify(obj)} onClick={handleCancel} ><FaBan /></a>
                </>:''
            }
            listforTable_Approval.push(temp);
        });
        setlstOrderTableData([...listforTable_Approval]);
    }
    const handleDetails = async (e) => {
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        setdetails(obj);
        let objDetails = ({ Flag: 'DETAILS', CampaignId: obj.campaignId });
        let CampaignDetailsResponse = await dispatch(GetCampaignApprovalDataByMatrix(objDetails));
        setListItemNo([...CampaignDetailsResponse.result[0].campItems == undefined ? '' : JSON.parse(CampaignDetailsResponse.result[0].campItems)]);
        setListCelebrity([...CampaignDetailsResponse.result[0].campCelebrities == undefined ? '' : JSON.parse(CampaignDetailsResponse.result[0].campCelebrities)]);
        handleShow();

    }
    const handleClose = () => {
        setCampDetailsshow(false);
    }
    const handleShow = () => {
        setCampDetailsshow(true);
    }
    const toggle = () => setIsOpen(!isOpen);

    const rowStyle2 = (row, rowIndex) => {
        const style = {};
        let frm = moment(row.fromDate);
        let now = moment(new Date()); 
        let duration = moment.duration(frm.diff(now));
        let days = duration.asDays();
        if (days>0 && days<=3) {
            style.background = 'silver';
        }
        return style;
    };
    return (
        <Page>
            <div>
            <Modal size="lg" centered show={CampDetailsshow} onHide={handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>CampId#{details.campaignId}  {details.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Row>                        
                          <Col sm="7">
                          <div id="scr" style={{ 'overflow': 'scroll', 'height': '300px' }}>
                            <Table className="customTable" >
                                <thead>
                                    <tr>
                                        <th scope="col">SKU</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        ListItemNo && ListItemNo.map((obj) => {
                                            const { SrNo, CampItems,CampItemDesc } = obj;
                                            return (
                                                <tr key={SrNo} >
                                                    <td>{CampItems}/{CampItemDesc}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                         </Col>
                         <Col sm="5">
                          <div id="scr" style={{ 'overflow': 'scroll', 'height': '300px' }}>
                            <Table className="customTable" >
                                <thead>
                                    <tr>
                                        <th scope="col">Celebrities</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        ListCelebrity && ListCelebrity.map((obj) => {
                                            const { SrNo, CampCelebrityId, CampCelebrityName } = obj;
                                            return (
                                                <tr key={SrNo} >
                                                    <td>{CampCelebrityId} - {CampCelebrityName}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                          </Col>
                      </Row>
                       
                    </Modal.Body>
                </Modal>

            </div>
            <Row >
                <Col>
                    <Card className="mb-12">
                        <CardHeader>
                            <span style={{ cursor: 'pointer' }} onClick={toggle} > Campaign Approval</span>
                        </CardHeader>
                        <CardBody>
                            <Collapse isOpen={isOpen}>
                                <div className="row" style={{ fontSize: "0.8rem" }}>
                                    <div className="BoxLayout colShadow" >
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="exampleTime">SKU</Label>
                                            <Input
                                                type="text"
                                                name="ItemNo"
                                                id="ItemNo"
                                                placeholder="ItemNo"
                                                autoComplete="off"
                                                value={objRequest.itemNo || ''}
                                                onChange={e => setobjRequest({ ...objRequest, itemNo: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="selCeleb">Celebrity</Label>
                                            <Select name="selCeleb" placeholder='Select Celebrity'
                                                value={selectedCelebrity}
                                                onChange={handleSelectCelebChange}
                                                isClearable={true} options={ddlcelebrity} />
                                        </FormGroup>
                                       


                                    </div>
                                    <div className="BoxLayout colShadow" >
                                    <FormGroup className="InnerBoxLayout">
                                            <Label for="selCeleb">Campaign Type</Label>
                                           
                                            <Select options={ddlcampType} placeholder='Select Type' isClearable={true} onChange={handleTypeChange} value={selectedType}  />  
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="selCampTitle">Campaign Title</Label>                                            
                                            <Select options={ddlcampId} placeholder='Select Title' isClearable={true} onChange={handleTitleChange} value={selectedTitle}  />
                                        </FormGroup>
                                       

                                    </div>
                                    <div className="BoxLayout colShadow" >
                                    <FormGroup className="InnerBoxLayout">
                                            <Label for="selCampReason">Reason For Approval</Label>
                                            <Select options={ddlcampReason} placeholder='Select Type' isClearable={true} onChange={handleReasonChange} value={selectedReason}  />  
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="Date1">Start Date </Label>
                                            <Input
                                                type="date"
                                                name="Date1"
                                                placeholder="From date"
                                                value={objRequest.orderDateFrom || ''}
                                                onChange={e => setobjRequest({ ...objRequest, orderDateFrom: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup> 

                                    </div>
                                    <div className="BoxLayout colShadow" >
                                        <FormGroup className="InnerBoxLayout m-3" >
                                            {isloading && <Spinner animation="border" variant="primary" />}
                                            {!isloading && <Button className="btn btn-success" onClick={handleSearch}
                                                style={{ fontSize: "0.8rem", width: "90%", marginLeft: "5%", marginTop: "5%" }}  >Search</Button>}
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout m-3" >
                                            <Button className="btn btn-primary" onClick={handleReset} style={{ fontSize: "0.8rem", width: "90%", marginLeft: "5%", marginTop: "5%" }}  >Reset</Button>

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
                            </div>
                            <BootstrapTable id="cmpApproval" bootstrap4 keyField='campaignId' classes="customTable" hover condensed rowStyle={rowStyle2} pagination={paginationFactory()}
                                data={lstOrderTableData} columns={columns} />    
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Page>
    )
}
export default CampaignApproval;