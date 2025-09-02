import React, { useEffect, useState, useRef } from 'react';
import Page from 'components/Page';
import { Modal, Spinner } from 'react-bootstrap';
import {
    Card, CardBody, CardHeader, Col, Row, Collapse, Label, Button, FormGroup, Input, Form, Table
} from 'reactstrap';
import Select from 'react-select';
import BootstrapTable from 'react-bootstrap-table-next';
import moment from 'moment';
import { GetCampaignApprovalData, LoadFilterData, EditCampaign, Campaign_Listing } from 'actions/boosterActions/CampaignActions';
import { useSelector, useDispatch } from "react-redux";
import { allListCelebrityAction } from 'actions/celebrityActions/CelebrityActions';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
function CampaignHistory(props) {

    const [objRequest, setobjRequest] = useState({});    
    const userData = JSON.parse(localStorage.getItem("userData"));
    const [isloading, setisloading] = useState(false);
    const [selectedCelebrity, setselectedCelebrity] = useState();
    const [selectedTitle, setselectedTitle] = useState();
    const [selectedType, setselectedType] = useState();
    const [isOpen, setIsOpen] = useState(true);
    const dispatch = useDispatch();   
    const [ddlcampId, setddlcampId] = useState([]);
    const [ddlcampType, setddlcampType] = useState([]);
    const ddlAllCeleb = useSelector((state) => state.CelebrityReducer.allCelebs);
    const [ddlcelebrity, setddlcelebrity] = useState([]);
    const [ListItemNo, setListItemNo] = useState([])
    const [ListCelebrity, setListCelebrity] = useState([])
    const [CampDetailsshow, setCampDetailsshow] = useState(false);
    const [ListCampHistory, setListCampHistory] = useState([])
    const rowStyle = { textAlign: 'center' };
    const { SearchBar } = Search;  
    const [totalSize, settotalSize] = useState(0);
    const [page, setpage] = useState(1);
    const [sizePerPage, setsizePerPage] = useState(10);
    const [selectedObj, setselectedObj] = useState({});
    useEffect(() => {
        LoadFilters();
        let objLoad = ({ Flag: 'HISTORY',PageIndex:'0',PageSize:'10' });
        BindGrid(objLoad);       
    }, []);
    useEffect(() => {
        let tempCeleb = [...ddlAllCeleb];
        let celebArray = tempCeleb.map(c=>{return {value:c.value,label:`${c.value}-${c.label}`}});
        setddlcelebrity(celebArray);
    }, [ddlAllCeleb]);
    const LoadFilters = async () => {
        let objLoad = ({
            flag: 'CAMPAIGNHISTORY_PAGELOAD', userId: userData.magentoUserId.toString()
        });        
        let LoadFilterDataResponse = await dispatch(LoadFilterData(objLoad));
        setddlcampId([...JSON.parse(LoadFilterDataResponse.result.campTitle)]);
        setddlcampType([...JSON.parse(LoadFilterDataResponse.result.campType)]);  
        if (ddlAllCeleb.length === 0) {
            let objCeleb = { userid: -1 }
            await dispatch(allListCelebrityAction(objCeleb));
          }
       // setddlcelebrity([...JSON.parse(LoadFilterDataResponse.result.campCelebrity)]);   
    }

    const handleSelectCelebChange = (val, act) => {
        setselectedCelebrity(val);
        if (act.action === 'select-option')
        {
            setobjRequest({ ...objRequest, celebrityCode: val.value.toString() });
            console.log("idhh",+val.value);
        }           
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
            Flag: '', ItemNo: objRequest.itemNo ? objRequest.itemNo : '', CelebrityId: objRequest.celebrityCode ? objRequest.celebrityCode : '',
            CampaignType: objRequest.CmpType ? objRequest.CmpType : '', CampaignTitle: objRequest.CmpTitle ? objRequest.CmpTitle : '',
            CampaignId: '', StartDate: objRequest.orderDateFrom ? objRequest.orderDateFrom : '', Reason: objRequest.Reason ? objRequest.Reason : '',
            PageIndex:'0',PageSize:'10' 
        });
        BindGrid(objSearch);
    }

    const handleReset = async () => {
        setobjRequest({});
        setselectedCelebrity(null);
        setselectedTitle(null);
        setselectedType(null);
        let objLoad = ({ Flag: 'HISTORY',PageIndex:'0',PageSize:'10' });
        BindGrid(objLoad);
    }
    const ordColumns = [{ dataField: 'CampaignId', text: 'Id', sort: true, headerAlign: 'center' },
    { dataField: 'Title', text: 'Details', headerAlign: 'center' },
    { dataField: 'CampaignType', text: 'Type', sort: true, headerAlign: 'center' },
    { dataField: 'FromDate', text: 'From Date', sort: true, headerAlign: 'center' },
    { dataField: 'ToDate', text: 'To Date', sort: true, headerAlign: 'center' },
    { dataField: 'Commision', text: 'Commission %', headerAlign: 'center' },
    { dataField: 'CreatedOn', text: 'Created Date', sort: true, headerAlign: 'center' },
    { dataField: 'ApprovalReason', text: 'Reason', headerAlign: 'center' }
    ];
    const defaultSorted = [{
        dataField: 'FromDate',
        order: 'desc'
      }];
    const BindGrid = async (obj) => {
        let listforTable_History = [];
        let Camp_List_History = [];setListCampHistory([]);       
        setpage(parseInt(obj.PageIndex));setsizePerPage(parseInt(obj.PageSize));
        let CampaignHistoryResponse = await dispatch(Campaign_Listing(obj));        
        Camp_List_History = CampaignHistoryResponse.result.campHistory == undefined ? [] : JSON.parse(CampaignHistoryResponse.result.campHistory);
        settotalSize(parseInt(CampaignHistoryResponse.result.srNo));   
        Camp_List_History.forEach(obj => {
            let temp = { ...obj };
            temp.Title = <a href="#" className="text-decoration-none" data-item={JSON.stringify(obj)} onClick={handleDetails} >{obj.Title}</a>;
            temp.FromDate = moment(obj.FromDate).format('YYYY-MM-DD');
            temp.ToDate = moment(obj.ToDate).format('YYYY-MM-DD');
            temp.CreatedOn = moment(obj.CreatedOn).format('YYYY-MM-DD hh:mm:ss');
            listforTable_History.push(temp);
        });
        setListCampHistory([...listforTable_History]);
        
    }

    const handleDetails = async (e) => {
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        setselectedObj(obj);
        let objDetails = ({ Flag: 'DETAILS', CampaignId: obj.CampaignId.toString() });
        let CampaignDetailsResponse = await dispatch(GetCampaignApprovalData(objDetails));
        setListItemNo([...CampaignDetailsResponse.result[0].campItems == undefined ? '' : JSON.parse(CampaignDetailsResponse.result[0].campItems)]);
        setListCelebrity([...CampaignDetailsResponse.result[0].campCelebrities == undefined ? '' : JSON.parse(CampaignDetailsResponse.result[0].campCelebrities)]);
        handleShow();
    }

    const handleCloseDetails = () => {
        setCampDetailsshow(false);
    }
    const handleShow = () => {
        setCampDetailsshow(true);
    }
    const toggle = () => setIsOpen(!isOpen);
    // const options = {          
    //     totalSize: +totalSize,
    //     onSizePerPageChange: (sizePerPage, page) => {
    //         let objLoad = ({ Flag: 'HISTORY',PageIndex:(page-1).toString(),PageSize:sizePerPage.toString() });
    //         BindGrid(objLoad);          
    //     },
    //     onPageChange:async (page, sizePerPage) => {          
    //         if ((page-1) !=0){
    //             let objLoad = ({ Flag: 'HISTORY',PageIndex:(page-1).toString(),PageSize:sizePerPage.toString() });
    //             BindGrid(objLoad);
    //         }           
    //     }
    //   };
    const handleTableChange = async (type, { page, sizePerPage }) => {
        page = page == 0 ? 1 : page;
        console.log("Page-", page + "Size-", sizePerPage);
        let objLoad = ({ Flag: 'HISTORY', PageIndex: (page - 1).toString(), PageSize: sizePerPage.toString() });
        BindGrid(objLoad);
        setpage(page);
        setsizePerPage(sizePerPage);
    }
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

            <Row >
                <Col>
                    <Card className="mb-12">
                        <CardHeader>
                            <span style={{ cursor: 'pointer' }} onClick={toggle} > Campaign History</span>
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
                        {/* <CardHeader>
                            <span style={{ cursor: 'pointer' }} onClick={toggle} >Campaign History</span>
                        </CardHeader> */}
                        <CardBody>
                            <div style={{ textAlign: "right", fontSize: "10px" }}>
                            </div>
                            <ToolkitProvider
                                
                                keyField="CampaignId"
                                data={ListCampHistory}
                                columns={ordColumns}
                                search
                            >
                                {
                                    props => (
                                        <div>
                                            <SearchBar {...props.searchProps} />
                                            <hr />
                                            <BootstrapTable remote  bootstrap4 classes="customTable" striped hover condensed rowStyle={rowStyle}
                                            //   pagination={paginationFactory(options)}   
                                            pagination={paginationFactory({  page, sizePerPage, totalSize })} defaultSorted={defaultSorted}
                                            //remote={ { search: true } }
                        onTableChange={handleTableChange}          
                                                {...props.baseProps}
                                            />
                                        </div>
                                    )
                                }
                            </ToolkitProvider>


                        </CardBody>
                    </Card>
                </Col>
            </Row>

        </Page>
    )
}
export default CampaignHistory;