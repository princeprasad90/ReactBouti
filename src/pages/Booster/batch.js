import React, { useEffect, useState } from 'react';
import Page from 'components/Page';
import {
    Card, CardBody, CardHeader, Col, Row, FormText,
    Label, Input, Button, FormGroup, Collapse, Table
} from 'reactstrap';
import { Modal, Spinner } from 'react-bootstrap';
import * as common from '../../network/index';
import { toast } from 'react-toastify';
import { FaEdit } from "react-icons/fa";
import moment from 'moment';
import { listProdDeptAction,listProdCategoryAction } from 'actions/boosterActions/ProdDeptActions';
import {RoleNames} from 'utils/roleNames';
import { Blockitem } from 'components/Booster/BlockItem';
import { useSelector, useDispatch } from "react-redux";
import { PaginationTypes, PageSizeVals } from 'constants/common';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
function Batch(props) {
    const [showUpload, setshowUpload] = useState(false);
    const [isUploading, setisUploading] = useState(false);
    const [csvFile, setcsvFile] = useState({ attachment: '' });
    const [title, settitle] = useState({});
    const dispatch = useDispatch();
    const userData = JSON.parse(localStorage.getItem("userData"));
    const [errorList, seterrorList] = useState([]);
    const prodDeptList = useSelector((state) => state.BoosterReducer.listProdDept);
    const prodCategoryList = useSelector((state) => state.BoosterReducer.listProdCategory);
    const [batchSearchObj, setbatchSearchObj] = useState({});
    const [isOpen, setIsOpen] = useState(true);
    const [isloading, setisloading] = useState(false);
    const [page, setpage] = useState(1);
    const [sizePerPage, setsizePerPage] = useState(10);
    const [totalSize, settotalSize] = useState(0);
    const [serachResult, setserachResult] = useState({});
    const [batchList, setbatchList] = useState([]);
    const [ShowDetail, setShowDetail] = useState(false);
    const [ShowDetailEdit, setShowDetailEdit] = useState(false);
    const [lstViewData, setlstViewData] = useState([]);
    const [editTitle, seteditTitle] = useState();
    const [isCreateEnabled, setIsCreateEnabled] = useState(false);
    useEffect(() => {
       // let isCreateEnabledTemp = userData.roles.includes(RoleNames.BoosterProjectLeader);
        let isApprovalEnabledTemp =userData.roleId==15?true:false;
        setIsCreateEnabled(isApprovalEnabledTemp);
        getAll();
    }, []);
    useEffect(() => {
        try {
            if ('data' in serachResult) {
                let { data, totalSize } = serachResult;
                let listforTable = [];
                data.forEach(obj => {
                    let temp = { ...obj };
                    temp.batchId = <a className="btn btn-outline-dark  btn-sm" data-item={JSON.stringify(obj)} onClick={handleShow}  >{obj.id}</a>;
                    temp.createdDate = moment(obj.insertedOn).format('YYYY-MM-DD');
                    temp.action = <> </>
                    if(isCreateEnabled)
                    {
                        temp.action = <>
                        <a style={{cursor:'pointer',color:'blue'}} className=" m-1 " data-item={JSON.stringify(obj)} onClick={handleEdit} ><FaEdit /></a>
                      </>;
                    }

                    listforTable.push(temp);
                });
                setbatchList(listforTable);
                settotalSize(totalSize);
            }
            else {
                setbatchList([]);
                settotalSize(0);
            }
        }
        catch (e) {
            toast.error(`Something went wrong1`);
        }
    }, [serachResult])
    const getAll = async () => {

        if (prodDeptList.length === 0) {
            await dispatch(listProdDeptAction());
        }
        if (prodCategoryList.length === 0) {
            await dispatch(listProdCategoryAction());
        }
    }
    const handleClose = () => {
        setshowUpload(false);
    }
    const showUploadModal = (e) => {
        setshowUpload(true);
        seterrorList([]);
        setcsvFile({ attachment: '' });
        settitle({});
    }
    const uploadSku = () => {
        if (!(title.length > 0)) {
            toast.error("Batch Title is required");
        }
        else {
            let fileObj = csvFile.attachment;
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
                reader.onload = fileReadOnLoadEventHandler;
                reader.onerror = (evt) => {
                    console.log("evt", evt);
                };
            }
            else {
                toast.error("Please upload a .csv file less than 1MB")
            }
        }
    }

    const fileReadOnLoadEventHandler = async (evt) => {
        let fileString = evt.target.result.trim();
        let fileContentArray = fileString.split(/\r\n|\n/);
        let errors = [];
        let tempbatchItemsList = [];
        for (let index = 0; index < fileContentArray.length; index++) {
            let line = fileContentArray[index];
            if (index === 0) {
                if (line !== 'ItemNo,Department,Category') {
                    let err = `Check Headers!. Please download batch format to verify`;
                    toast.error(err);
                    errors.push(err);
                    break;
                }
            }
            else {
                let itemDetails = line.split(',');
                let [sku, Dept, Category] = itemDetails;
                if (itemDetails.length != 3) {
                    errors.push(`Line #${index + 1} not in correct format`);
                    continue;
                }
                else {
                    let tempDept = prodDeptList.find(d=>d.label.toUpperCase()===Dept.toUpperCase());
                    let tempCategory = prodCategoryList.find(c=>c.label.toUpperCase()===Category.toUpperCase());
                    if (!(typeof sku === "string" && sku.length > 0)) {
                        errors.push(`Line #${index + 1} does not have itemNo`);
                        continue;
                    }
                    else if (tempDept===undefined) {
                        errors.push(`Line #${index + 1}, ${Dept}: Dept does not exist`);
                        continue;
                    }
                    else if (tempCategory===undefined) {
                        errors.push(`Line #${index + 1}, ${Category}: Catogory does not exist`);
                        continue;
                    }
                    else if (tempbatchItemsList.map(t => t.itemNo).includes(sku)) {
                        errors.push(`Line #${index + 1}, ${sku} Duplicated`);
                    }
                    else {
                        let batchItem = {
                            "itemNo": sku,
                            "department": tempDept.label,
                            "category": tempCategory.label
                        }
                        tempbatchItemsList.push(batchItem);
                    }
                }

            }
        }
        let itemsCSV = tempbatchItemsList.map(t => t.itemNo).join(',');
        let itemDetailsArray = await getItemDetails(itemsCSV);

        tempbatchItemsList.forEach(el => {
            try{
                let itemInfo = itemDetailsArray.find(i => i.sku.toUpperCase() === el.itemNo.toUpperCase());
                if (!itemInfo) {
                    errors.push(`${el.itemNo} is an invalid item`);
                }
                else if(itemInfo.celebExclusive===true){
                    errors.push(`${el.itemNo} is an exclusive item`);
                }
                else {
                    el.itemNo = itemInfo.sku;
                    el.itemDesc = itemInfo.enShortDescription;
                    el.itemURL = itemInfo.defaultImage;
                    el.brand = ('brand' in itemInfo)?itemInfo.brand.englishName:'';
                }
            }catch(e)
            {
                errors.push(`Something wrong with ${el.itemNo} ${e}`);
            }

        });
        if (errors.length > 0) {
            seterrorList(errors);
        }
        else {
           createBatch(tempbatchItemsList);
        }

    };
    const getItemDetails = async (itemCSV) => {
        let request = {
            "skuCode": itemCSV,
            "countryCode": "kw_en",
            "parentSku": "",
            "columns": ""
        };
        let output = await common.apiCall2('POST', `ESSearch/GetESSearchPlus`, request);
        return output.data.result;
    }
    const createBatch = async (tempbatchItemsList) => {
        let req = { title, batchId: 0, batchType: "celebrity", itemList: tempbatchItemsList };
        try {
            let output = await common.apiCall2('POST', `Booster/Batch_Campaign`, req);
            let { data } = output;
            if (data.status) {
                let { result } = data;
                toast.success(`Successfully Created batch# ${result.batchId}`);
            }
            else {
                toast.error(`Failed to create`);
            }
        } catch (e) {
            toast.error(`Something went wrong with Api`);
        }

        handleClose();
        seterrorList([]);
        setcsvFile({ attachment: '' });
        settitle({});
    }
    const handleTableChange = async (type, { page, sizePerPage }) => {
        if (type === PaginationTypes.Clear || type === PaginationTypes.Search) {
            page = 1
        }
        const currentIndex = (page - 1) * sizePerPage;
        setisloading(true);
        let pageSizeAllowed = PageSizeVals.includes(sizePerPage);
        let size = pageSizeAllowed ? sizePerPage : 10;
        let request = { ...batchSearchObj };
        for (const [key, value] of Object.entries(request)) {
            if (!value.trim()) {
                request[key] = null;
            }
        }
        request.pageSize = size;
        request.currentIndex = currentIndex;
        try {
            let output = await common.apiCall2('POST', `Booster/GetBatchSearch`, request);
            let { data } = output;
            let { result } = data;
            setserachResult(result);
        }
        catch (e) {
            toast.error(`Something went wrong in Api`);
        }
        setisloading(false);
        setpage(page);
        setsizePerPage(sizePerPage);
    }
    const columns = [{ dataField: 'batchId', text: 'Batch Id' },
    { dataField: 'title', text: 'Title' },
    { dataField: 'itemCount', text: 'Item Count' },
    { dataField: 'batchType', text: 'Batch Type' },
    { dataField: 'createdDate', text: 'Created Date' },
    { dataField: 'action', text: 'Action' },
    ];
    const toggle = () => setIsOpen(!isOpen);
    const handleReset = async () => {
        setbatchSearchObj({});
    }

    const handleShow = async (e) => {
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        let request = { batchIdCSV: String(obj.id) }
        let output = await common.apiCall2('POST', `Booster/GetBatchDetails`, request);
        setlstViewData(output.data.result);
        seteditTitle(`Batch# ${obj.id} - ${obj.title}`);
        setShowDetail(true);
    }
    const handleEdit = async (e) => {
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        let request = { batchIdCSV: String(obj.id) }
        let output = await common.apiCall2('POST', `Booster/GetBatchDetails`, request);
        setlstViewData(output.data.result);
        seteditTitle(`Batch# ${obj.id} - ${obj.title}`);
        setShowDetailEdit(true);
    }
    
    const handleCloseDetail = (e) => {
        setShowDetail(false);
    }
    const handleCloseDetailEdit = (e) => {
        setShowDetailEdit(false);
    }
   const downloadCSV = (choice) =>{
    let downList =choice==='Dept'?[...prodDeptList]:[...prodCategoryList];
    console.log(choice,downList);
    let csvFile = 'Id,'+choice+'\n';
    downList.forEach(({value,label})=>{
      csvFile += value+','+label;
      csvFile += '\n'
    });
    let hiddenElement = document.createElement('a');  
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvFile);  
    hiddenElement.download = choice+'.csv';  
    hiddenElement.click(); 
   }
    return (
        <Page >
            <Row>
                <Col>
                    <Modal show={showUpload} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Batch Upload</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="colShadow" style={{ width: '100%' }} >
                                <FormGroup >
                                    <span className='d-block font-italic font-weight-light m-2  '> Download</span>
                                    <a href='/BatchFormat.csv' download color="link" className="caret btn-sm "> Batch Upload Format</a>
                                    <a href='#' onClick={()=>downloadCSV('Dept')} color="link" className="caret btn-sm "> Department Master </a>
                                    <a href='#' onClick={()=>downloadCSV('Category')} color="link" className="caret btn-sm "> Category Master </a>
                                </FormGroup>
                            </div>
                            <div className="colShadow " style={{ width: '100%' }} >
                                <FormGroup className=" p-2">
                                    <Input
                                        style={{ fontSize: '15px' }}
                                        type="text"
                                        name="title"
                                        className="m-2 col-sm-6"
                                        placeholder="Batch Title"
                                        onChange={e => settitle(e.target.value)} />
                                </FormGroup>
                                <FormGroup className="m-2">
                                    <Label for="uploadFile">Upload Batch</Label>
                                    <FormText color="muted">
                                    </FormText>
                                    <input type="file" name="uploadFile" className="m-2" accept=".csv" onChange={e => setcsvFile({ ...csvFile, attachment: e.target.files[0] })} />
                                    {isUploading && <Spinner animation="border" variant="primary" />}
                                    {!isUploading && <Button color="primary" className="m-2" size="lg" style={{ float: 'right' }} onClick={uploadSku} >Upload</Button>}
                                </FormGroup>
                                {errorList.length > 0 &&
                                    <div className="m-3">
                                        <FormText color="muted">
                                        </FormText>
                                        {errorList.map((err, index) => {
                                            return (<div key={index}>
                                                <span className="badge rounded-pill bg-primary text-white">{err}</span>
                                            </div>
                                            )
                                        })
                                        }
                                    </div>
                                }
                                <FormGroup>

                                </FormGroup>
                            </div>

                        </Modal.Body>
                    </Modal>
                </Col>
            </Row>
            <Row>
                <Col>
             <Blockitem ShowDetailEdit = {ShowDetailEdit } title={editTitle} handleCloseDetailEdit = {handleCloseDetailEdit}
              lstViewData ={lstViewData}/>
                   
                </Col>
            </Row>
            <Row>
                <Col>
                    <Modal show={ShowDetail} onHide={handleCloseDetail}>
                        <Modal.Header closeButton>
                            <Modal.Title>{editTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Table className="customTable" id="vieworder">
                                <thead>
                                    <tr>
                                        <th scope="col">ItemNo</th>
                                        <th scope="col">UpdatedOn</th>
                                        <th scope="col">IsActive</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        lstViewData && lstViewData.map((obj) => {

                                            const { id, batchId, itemNo, updatedOn, isActive } = obj;

                                            return (
                                                <tr key={id} >
                                                    <td>{itemNo}</td>
                                                    <td>{updatedOn}</td>
                                                    <td>{isActive}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </Modal.Body>
                    </Modal>
                </Col>
            </Row>
            <Row >
                <Col>
                    <Card className="mb-12">
                        <CardHeader>
                            <span style={{ cursor: 'pointer' }} onClick={toggle} >Batch List</span>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col>
                                    <div style={{ float: 'left', position: 'relative' }}>
                                        {isCreateEnabled && <a href="#"  onClick={showUploadModal} color="primary" className="caret btn-sm mr-10">+Upload Batch 
                                        </a> }
                                    </div>
                                </Col>
                            </Row>
                            <Collapse isOpen={isOpen}>
                                <div className="row" style={{ fontSize: "0.8rem" }}>
                                    <div className="BoxLayout colShadow" >
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="fromDate">From Date </Label>
                                            <Input
                                                type="date"
                                                name="fromDate"
                                                id="fromDate"
                                                placeholder="From date"
                                                value={batchSearchObj.fromDate || ''}
                                                onChange={e => setbatchSearchObj({ ...batchSearchObj, fromDate: e.target.value })}
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
                                                value={batchSearchObj.toDate || ''}
                                                onChange={e => setbatchSearchObj({ ...batchSearchObj, toDate: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>

                                    </div>
                                    <div className="BoxLayout colShadow" >
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="ItemNoCSV">ItemNos</Label>
                                            <Input
                                                type="text"
                                                name="itemNoCSV"
                                                id="itemNoCSV"
                                                placeholder="ItemNoCSV"
                                                value={batchSearchObj.itemNoCSV || ''}
                                                onChange={e => setbatchSearchObj({ ...batchSearchObj, itemNoCSV: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout">
                                            <Label for="batchIdCSV">Batch Id</Label>
                                            <Input
                                                type="text"
                                                name="batchIdCSV"
                                                id="batchIdCSV"
                                                placeholder="Batch Ids"
                                                value={batchSearchObj.batchIdCSV || ''}
                                                onChange={e => setbatchSearchObj({ ...batchSearchObj, batchIdCSV: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>


                                    </div>
                                    <div className="BoxLayout colShadow" >

                                        <FormGroup className=" InnerBoxLayout">
                                            <Label for="batchType">Batch Type</Label>
                                            <Input
                                                type="text"
                                                name="batchType"
                                                id="batchType"
                                                placeholder="Enter Type"
                                                value={batchSearchObj.batchType || ''}
                                                onChange={e => setbatchSearchObj({ ...batchSearchObj, batchType: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                        <FormGroup className=" InnerBoxLayout">
                                            <Label for="title">Batch Title</Label>
                                            <Input
                                                type="text"
                                                name="title"
                                                id="title"
                                                placeholder="Enter Batch Title"
                                                value={batchSearchObj.title || ''}
                                                onChange={e => setbatchSearchObj({ ...batchSearchObj, title: e.target.value })}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                        </FormGroup>
                                    </div>
                                    <div className="BoxLayout colShadow" >
                                        <FormGroup className="InnerBoxLayout" style={{ marginTop: "30px" }}>
                                            <Button className="btn btn-success" onClick={e => handleTableChange(PaginationTypes.Search, { page, sizePerPage })}
                                                style={{ fontSize: "0.8rem", width: "90%", marginLeft: "5%" }}  >Search</Button>
                                        </FormGroup>
                                        <FormGroup className="InnerBoxLayout" style={{ marginTop: "30px" }}>
                                            <Button className="btn btn-primary" style={{ fontSize: "0.8rem", width: "90%", marginLeft: "5%" }} onClick={handleReset}  >Reset</Button>

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
                            {isloading && <Spinner animation="border" variant="primary" />}
                            {!isloading && <BootstrapTable
                                remote
                                keyField="id"
                                data={batchList}
                                columns={columns}
                                classes="customTable"
                                pagination={paginationFactory({ showTotal: true, page, sizePerPage, totalSize })}
                                onTableChange={handleTableChange}
                            />}
                        </CardBody>
                    </Card>
                </Col>
            </Row>

        </Page>
    )
}
export default Batch;