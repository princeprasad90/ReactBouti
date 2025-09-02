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
import { GetCampaignApprovalData, LoadFilterData, EditCampaign, Campaign_Listing } from 'actions/boosterActions/CampaignActions';
import { useSelector, useDispatch } from "react-redux";
import { allListCelebrityAction } from 'actions/celebrityActions/CelebrityActions';
import { FaCheck, FaEdit, FaBan } from "react-icons/fa";
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
function CampaignListing(props) {

    const [objRequest, setobjRequest] = useState({});
    const [objCeleb, setobjCeleb] = useState({})
    const userData = JSON.parse(localStorage.getItem("userData"));
    const [isloading, setisloading] = useState(false);
    const [selectedCelebrity, setselectedCelebrity] = useState();
    const [selectedTitle, setselectedTitle] = useState();
    const [selectedType, setselectedType] = useState();
    const [isOpen, setIsOpen] = useState(true);
    const dispatch = useDispatch();
    const [magentoUserId, setMagentoUserId] = useState(JSON.parse(localStorage.getItem('userData')).magentoUserId,);
    const PageSizeVals = [10, 25, 30, 50];
    const [ddlcampId, setddlcampId] = useState([]);
    const [ddlcampType, setddlcampType] = useState([]);
    const ddlAllCeleb = useSelector((state) => state.CelebrityReducer.allCelebs);
    const [ddlcelebrity, setddlcelebrity] = useState([]);
    const [ListItemNo, setListItemNo] = useState([])
    const [ListCelebrity, setListCelebrity] = useState([])
    const [CampEditshow, setCampEditshow] = useState(false);
    const [CampUpcomingEditshow, setCampUpcomingEditshow] = useState(false);
    const [CampDetailsshow, setCampDetailsshow] = useState(false);
    const [ListCampOngoing, setListCampOngoing] = useState([])
    const [ListCampUpcoming, setListCampUpcoming] = useState([]);
    const [selectedObj, setselectedObj] = useState({});
    const rowStyle = { textAlign: 'center' };
    useEffect(() => {
        LoadFilters();
        let objLoad = ({ Flag: 'PAGELOAD', });
        BindGrid(objLoad);
    }, []);
    useEffect(() => {
        let tempCeleb = [...ddlAllCeleb];
        let celebArray = tempCeleb.map(c=>{return {value:c.value,label:`${c.value}-${c.label}`}});
        setddlcelebrity(celebArray);
    }, [ddlAllCeleb]);
    const LoadFilters = async () => {
        let objLoad = ({
            flag: 'CAMPAIGNLISTING_PAGELOAD', userId: userData.magentoUserId.toString()
        });      
        let LoadFilterDataResponse = await dispatch(LoadFilterData(objLoad));
          console.log("LoadFilterDataResponse",LoadFilterDataResponse);
        let campaignTitleRes = LoadFilterDataResponse.result.campTitle;
        if (campaignTitleRes)
        {
            setddlcampId([...JSON.parse(campaignTitleRes)]);
        }
        
        let campTypeRes = LoadFilterDataResponse.result.campType;
        if (campTypeRes)
        {
            setddlcampId([...JSON.parse(campTypeRes)]);
        }
         setddlcampType([...JSON.parse(LoadFilterDataResponse.result.campType)]);
        
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
    const handleSearch = async () => {

        let objSearch = ({
            Flag: 'SEARCH_CAMPAIGNLISTING', ItemNo: objRequest.itemNo ? objRequest.itemNo : '', CelebrityId: objRequest.celebrityCode ? objRequest.celebrityCode : '',
            CampaignType: objRequest.CmpType ? objRequest.CmpType : '', CampaignTitle: objRequest.CmpTitle ? objRequest.CmpTitle : '',
            StartDate: objRequest.orderDateFrom ? objRequest.orderDateFrom : '', Reason: objRequest.Reason ? objRequest.Reason : '',
        });
        BindGrid(objSearch);
    }

    const handleReset = async () => {
        setobjRequest({});
        setselectedCelebrity(null);
        setselectedTitle(null);
        setselectedType(null);
        let objLoad = ({ Flag: 'PAGELOAD', });
        BindGrid(objLoad);
    }

    const Columns = [{ dataField: 'CampaignId', text: 'Id' },
    { dataField: 'Title', text: 'Details' },
    { dataField: 'CampaignType', text: 'Type' },
    { dataField: 'FromDate', text: 'From Date' },
    { dataField: 'ToDate', text: 'To Date'},
    { dataField: 'Commision', text: 'Extra Commission %' },
    { dataField: 'CreatedOn', text: 'Created Date' },
    { dataField: 'ApprovalReason', text: 'Reason' },
    { dataField: 'action', text: 'Action' },
    ];
    const BindGrid = async (objLoad) => {
        let Camp_List_Ongoing = []; let listforTable_Ongoing = [];
        let Camp_List_Upcoming = []; let listforTable_Upcoming = [];
        let CampaignListResponse = await dispatch(Campaign_Listing(objLoad));
        Camp_List_Ongoing = CampaignListResponse.result.campOngoing == undefined ? [] : JSON.parse(CampaignListResponse.result.campOngoing);
        Camp_List_Upcoming = CampaignListResponse.result.campUpcoming == undefined ? [] : JSON.parse(CampaignListResponse.result.campUpcoming);
        Camp_List_Ongoing.forEach(obj => {
            let temp = { ...obj };
            temp.Title = <a href="#" className="text-decoration-none" data-item={JSON.stringify(obj)} onClick={handleDetails} >{obj.Title}</a>;
            temp.FromDate = moment(obj.FromDate).format('YYYY-MM-DD');
            temp.ToDate = moment(obj.ToDate).format('YYYY-MM-DD');
            temp.CreatedOn = moment(obj.orderDate).format('YYYY-MM-DD hh:mm:ss');
            temp.action = <>
                <a style={{ cursor: 'pointer', color: 'blue' }} className=" m-1 " data-item={JSON.stringify(obj)} onClick={handleEdit_CampOngoing} ><FaEdit /></a>
            </>;
            listforTable_Ongoing.push(temp);
        });
        setListCampOngoing([...listforTable_Ongoing]);
        Camp_List_Upcoming.forEach(obj => {
            let temp = { ...obj };
            temp.Title = <a href="#" className="text-decoration-none" data-item={JSON.stringify(obj)} onClick={handleDetails} >{obj.Title}</a>;
            temp.FromDate = moment(obj.FromDate).format('YYYY-MM-DD');
            temp.ToDate = moment(obj.ToDate).format('YYYY-MM-DD');
            temp.CreatedOn = moment(obj.orderDate).format('YYYY-MM-DD hh:mm:ss');
            temp.action = <>
                <a style={{ cursor: 'pointer', color: 'blue' }} className=" m-1 " data-item={JSON.stringify(obj)} onClick={handleEdit_CampUpcoming} ><FaEdit /></a>
            </>;
            listforTable_Upcoming.push(temp);
        });
        setListCampUpcoming([...listforTable_Upcoming]);
    }

    const handleDetails = async (e) => {
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        let objDetails = ({ Flag: 'DETAILS', CampaignId: obj.CampaignId.toString() });
        setselectedObj(obj);
        let CampaignDetailsResponse = await dispatch(GetCampaignApprovalData(objDetails));
        console.log("CampaignDetailsResponse",CampaignDetailsResponse);
        setListItemNo([...(CampaignDetailsResponse.result[0].campItems == undefined ? '' : JSON.parse(CampaignDetailsResponse.result[0].campItems))]);
        setListCelebrity([...CampaignDetailsResponse.result[0].campCelebrities == undefined ? '' : JSON.parse(CampaignDetailsResponse.result[0].campCelebrities)]);
        handleShow();
    }
    const handleEdit_CampOngoing = async (e) => {
        handleShow_Campongoing();
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        objRequest.CampaignId = obj.CampaignId;
        objRequest.DateFrom = obj.FromDate;
        objRequest.DateTo = obj.ToDate;
    }

    const handleCloseDetails = () => {
        setCampDetailsshow(false);
    }
    const handleShow = () => {
        setCampDetailsshow(true);
    }
    const handleShow_Campongoing = () => {
        setCampEditshow(true);

    }
    const handleCloseCampOngoing = () => {
        setCampEditshow(false);
    }
    const handleCampOngoingUpdate = async () => {
        var fromDate = moment(objRequest.DateFrom);
        var toDate = moment(objRequest.DateTo);
        if (fromDate.isAfter(toDate)) {
            toast.warn("From Date Should be Greater than ToDate !");
        }
        else {
            let objUpdate = ({
                Flag: 'UPDATE', CampainId: objRequest.CampaignId.toString(), Date1: objRequest.DateFrom,
                Date2: objRequest.DateTo, UpdatedBy: magentoUserId.toString()
            });
            let CampaignUpdateResponse = await dispatch(EditCampaign(objUpdate));
            if (CampaignUpdateResponse.statusCode === "500") {
                toast.error(CampaignUpdateResponse.message);
            }
            else {
                toast.success(CampaignUpdateResponse.message);
                setCampEditshow(false);
                handleReset();
            }
        }
    }
    const handleEdit_CampUpcoming = async (e) => {
        handleShow_CampUpcoming();
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        objRequest.CampaignId = obj.CampaignId;
        objRequest.DateFrom = obj.FromDate;
        objRequest.DateTo = obj.ToDate;
    }
    const handleShow_CampUpcoming = () => {
        setCampUpcomingEditshow(true);
    }
    const handleCloseCampUpcoming = () => {
        setCampUpcomingEditshow(false);
    }
    const handleCampUpcomingUpdate = async () => {
        var fromDate = moment(objRequest.DateFrom);
        var toDate = moment(objRequest.DateTo);
        if (fromDate.isAfter(toDate)) {
            toast.warn("From Date Should be Greater than ToDate !");
        }
        else {

            let objUpdate = ({
                Flag: 'UPDATE', CampainId: objRequest.CampaignId.toString(), Date1: objRequest.DateFrom,
                Date2: objRequest.DateTo, UpdatedBy: magentoUserId.toString()
            });
            let CampaignUpdateResponse = await dispatch(EditCampaign(objUpdate));
            if (CampaignUpdateResponse.statusCode === "500") {
                toast.error(CampaignUpdateResponse.message);
            }
            else {
                toast.success(CampaignUpdateResponse.message);
                setCampUpcomingEditshow(false);
                handleReset();
            }
        }
    }
    const toggle = () => setIsOpen(!isOpen);
    return (
        <Page>
            <div>
                <Modal show={CampDetailsshow} onHide={handleCloseDetails}>
                    <Modal.Header closeButton>
                    CampId#{selectedObj.CampaignId} - {selectedObj.Title}
                    </Modal.Header>
                    <Modal.Body>
                    <Row>                        
                          <Col>
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
                                            const { SrNo, CampItems } = obj;
                                            return (
                                                <tr key={SrNo} >
                                                    <td>{CampItems}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                         </Col>
                         <Col>
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
                                            const { SrNo,  CampCelebrityId, CampCelebrityName } = obj;
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
            <div>
                <Modal show={CampEditshow} onHide={handleCloseCampOngoing}>
                    <Modal.Header closeButton>
                        CAMPAIGN EDIT
                    </Modal.Header>
                    <Modal.Body>
                        <CardBody>
                            <Collapse isOpen={isOpen}>
                                <div className="row" style={{ fontSize: "0.8rem" }}>
                                    <div className="BoxLayoutCampaignEdit colShadow" >
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="Date1">FROM </Label>
                                            <Input
                                                type="date"
                                                name="Date1"
                                                placeholder="From date"
                                                min={moment().format("YYYY-MM-DD")}
                                                value={objRequest.DateFrom || ''}
                                                onChange={e => setobjRequest({ ...objRequest, DateFrom: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="Date1">TO </Label>
                                            <Input
                                                type="date"
                                                name="Date1"
                                                placeholder="From date"
                                                min={moment().format("YYYY-MM-DD")}
                                                value={objRequest.DateTo || ''}
                                                onChange={e => setobjRequest({ ...objRequest, DateTo: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                    </div>
                                </div>
                            </Collapse>
                        </CardBody>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleCampOngoingUpdate}>update</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            <div>
                <Modal show={CampUpcomingEditshow} onHide={handleCloseCampUpcoming}>
                    <Modal.Header closeButton>
                        CAMPAIGN EDIT
                    </Modal.Header>
                    <Modal.Body>
                        <CardBody>
                            <Collapse isOpen={isOpen}>
                                <div className="row" style={{ fontSize: "0.8rem" }}>
                                    <div className="BoxLayoutCampaignEdit colShadow" >
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="Date1">FROM </Label>
                                            <Input
                                                type="date"
                                                name="Date1"
                                                placeholder="From date"
                                                min={moment().format("YYYY-MM-DD")}
                                                value={objRequest.DateFrom || ''}
                                                onChange={e => setobjRequest({ ...objRequest, DateFrom: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="Date1">TO </Label>
                                            <Input
                                                type="date"
                                                name="Date1"
                                                placeholder="From date"
                                                min={moment().format("YYYY-MM-DD")}
                                                value={objRequest.DateTo || ''}
                                                onChange={e => setobjRequest({ ...objRequest, DateTo: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                    </div>
                                </div>
                            </Collapse>
                        </CardBody>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleCampUpcomingUpdate}>update</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            <Row >
                <Col>
                    <Card className="mb-12">
                        <CardHeader>
                            <span style={{ cursor: 'pointer' }} onClick={toggle} > Campaign Listing</span>
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
                                            <Label for="selCampTitle">Campaign Title</Label>
                                            <Select options={ddlcampId} placeholder='Select Title' isClearable={true} onChange={handleTitleChange} value={selectedTitle}  />
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="selCeleb">Campaign Type</Label>
                                            <Select options={ddlcampType} placeholder='Select Type' isClearable={true} onChange={handleTypeChange} value={selectedType}  />  
                                        </FormGroup>

                                    </div>
                                    <div className="BoxLayout colShadow" >

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

                                        <FormGroup className="InnerBoxLayout">
                                            <Button className="btn btn-success" onClick={handleSearch} style={{ fontSize: "0.8rem", width: "45%", marginLeft: "5%", marginTop: "10%" }}  >Search</Button>
                                            <Button className="btn btn-primary" style={{ fontSize: "0.8rem", width: "45%", marginLeft: "5%", marginTop: "10%" }} onClick={handleReset} >
                                                Reset </Button>
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
                        <CardHeader>
                            <span style={{ cursor: 'pointer' }} onClick={toggle} > Ongoing Campaigns</span>
                        </CardHeader>
                        <CardBody>
                            <div style={{ textAlign: "right", fontSize: "10px" }}>
                            </div>
                            <BootstrapTable id="cmpOngoing" bootstrap4 keyField='CampaignId' classes="customTable" striped hover condensed rowStyle={rowStyle} pagination={paginationFactory()}
                                data={ListCampOngoing} columns={Columns} />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card className="mb-3">
                        <CardHeader>
                            <span style={{ cursor: 'pointer' }} onClick={toggle} > Upcoming Campaigns</span>
                        </CardHeader>
                        <CardBody>
                            <div style={{ textAlign: "right", fontSize: "10px" }}>
                            </div>
                            <BootstrapTable id="cmpUpcoming" bootstrap4 keyField='CampaignId' classes="customTable" striped hover condensed rowStyle={rowStyle} pagination={paginationFactory()}
                                data={ListCampUpcoming} columns={Columns} />
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Page>
    )
}
export default CampaignListing;