import React, { useEffect, useState, useRef } from 'react';
import Page from 'components/Page';
import { Modal, Spinner } from 'react-bootstrap';
import {
    Card, CardBody, CardHeader, Col, Row, FormText, Label,
    Button, FormGroup, Input, Form, Table
} from 'reactstrap';
import { RoleNames } from 'utils/roleNames';
import * as common from '../../network/index';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { allListCelebrityAction } from 'actions/celebrityActions/CelebrityActions';
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { ValidationForDecimal } from 'actions/helper/CommonActions';
function Campaign(props) {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const [isUploading, setisUploading] = useState(false);
    const [csvFile, setcsvFile] = useState({ attachment: '' });
    const [campItemsList, setcampItemsList] = useState([])
    const [celbrityList, setcelbrityList] = useState([])
    const dispatch = useDispatch();
    const ddlAllCeleb = useSelector((state) => state.CelebrityReducer.allCelebs);
    const [ddlcelebrity, setddlcelebrity] = useState([]);
    const [selectedCelebrity, setselectedCelebrity] = useState();
    const [magentoUserId, setMagentoUserId] = useState(JSON.parse(localStorage.getItem('userData')).magentoUserId,);
    const [objRequest, setobjRequest] = useState({});
    const [isCreating, setisCreating] = useState(false);
    const [errMsgModalshow, setErrMsgModalshow] = useState(false);
    const [errItemList, seterrItemList] = useState([]);
    const [errCelebList, seterrCelebList] = useState([]);
    const ref = useRef();
    const [count, setCount] = useState(0);
    const [createRes, setcreateRes] = useState([]);
    const [isCreateEnabled, setIsCreateEnabled] = useState(false);
    const [defaultCelebritiesValues, setdefaultCelebritiesValues] = useState([]);
    const [isClickSearchButton, setisClickSearchButton] = useState(common.uuidv4());


    useEffect(() => {
        getAll();
    }, [isClickSearchButton]);
    useEffect(() => {
        let tempCeleb = [...ddlAllCeleb];
        let celebArray = tempCeleb.map(c => { return { value: c.value, label: `${c.value}-${c.label}` } });
        setddlcelebrity([{ value: 0, label: "Select All" }, ...celebArray]);
        setdefaultCelebritiesValues([{ value: 0, label: "Select All" }, ...celebArray]);
    }, [ddlAllCeleb, isClickSearchButton]);
    const getAll = async () => {
        // let isCreateEnabledTemp = (userData.roles.includes(RoleNames.BoosterManager)
        //     && !(userData.roles.includes(RoleNames.BoosterProjectLeader))
        //     && (userData.roles.includes(RoleNames.BoosterManagement))
        // );
        let isApprovalEnabledTemp = userData.roleId == 15 ? true : false;
        setIsCreateEnabled(isApprovalEnabledTemp);
        if (ddlAllCeleb.length === 0) {
            let objCeleb = { userid: -1 }
            await dispatch(allListCelebrityAction(objCeleb));
        }
    }
    const itemFileReadOnLoadEventHandler = async (evt) => {
        let fileString = evt.target.result.trim();
        let fileContentArray = fileString.split(/\r\n|\n/);
        let errors = [];
        let tempCampList = [];
        for (let index = 0; index < fileContentArray.length; index++) {
            let line = fileContentArray[index];
            if (index === 0) {
                if (line !== 'ItemNo') {
                    toast.error("Check Headers!. Please download ItemNo format to verify");
                    break;
                }
            }
            else {
                if (!(typeof line === "string" && line.length > 0)) {
                    errors.push(`Line #${index + 1} does not have itemNo`);
                    continue;
                }
                else if (tempCampList.map(t => t.itemNo).includes(line.replace(/["]+/g, '').trim())) {
                    errors.push(`Line #${index + 1},${line} Duplicated`);
                }
                else {
                    tempCampList.push({ "itemNo": line.replace(/["]+/g, '').trim() });
                }
            }
        }
        let itemsCSVTemp = tempCampList.map(t => t.itemNo).join(',');
        let itemsCSV = itemsCSVTemp.replace(/["]+/g, '')
        let itemDetailsArray = await getItemDetails(itemsCSV);
        tempCampList.forEach(el => {
            try {
                let itemInfo = itemDetailsArray.find(i => i.sku.toUpperCase() === el.itemNo.toUpperCase());
                if (!itemInfo) {
                    errors.push(`${el.itemNo} is an invalid item`);
                }
                else if (itemInfo.celebExclusive === true) {
                    errors.push(`${el.itemNo} is an exclusive item`);
                }
                else {
                    el.itemNo = itemInfo.sku;
                    el.itemDesc = itemInfo.enShortDescription
                }
            } catch (e) {
                errors.push(`Something wrong with ${el.itemNo} ${e}`);
            }

        });
        if (errors.length > 0) {
            setErrMsgModalshow(true);
            ref.current.value = "";
        }
        seterrItemList(errors);
        setcampItemsList(tempCampList);
    };

    const uploadSku = (e) => {
        setcreateRes([]);
        let fileObj = e.target.files[0];
        let isValidFile = false;
        isValidFile = fileObj instanceof Blob;// checking file uploaded
        if (isValidFile) {
            let size = fileObj.size;
            let extn = fileObj.name.split('.')[1];
            isValidFile = isValidFile && (extn === 'csv') && (size <= 1048576);
        }
        if (isValidFile) {
            var reader = new FileReader();
            reader.readAsText(fileObj, "UTF-8");
            reader.onload = itemFileReadOnLoadEventHandler;
            reader.onerror = (evt) => {
                console.log("evt", evt);
            };
        }
        else {
            toast.error("Please upload a .csv file")
        }

    }

    const getItemDetails = async (itemCSV) => {
        let request = {
            "skuCode": itemCSV.replace(/\s*,\s*/ig, ',').trimStart(),
            "countryCode": "kw_en",
            "parentSku": "",
            "columns": ""
        };
        let output = await common.apiCall2('POST', `ESSearch/GetESSearchPlus`, request);
        return output.data.result;
    }
    const uploadCelebrity = (e) => {
        setcreateRes([]);
        let fileObj = e.target.files[0];
        let isValidFile = false;
        isValidFile = fileObj instanceof Blob;// checking file uploaded
        if (isValidFile) {
            let size = fileObj.size;
            let extn = fileObj.name.split('.')[1];
            isValidFile = isValidFile && (extn === 'csv') && (size <= 1048576);
        }
        if (isValidFile) {
            var reader = new FileReader();
            reader.readAsText(fileObj, "UTF-8");
            reader.onload = (evt) => {
                let fileString = evt.target.result.trim();
                let fileContentArray = fileString.split(/\r\n|\n/);
                let errors = [];
                let tempCelebList = [];
                for (let index = 0; index < fileContentArray.length; index++) {
                    let line = fileContentArray[index];
                    if (index === 0) {
                        if (line !== 'CelebrityId,Name') {
                            toast.error("Check Headers!. Please download CelebrityUpload format to verify");
                            break;
                        }
                    }
                    else {
                        let CelebDetails = line.split(',');
                        let [CelebrityId, CelebName] = CelebDetails;
                        if (CelebDetails.length === 0 || CelebDetails.length > 2) {
                            errors.push(`Line #${index + 1} not in correct format`);
                            continue;
                        }
                        else {
                            if (!(typeof CelebDetails[0] === "string" && CelebrityId.length > 0)) {
                                errors.push(`Line #${index + 1} does not have CelebrityId`);
                                continue;
                            }
                            else if (tempCelebList.map(t => t.CelebrityId).includes(CelebrityId)) {
                                errors.push(`Line #${index + 1}, ${CelebrityId} Duplicated`);
                            }
                            else if (!(ddlAllCeleb.map(c => c.value).includes(CelebrityId))) {
                                errors.push(`Line #${index + 1}, ${CelebrityId} is wrong Celebrity Id`);
                            }
                            else {
                                tempCelebList.push({ CelebrityId });
                            }
                        }
                    }
                }

                if (errors.length > 0) {
                    seterrCelebList(errors);
                    setErrMsgModalshow(true);
                }
                else {
                    seterrCelebList([]);
                }

                setcelbrityList(tempCelebList);
            };
            reader.onerror = (evt) => {
                console.log("evt", evt);
            };
        }
        else {
            toast.error("Please upload a .csv file")
        }
    }

    const handleCreate = async (e) => {
        let today = moment(new Date());
        let fromDate = moment(objRequest.fromDate);
        let toDate = moment(objRequest.toDate);
        let decimalLength = ValidationForDecimal(objRequest.commission);
        let celebrityListArray = [...celbrityList];
        if (celebrityListArray.length === 0 && (selectedCelebrity !== undefined ? selectedCelebrity.length > 0 : 0)) {

            if (selectedCelebrity.length === 1 && selectedCelebrity[0].value === 0) {
                celebrityListArray = defaultCelebritiesValues.map(c => { return { 'CelebrityId': c.value } });
            }
            else {
                celebrityListArray = selectedCelebrity.map(c => { return { 'CelebrityId': c.value } });
            }

        }
        if (fromDate.isAfter(toDate)) {
            toast.warn(`From Date Should be Greater than ToDate !`);
            return;
        }
        else if (!fromDate.isAfter(today)) {
            toast.error(`From Date Should be Greater than today`);
            return;
        }
        else if (objRequest.title == undefined) {
            toast.warning("Please Enter Title");
            return;
        }
        // else if (campItemsList.length === 0) {
        //     toast.warning("Please Upload ItemNos");
        //     return;
        // }
        else if (celebrityListArray.length === 0) {
            toast.warning("Please Add or Upload  Celebrity");
            return;
        }
        else if (objRequest.commission === undefined || objRequest.commission <= 0 || objRequest.commission > 10) {
            toast.warning("Extra Commission Must be Between 0 and 10 ");
            return;
        }
        else if (decimalLength > 3) {
            toast.error(`Only 3 Decimal Places are allowed in Extra Commission`);
            return;
        }
        else if (errItemList.length > 0 || errCelebList.length > 0) {
            toast.warning("Upload Files Contains Error");
            setErrMsgModalshow(true);
            return;
        }
        else {
            setisCreating(true);
            let itemNoArray = campItemsList.map(i => { return { 'ItemNo': i.itemNo, 'ItemDesc': i.itemDesc } });
            let request = {
                CampainId: "0",
                Title: objRequest.title,
                Date1: objRequest.fromDate,
                Date2: objRequest.toDate,
                CampaignType: "Management",
                Commision: parseInt(objRequest.commission),
                InsertedBy: magentoUserId.toString(),
                ItemList: itemNoArray,
                CelebrityList: celebrityListArray
            };

            console.log('request', request)

            try {
                let output = await common.apiCall2('POST', `Booster/Camp_Create`, request);
                let { data } = output;
                let { result, status, message } = data;
                if (status) {
                    let tempList = [];
                    result.forEach(obj => {
                        let temp = {
                            ...obj,
                            campID: <a className="btn btn-outline-dark  btn-sm"  >{obj.campaignStatus === '200' ? obj.campaignId : 0}</a>,
                            msg: obj.campaignStatus === '200' ? 'Success' : 'Fail',
                            CelebName: (obj.celebrityId !== 0) ? ddlAllCeleb.find(c => c.value === obj.celebrityId.toString()).label : ''
                        };
                        tempList.push(temp);
                    });
                    setcreateRes(tempList);
                } else {
                    toast.error(message);
                }
            }
            catch (e) {
                console.log("error", e);
                toast.error(`Something went wrong with Api`);
            }
            setErrMsgModalshow(true);
            setisCreating(false);
            handleReset();
            setisClickSearchButton(common.uuidv4());
        }

    }
    const handleReset = async (e) => {
        setobjRequest({});
        setcampItemsList([]);
        setcelbrityList([]);
        setselectedCelebrity([]);
        ref.current.value = "";
        seterrItemList([]);
        seterrCelebList([]);

    }
    const handleClose = () => {
        setErrMsgModalshow(false);
    }
    const handleShow = () => {
        setErrMsgModalshow(true);
    }
    const columns = [{ dataField: 'campID', text: 'Campaign Id' },
    { dataField: 'msg', text: 'Status' },
    { dataField: 'CelebName', text: 'Celeb. Name' }];

    const expandRow = {
        onlyOneExpanding: false,
        renderer: row => {
            let { details } = row;
            return (
                <div>
                    {details.map(({ itemNo, lineMessage }, index) => {
                        return (
                            <div key={index}>
                                <span className="badge rounded-pill bg-primary text-white">{itemNo}/{lineMessage}</span>
                            </div>
                        )
                    })
                    }
                </div>
            )
        }
    };

    const rowStyle2 = (row, rowIndex) => {
        const style = {};
        if (row.campaignStatus != '200') {
            style.background = 'silver';
        }
        return style;
    };
    const { SearchBar } = Search;
    let options = {
        totalSize: count,
        showTotal: true,
        page: 1,
        sizePerPage: 8,
    };
    return (
        <Page >
            <div>
                <Modal show={errMsgModalshow} onHide={handleClose}>
                    <Modal.Header closeButton>
                        Upload Details
                    </Modal.Header>
                    <Modal.Body>
                        {errItemList.length > 0 && <div className="m-3">
                            <FormText >
                                <strong>Item List Upload Errors</strong>
                            </FormText>
                            {errItemList.map((err, index) => {
                                return (<div key={index}>
                                    <span className="badge rounded-pill bg-primary text-white">{err}</span>
                                </div>
                                )
                            })
                            }
                        </div>
                        }

                        {errCelebList.length > 0 && <div className="m-3">
                            <FormText >
                                <strong>Celebrity List Upload Errors</strong>
                            </FormText>
                            {errCelebList.map((err, index) => {
                                return (<div key={index}>
                                    <span className="badge rounded-pill bg-primary text-white">{err}</span>
                                </div>
                                )
                            })
                            }
                        </div>
                        }

                        {createRes.length > 0 && <ToolkitProvider
                            bootstrap4
                            keyField='celebrityId'
                            data={createRes}
                            columns={columns}
                            search
                        >
                            {
                                props => (
                                    <div>
                                        <SearchBar {...props.searchProps} />
                                        <hr />
                                        <BootstrapTable bootstrap4 classes="customTable" rowStyle={rowStyle2} striped hover condensed
                                            pagination={paginationFactory({ ...options })}
                                            expandRow={expandRow}
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>}
                    </Modal.Body>
                </Modal>
            </div>
            <Row>
                <Col>
                    <Card className="mb-12">
                        <CardHeader>Management Campaign</CardHeader>
                        <CardBody style={{ marginTop: "-14px" }}>
                            <div className="row" style={{ fontSize: "0.8rem" }}>
                                <div className="BoxLayout colShadow"  >
                                    <FormGroup className="InnerBoxLayout">
                                        <Label for="exampleTime">Title </Label>
                                        <Input
                                            type="text"
                                            name="Title"
                                            id="Title"
                                            placeholder="Title"
                                            value={objRequest.title || ''}
                                            onChange={e => setobjRequest({ ...objRequest, title: e.target.value })}
                                            style={{ fontSize: "0.8rem" }}
                                        />
                                    </FormGroup>
                                    <FormGroup className="InnerBoxLayout">
                                        <Label for="exampleTime"> Upload Item No</Label>
                                        <a href='/ItemListFormat.csv' download color="link" className="caret btn-sm mr-10">Download Format </a>
                                    </FormGroup>
                                    <FormGroup className="InnerBoxLayout">
                                        <FormText color="muted">
                                        </FormText>
                                        <input type="file" ref={ref} className="m-2" accept=".csv" onChange={e => { setcsvFile({ ...csvFile, attachment: e.target.files[0] }); uploadSku(e) }} />
                                        {isUploading && <Spinner animation="border" variant="primary" />}
                                    </FormGroup>
                                </div>
                                <div className="BoxLayout colShadow" >
                                    <FormGroup className="InnerBoxLayout">
                                        <Label for="exampleTime">Celebrity</Label>

                                        <Select name="selCeleb" placeholder='Select Celebrity'
                                            isMulti className="basic-multi-select"
                                            value={selectedCelebrity}
                                            onChange={(val, act) => {
                                                if (['clear', 'remove-value'].includes(act.action)) {
                                                    setselectedCelebrity([]);
                                                    setddlcelebrity(defaultCelebritiesValues);
                                                    return;
                                                }
                                                const { option: { value } } = act;
                                                if (value === 0) {
                                                    setselectedCelebrity([{ value: 0, label: "Select All" }]);
                                                    setddlcelebrity([]);
                                                    return;
                                                }
                                                setselectedCelebrity(val);
                                            }}
                                            isClearable={true} options={ddlcelebrity} />
                                    </FormGroup>
                                    {/* <FormGroup className="InnerBoxLayout">
                                        <Label for="exampleTime">OR Upload Celebrity</Label>
                                        <a href='/CelebrityUpload.csv' download color="link" className="caret btn-sm mr-10">Download Format </a>
                                    </FormGroup>
                                    <FormGroup className="InnerBoxLayout">
                                        <FormText color="muted">
                                        </FormText>
                                        <input type="file" ref={refCeleb} className="m-2" accept=".csv" onChange={e => { setcsvFile({ ...csvFile, attachment: e.target.files[0] }); uploadCelebrity(e) }} />
                                        {isUploading && <Spinner animation="border" variant="primary" />}
                                    </FormGroup> */}
                                </div>
                                <div className="BoxLayout colShadow" >
                                    <FormGroup className="InnerBoxLayout">
                                        <Label for="fromDate">From Date </Label>
                                        <Input
                                            type="date"
                                            name="fromDate"
                                            placeholder="From date"
                                            min={moment().format("YYYY-MM-DD")}
                                            value={objRequest.fromDate || ''}
                                            onChange={e => setobjRequest({ ...objRequest, fromDate: e.target.value })}
                                            style={{ fontSize: "0.8rem" }}
                                        />
                                    </FormGroup>
                                    <FormGroup className="InnerBoxLayout">
                                        <Label for="toDate">To Date</Label>
                                        <Input
                                            type="date"
                                            name="toDate"
                                            id="toDate"
                                            placeholder="To date"
                                            min={moment().format("YYYY-MM-DD")}
                                            value={objRequest.toDate || ''}
                                            onChange={e => setobjRequest({ ...objRequest, toDate: e.target.value })}
                                            style={{ fontSize: "0.8rem" }}
                                        />
                                    </FormGroup>
                                    <FormGroup className="InnerBoxLayout">
                                        <Label for="exampleTime">Extra Commission </Label>
                                        <Input
                                            type="number"
                                            name="commission"
                                            id="commission"
                                            autoComplete="off"
                                            min="0"
                                            placeholder="CelebrityCommission"
                                            value={objRequest.commission || 0}
                                            onChange={e => setobjRequest({ ...objRequest, commission: +e.target.value })}
                                            style={{ fontSize: "0.8rem" }}
                                        />
                                    </FormGroup>
                                </div>
                                <div className="BoxLayout colShadow" >
                                    <FormGroup className="InnerBoxLayout" style={{ marginTop: "30px" }}>
                                        {isCreateEnabled && !isCreating && <Button className="btn btn-success" onClick={handleCreate} style={{ fontSize: "0.8rem", width: "90%", marginLeft: "5%" }}  >Create</Button>}
                                        {isCreating && <Spinner animation="border" variant="primary" />}
                                    </FormGroup>
                                    <FormGroup className="InnerBoxLayout" style={{ marginTop: "30px" }}>
                                        <Button className="btn btn-primary" style={{ fontSize: "0.8rem", width: "90%", marginLeft: "5%" }} onClick={handleReset} >
                                            Reset </Button>
                                    </FormGroup>
                                    <FormGroup className="InnerBoxLayout" style={{ marginTop: "30px" }}>
                                        <Button className="btn btn-info" style={{ fontSize: "0.8rem", width: "90%", marginLeft: "5%" }} onClick={() => setErrMsgModalshow(true)} >
                                            Show Error Modal </Button>
                                    </FormGroup>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Page>
    )
}
export default Campaign;