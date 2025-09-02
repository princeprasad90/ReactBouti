import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect } from 'react'
import moment from 'moment';
import { Modal, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import {
    Button, Card, CardBody, CardHeader,
    Col, FormGroup, Input, Label, Row,
    Table, Collapse
} from 'reactstrap';
import Page from 'components/Page';
import {    listMappedCelebrityAction} from '../../../actions/celebrityActions/CelebrityActions';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import * as common from '../../../network/index';
import { PaginationTypes, PageSizeVals } from 'constants/common';
import { FaEllipsisH,FaBan } from "react-icons/fa";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { toast } from 'react-toastify';
import { GetCampaignApprovalData} from 'actions/boosterActions/CampaignActions';
const CampaignSearch = () => {
    const [objRequest, setobjRequest] = useState({});
    const [objCeleb, setobjCeleb] = useState({})
    const ddlCeleb = useSelector((state) => state.CelebrityReducer.listCelebrity);
    const userData = JSON.parse(localStorage.getItem("userData"));
    const [ShowDetail, setShowDetail] = useState(false);
    const [isloading, setisloading] = useState({OnGoing:false ,UpComing:false , History:false,Rejected:false });
    const [page, setpage] = useState({OnGoing:1 ,UpComing:1 ,History:1, Rejected:1 });
    const [sizePerPage, setsizePerPage] = useState({OnGoing:10 ,UpComing:10 ,History:10 ,Rejected:10  });
    const [selectedCelebrity, setselectedCelebrity] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
    const [isOnGoingOpen, setisOnGoingOpen] = useState(false);
    const [isUpComingOpen, setisUpComingOpen] = useState(false);
    const [isHistoryOpen, setisHistoryOpen] = useState(false);
    const [isRejectedOpen, setisRejectedOpen] = useState(false)
    const [CelebsList, setCelebsList] = useState([]);
    const [dataOnGoing, setdataOnGoing] = useState([]);
    const [dataUpComing, setdataUpComing] = useState([]);
    const [dataHistory, setdataHistory] = useState([]);
    const [dataRejected, setdataRejected] = useState([]);
    const [totalSizeOnGoing, settotalSizeOnGoing] = useState(0);
    const [totalSizeUpComing, settotalSizeUpComing] = useState(0);
    const [totalSizeHistory, settotalSizeHistory] = useState(0);
    const [totalSizeRejected, settotalSizeRejected] = useState(0);
    const [isSearching, setisSearching] = useState(false);
    const [listItemNo, setlistItemNo] = useState([]);
    const [listCelebrity, setlistCelebrity] = useState([]);
    const [details, setdetails] = useState({})
    const dispatch = useDispatch();
    const columns = [
        { dataField: 'campId', text: '#' },
        { dataField: 'title', text: 'Title' },
        { dataField: 'fromDate', text: 'From Date' },
        { dataField: 'toDate', text: 'To Date' },
        { dataField: 'commision', text: 'Extra Commision' },
        { dataField: 'campaignType', text: 'Campaign Type' },       
        { dataField: 'insertedUser', text: 'Inserted User' }
    ];
	const [tableColumns, settableColumns] = useState({OnGoing:[...columns] ,UpComing:[...columns], History:[...columns], Rejected:[...columns]});
    const Choice = {
        OnGoing : 'OnGoing',
        UpComing: 'UpComing',
        History: 'History',
        Rejected: 'Rejected'
    };
    useEffect(() => {
        settableColumns({
            ...tableColumns,
            Rejected: [...columns, { dataField: 'rejectionReason', text: 'RejectionReason' }]
        });
        getAll();
    }, []);

   
    useEffect(() => {
        let tempCeleb = [...ddlCeleb];
        let celebArray = tempCeleb.map(c=>{return {value:c.value,label:`${c.value}-${c.label}`}});
        setCelebsList(celebArray);
    }, [ddlCeleb]);
  
    const getAll = async () => {
        setisloading({OnGoing:true ,UpComing:true , History:true });
        objCeleb.userid = userData.magentoUserId;
        if (ddlCeleb.length === 0) {
            await dispatch(listMappedCelebrityAction(objCeleb));
        }
        setisloading({OnGoing:false ,UpComing:false , History:false });
    }
    const handleSearch = async () => {
        setisSearching(true);
        let celebIdCSV =null;
        if (selectedCelebrity.length>0){
            celebIdCSV = selectedCelebrity.map(c=>c.value).join(',');
        }
        let request = {...objRequest,celebIdCSV};
        Promise.all([ getData(request,Choice.OnGoing),
                      getData(request,Choice.UpComing),
                      getData(request,Choice.History),
                      getData(request,Choice.Rejected)])
        .then(([resultOnGoing, resultUpComing, resultHistory,resultRejected]) => {
            loadData(resultOnGoing,Choice.OnGoing);
            loadData(resultUpComing,Choice.UpComing);
            loadData(resultHistory,Choice.History);
            loadData(resultRejected,Choice.Rejected);
        });
         setpage({OnGoing:1 ,UpComing:1 ,History:1 , Rejected:1});
         setsizePerPage({OnGoing:10 ,UpComing:10 ,History:10 ,Rejected:10});
        setisSearching(false);
    }

    const getData = (request,id)=>{
       return common.apiCall2('POST', `Misc/GetCelebCampaignList`, {...request,choice:id });
    };
    const loadData = (response,id)=>{
        try{
            let { data } = response;
            if (data.status) {
                let { result } = data;
                let tempData = result.data;
                let dataArray = [];
                tempData.forEach(obj=>{
                   let camp = {...obj};
                   camp.campId = <a className="btn btn-outline-dark  btn-sm" data-item={JSON.stringify(obj)} onClick={handleDetails}  >{obj.id}</a>;
                   camp.fromDate = moment(obj.date1).format('YYYY-MM-DD hh:mm:ss');
                   camp.toDate = moment(obj.date2).format('YYYY-MM-DD hh:mm:ss');
                   dataArray.push(camp);
                })
                switch(id){
                    case Choice.OnGoing : setdataOnGoing(dataArray);
                                    settotalSizeOnGoing(result.totalSize);
                                    break;
                    case Choice.UpComing : setdataUpComing(dataArray);
                                    settotalSizeUpComing(result.totalSize);
                                    break;
                    case Choice.History : setdataHistory(dataArray);
                                    settotalSizeHistory(result.totalSize);
                                    break;
                    case Choice.Rejected : setdataRejected(dataArray);
                                    settotalSizeRejected(result.totalSize);
                                    break;                           
                }
            }
            else {
                toast.error(`Failed fetching ${id} `);
            }
        }catch(e){
             console.log("e",e);
        }
     };

    const handleTableChange = async (type, { page: pageParam, sizePerPage: sizePerPageParam },id) => {
        if (type === PaginationTypes.Clear || type === PaginationTypes.Search) {
            pageParam = 1
        }
        const currentIndex = (pageParam - 1) * sizePerPageParam;
        setisloading({...isloading,[`${id}`]:true});
        let pageSizeAllowed = PageSizeVals.includes(sizePerPageParam);
        let size = pageSizeAllowed ? sizePerPageParam : 10;
        let paginationObj = {
            pageSize : size,
            currentIndex
        };
        let response = await getData({...objRequest,...paginationObj},id);
        loadData(response,id);
        setisloading({...isloading,[`${id}`]:false});
        setpage({...page,[`${id}`]:pageParam});
        setsizePerPage({...sizePerPage,[`${id}`]:sizePerPageParam});
    }

    const handleTableChangeOnGoing = async (type, { page, sizePerPage }) => {
        handleTableChange(type, { page, sizePerPage },Choice.OnGoing);
    }
    const handleTableChangeUpComing = async (type, { page, sizePerPage }) => {
        handleTableChange(type, { page, sizePerPage },Choice.UpComing);
    }
    const handleTableChangeHistory = async (type, { page, sizePerPage }) => {
        handleTableChange(type, { page, sizePerPage },Choice.History);
    }
    const handleTableChangeRejected = async (type, { page, sizePerPage }) => {
        handleTableChange(type, { page, sizePerPage },Choice.Rejected);
    }
    const handleReset = async () => {
        setobjRequest({});
        setselectedCelebrity([]);
    }
    const handleDetails = async (e) => {
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        console.log("obj",obj);
        setdetails(obj);
        let objDetails = ({ Flag: 'DETAILS', CampaignId: obj.id.toString() });
        let CampaignDetailsResponse = await dispatch(GetCampaignApprovalData(objDetails));
        setlistItemNo([...CampaignDetailsResponse.result[0].campItems == undefined ? '' : JSON.parse(CampaignDetailsResponse.result[0].campItems)]);
        setlistCelebrity([...CampaignDetailsResponse.result[0].campCelebrities == undefined ? '' : JSON.parse(CampaignDetailsResponse.result[0].campCelebrities)]);
        setShowDetail(true);
    }


    const handleClose = (e) => {
        setShowDetail(false);
    }
 
    const toggle = () => setIsOpen(!isOpen);

    return (
        <Page>
            <div>
                <Modal size="lg" centered show={ShowDetail} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>CampId#{details.id}  {details.title}</Modal.Title>
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
                                        listItemNo && listItemNo.map((obj) => {
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
                                        listCelebrity && listCelebrity.map((obj) => {
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
                            <span style={{ cursor: 'pointer' }} onClick={toggle} >Campaign Search</span>
                        </CardHeader>
                        <CardBody>
                            <Collapse isOpen={isOpen}>
                                <div className="row" style={{ fontSize: "0.8rem" }}>
                                    <div className="BoxLayout colShadow" >
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="campaignIdCSV">CampaignId</Label>
                                            <Input
                                                type="text"
                                                name="campaignIdCSV"
                                                placeholder="campaignIdCSV"
                                                value={objRequest.campaignIdCSV || ''}
                                                onChange={e => setobjRequest({ ...objRequest, campaignIdCSV: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="campaignTitle">Campaign Name</Label>
                                            <Input
                                                type="text"
                                                name="campaignTitle"
                                                id="campaignTitle"
                                                placeholder="Campaign Name"
                                                value={objRequest.campaignTitle || ''}
                                                onChange={e => setobjRequest({ ...objRequest, campaignTitle: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>

                                    </div>
                                    <div className="BoxLayout colShadow" >
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="itemNoCSV">SKU CSV</Label>
                                            <Input
                                                type="text"
                                                name="itemNoCSV"
                                                id="itemNoCSV"
                                                placeholder="SKU CSV"
                                                value={objRequest.itemNoCSV || ''}
                                                onChange={e => setobjRequest({ ...objRequest, itemNoCSV: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="selCeleb">Celebrity</Label>
                                            <Select name="selCeleb" placeholder='Select Celebrity'
                                               isMulti value={selectedCelebrity}
                                                onChange={(val, act) => setselectedCelebrity(val)}                                              
                                                isClearable={true} options={CelebsList} />
                                        </FormGroup>


                                    </div>
                                    <div className="BoxLayout colShadow" >
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="commission">Extra Commission</Label>
                                            <Input
                                                type="number"
                                                name="commission"
                                                id="commission"
                                                placeholder="commission"
                                                value={objRequest.commission || ''}
                                                onChange={e => setobjRequest({ ...objRequest, commission: +e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="drpCampaignType">Campaign Type</Label>
                                            <select
                                                className="form-control"
                                                name="drpCampaignType"
                                                value={objRequest.campaignType || 'All'}
                                                onChange={(e) =>
                                                    setobjRequest({ ...objRequest, campaignType: e.target.value }
                                                    )
                                                }
                                                style={{ fontSize: "0.8rem" }}>
                                                <option value="All">-- Select --</option>
                                                <option value="Celebrity"> Celebrity</option>
                                                <option value="Management"> Management</option>
                                            </select>
                                        </FormGroup>

                                    </div>
                                    <div className="BoxLayout colShadow" >
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="startDate">Start Date</Label>
                                            <Input
                                                type="Date"
                                                name="startDate"
                                                id="startDate"
                                                placeholder="Start Date"
                                                value={objRequest.startDate || ''}
                                                onChange={e => setobjRequest({ ...objRequest, startDate: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout" style={{ marginTop: "30px" }}>
                                            {isSearching && <Spinner animation="border" variant="primary" />}
                                            {!isSearching && <Button className="btn btn-success" onClick={e => handleSearch(e)} style={{ fontSize: "0.8rem", width: "40%", marginLeft: "5%" }}  >Search</Button>}
                                            <Button className="btn btn-primary" onClick={e => handleReset(e)} style={{ fontSize: "0.8rem", width: "40%", marginLeft: "5%" }}  >Reset</Button>
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
                         <div className="shadow  m-2 p-2">
                            <div className="border-bottom m-1 p-2" style={{ cursor: 'pointer' }} onClick={() => setisOnGoingOpen(!isOnGoingOpen)}>
                                <span  className="font-italic" > <FaEllipsisH /> On Going Campaign : {totalSizeOnGoing}  </span>
                            </div>
                            <Collapse isOpen={isOnGoingOpen}>
                                {isloading.OnGoing && <Spinner animation="border" variant="primary" />}
                                {!isloading.OnGoing && <BootstrapTable
                                    remote
                                    keyField="id"
                                    data={dataOnGoing}
                                    columns={tableColumns.OnGoing}
                                    classes="customTable"
                                    id = "OnGoing"
                                    pagination={paginationFactory({ showTotal: true, page:page.OnGoing, sizePerPage:sizePerPage.OnGoing, totalSize:totalSizeOnGoing })}
                                    onTableChange={handleTableChangeOnGoing}
                                />}
                            </Collapse>
                            </div>
                           
                            <div className="shadow  m-2 p-2 ">
                            <div className="border-bottom m-1 p-2" style={{ cursor: 'pointer' }} onClick={() => setisUpComingOpen(!isUpComingOpen)}>
                                <span  className="font-italic" > <HiArrowRight /> Up Coming Campaign : {totalSizeUpComing}   </span>
                            </div>
                            <Collapse isOpen={isUpComingOpen}>
                                {isloading.UpComing && <Spinner animation="border" variant="primary" />}
                                {!isloading.UpComing && <BootstrapTable
                                    remote
                                    keyField="id"
                                    data={dataUpComing}
                                    columns={tableColumns.UpComing}
                                    classes="customTable"
                                    id = "UpComing"
                                    pagination={paginationFactory({ showTotal: true, page:page.UpComing, sizePerPage:sizePerPage.UpComing, totalSize:totalSizeUpComing })}
                                    onTableChange={handleTableChangeUpComing}
                                />}
                            </Collapse>
                            </div>  
                            <div className="shadow  m-2 p-2">
                            <div className="border-bottom m-1 p-2" style={{ cursor: 'pointer' }} onClick={() => setisHistoryOpen(!isHistoryOpen)}>
                                <span  className="font-italic" > <HiArrowLeft />History : {totalSizeHistory}   </span>
                            </div>
                            <Collapse isOpen={isHistoryOpen}>
                                {isloading.History && <Spinner animation="border" variant="primary" />}
                                {!isloading.History &&  <BootstrapTable
                                    remote
                                    keyField="id"
                                    data={dataHistory}
                                    columns={tableColumns.History}
                                    classes="customTable"
                                    id = "History"
                                    pagination={paginationFactory({ showTotal: true, page:page.History, sizePerPage:sizePerPage.History, totalSize:totalSizeHistory })}
                                    onTableChange={handleTableChangeHistory}
                                />}
                            </Collapse>
                            </div> 
                            <div className="shadow  m-2 p-2">
                            <div className="border-bottom m-1 p-2" style={{ cursor: 'pointer' }} onClick={() => setisRejectedOpen(!isRejectedOpen)}>
                                <span  className="font-italic" > <FaBan /> Rejected : {totalSizeRejected}   </span>
                            </div>
                            <Collapse isOpen={isRejectedOpen}>
                                {isloading.Rejected && <Spinner animation="border" variant="primary" />}
                                {!isloading.Rejected &&  <BootstrapTable
                                    remote
                                    keyField="id"
                                    data={dataRejected}
                                    columns={tableColumns.Rejected}
                                    classes="customTable"
                                    id = "Rejected"
                                    pagination={paginationFactory({ showTotal: true, page:page.Rejected, sizePerPage:sizePerPage.Rejected, totalSize:totalSizeRejected })}
                                    onTableChange={handleTableChangeRejected}
                                />}
                            </Collapse>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Page>
    );

};
export default CampaignSearch;