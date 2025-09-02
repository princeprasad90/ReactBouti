import React, { useEffect, useState } from 'react';
import {  Card,  CardBody,  CardHeader,  Col,  Row,  Button,  Badge, Input,  } from 'reactstrap';
import { Modal } from 'react-bootstrap';
import { GrView,GrPowerReset} from "react-icons/gr";
import { FaSearch,FaArrowDown,FaArrowUp } from "react-icons/fa";
import { BsFlagFill } from "react-icons/bs";
import Page from 'components/Page';
import {toast } from 'react-toastify';
import { Detailtable } from '../../components/Notify/DetailTable';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import * as common from '../../network/index';
import {RoleNames} from 'utils/roleNames'

//#region apiCalls
const getNotifyHeadPagination = async (notifyReqObj) => {
  let output = await common.apiCall2('POST',`Notify/GetNotifyHeadPagination`, notifyReqObj)
  return output.data;
}

//#endregion

function NotifyList() {
  const [page, setpage] = useState(1);
  const [data, setdata] = useState([]);
  const [sizePerPage, setsizePerPage] = useState(10);
  const [totalSize, settotalSize] = useState(0);
  const [sku, setSku] = useState('');
  const [fromDate, setfromDate] = useState('');
  const [toDate, settoDate] = useState('');
  const [phone, setphone] = useState('');
  const [chkedSkus,setchkSkus] = useState([]);
  const [chkAll, setchkAll] = useState(false);
  const [orderBy, setorderBy] = useState('id');
  const [ascDesc, setascDesc] = useState('desc');
  const [arrow, setarrow] = useState('');
  const [detailItem, setdetailItem] = useState({});
  const [show, setShow] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData"));

  const handleClose = () => setShow(false);
  const PaginationTypes = {
    Search: 'Search',
    Clear: 'Clear'
  };

  const PageSizeVals = [10,25,30,50];

  const NotifySearchBy = {
    Header: 1,
    Phone: 2,
  }

//#region Effect
useEffect(() => {
  getData(0, 10, 'initial');  
  console.log("RoleNames",{...RoleNames});
}, []);


useEffect(() => {
    let temp = [...data];
    let rtn = temp.map(e=>{
    let chkBox = createCheckBox(e,1);
    return {...e,selectItem:chkBox}    
    });
    setdata([...rtn]);
}, [chkAll,page,chkedSkus]);
//#endregion
 

const SendSMSByHeader = async (smsReqObj) => {

  smsReqObj.sKU= sku === '' ? null : sku;
  smsReqObj.fromDate= fromDate === '' ? null : fromDate;
  smsReqObj.toDate= toDate === '' ? null : toDate;
  smsReqObj.phone= phone === '' ? null : phone;

  let output = await common.apiCall2('POST',`Notify/SendSMSByHeader`, smsReqObj);
  let returnObj;
    if(output.isAxiosError)
    {
      returnObj = output.response.status==403?
                  {message:"No access to send SMS"}
                  :{message:"Something went wrong in api"}
    }
    else{
      returnObj = output.data;
    }
  return returnObj;
}

const chkFormatter = (column, colIndex)=> {
  return (
    <input type="checkbox" style={{ width: '15px', height: '15px' }} checked={chkAll}
      className='m-1' onChange={e => { setchkAll(prev => !prev); setchkSkus([]); }} id='chkAll' ></input>
  );
  }
  const sortFormatter = (column, colIndex)=> {
    if (column.dataField.toUpperCase()===orderBy.toUpperCase() || 
    (column.dataField==='displayDate'&&orderBy==='NotifyDate') ||
    (column.dataField==='smsDate'&&orderBy==='SMSUpdatedDate')){
      return (
        <>
       {column.text} 
       {arrow}
       </>
      );
    }
    else{
      return (
        column.text
       );
    }
    
  }
const columns = [
  /*{ dataField: 'selectItem', text:'',headerFormatter: chkFormatter }, removed check all as soh and status fetching live*/
  { dataField: 'selectItem', text:''},
{ dataField: 'itemNo', text: 'SKU',headerFormatter: sortFormatter  },
{ dataField: 'magentoItemStatus', text: 'Magento Status' },
// { dataField: 'soldOut', text: 'Sold Out' },
{ dataField: 'soh', text: 'Stock',headerFormatter: sortFormatter },
{ dataField: 'smsCount', text: 'Sms Count',headerFormatter: sortFormatter },
{ dataField: 'notifyQty', text: 'Notify Qty',headerFormatter: sortFormatter },
{ dataField: 'displayDate', text: 'Notify Date',headerFormatter: sortFormatter },
{ dataField: 'smsDate', text: 'SMS Date',headerFormatter: sortFormatter }];



const getData = async (currentIndex, sizePerPage, type) => {
  let pageSizeAllowed = PageSizeVals.includes(sizePerPage);
  let size = pageSizeAllowed?sizePerPage:10;
  let notifyReq
   = (type === PaginationTypes.Clear) ? {
    currentIndex: 0, pageSize: size, sKU: null,
    orderByColumn:'id',ascDesc:'desc',
    fromDate: null, toDate: null, phone: null, case: NotifySearchBy.Header
  } : {
    currentIndex: currentIndex, pageSize: size, sKU: sku === '' ? null : sku,
    orderByColumn:orderBy,ascDesc:ascDesc,
    fromDate: fromDate === '' ? null : fromDate, toDate: toDate === '' ? null : toDate,
    phone: phone === '' ? null : phone,
    case: phone === '' ? NotifySearchBy.Header : NotifySearchBy.Phone
  };
  let response = await getNotifyHeadPagination(notifyReq);
  try{
    let resultData = response.result;
    let selectAll = [];
    let dataMapped = resultData.notifyList.map(e => {
      selectAll.push(e.id);
      let ndate = e.notifyDate.substring(0, 10);
      let tempDate = e.smsUpdatedDate.substring(0, 10);
      let smsDate = tempDate==='0001-01-01'?' ':tempDate;
      let chkBox = createCheckBox(e,0);
          return {
        ...e,
        displayDate: ndate,
        selectItem: chkBox,
        smsDate:smsDate
      }
    });
    setdata(dataMapped);
    settotalSize(resultData.totalSize);
  }
  catch(e){
    console.log("Something went wrong with Api",e);
  }
}
const createCheckBox = (e,flag=1)=>
{
  let isdisabled = (!userData.roles.includes(RoleNames.NotifyMeSendSms)|| e.magentoItemStatus === 'Disabled'|| e.soh<=0) ? true : false;
  let viewBtn = <a className="m-1 mr-2" style={{ cursor: 'pointer' }} itemdesc={e.itemDesc} itemurl={e.itemURL} soh={e.soh}
    mstatus={e.magentoItemStatus} soldout={e.soldOut} id={`${e.itemNo}`} onClick={handleViewBtn} >
    <GrView style={{ fontSize: 'medium' }} /></a>;
  let badge;
  if (e.magentoItemStatus === 'Disabled'){
    badge = <Badge className="m-1" color="danger" ><BsFlagFill /></Badge>
  }
  else if(new Date().toISOString().substring(0, 10)===e.smsUpdatedDate.substring(0, 10)){
    badge = <Badge className="m-1" color="success" ><BsFlagFill /></Badge>
  }
  let chkBox = <div style={{display: 'flex',alignItems: 'center'}}><input type="checkbox" style={{ width: '15px', height: '15px' }}
  disabled={isdisabled}  checked = {getChekedValue(chkAll,isdisabled,e.itemNo,flag)} 
  className="m-1 mr-2" name={`${e.itemNo}`} id={`${e.itemNo}`} value={`${e.soh}`} 
  onChange={e=>handleChkChange(e)} ></input>
  {viewBtn} {badge}  
  </div>
  return chkBox;
}

const getChekedValue=(chkAllVal,isDisabledVal,itemNo,flag)=>
{
  if (flag==0){
    return '';
  }
  if (chkAllVal)
  return chkAllVal && !isDisabledVal;
  else
  {
    //let exists = chkedSkus.includes(itemNo);
    let exists = false;
    chkedSkus.forEach(s=>{
        if (s.itemNo ===itemNo)
        exists=true;
      })

   return exists && !isDisabledVal;
  }
}

//#region events
const handleChkChange = e =>{    
  if(chkAll){
    setchkAll(false);
  }
  else
  {

  let id = e.target.id;
  let soh =e.target.value;
  let selected = {"itemNo":id,"soh":soh};
  console.log("selected",selected);
    setchkSkus(state=>{
      let rtn = [...state];
      let exists = false;
      rtn.forEach(s=>{
        if (s.itemNo ===id)
        exists=true;
      })
      if(exists){
        rtn =rtn.filter(ele=>ele.itemNo!==id);
      }
      else {
        rtn =[...rtn,selected];
      }
      return(rtn)
    });
  }
}



const handleViewBtn= e=>{

  setShow(prev=>!prev);
  let detailItem = {
    itemNo : e.currentTarget.id,
    itemDesc : e.currentTarget.getAttribute('itemdesc'),
    itemURL :e.currentTarget.getAttribute('itemurl'),
    soh :e.currentTarget.getAttribute('soh'),
    mstatus : e.currentTarget.getAttribute('mStatus'),
    soldout: e.currentTarget.getAttribute('soldOut')
  }
  setdetailItem(detailItem);
}

const handleTableChange = async (type, { page, sizePerPage }) => {
  if (type === PaginationTypes.Clear || type === PaginationTypes.Search) {
    page = 1
  }
  const currentIndex = (page - 1) * sizePerPage;
  await getData(currentIndex, sizePerPage, type);
  setpage(page);
  setsizePerPage(sizePerPage);
  let arrowObj = (ascDesc==='asc')?<FaArrowUp/>:<FaArrowDown/>
  setarrow(arrowObj);
  
}

const handleClear = async () => {
  setSku('');
  setfromDate('');
  settoDate('');
  setphone('');
  setpage(1);
  setchkAll(false);
  setorderBy('id');
  setascDesc('desc');
  await handleTableChange(PaginationTypes.Clear, { page, sizePerPage });
}

const handleSendSMS = async()=>{
  let checkSkusString = chkedSkus.map (s=>JSON.stringify(s));
  try{
    let response = await SendSMSByHeader({isChkAll:chkAll,skusList:checkSkusString})
    let {message} = response;
    toast.info(`${message}`)
  }
catch(e){
  console.log("e",{...e});
}
}

//#endregion events
  
  return (
    <Page >
      <Modal show={show} onHide={handleClose}>
        <Modal.Header style={{background:'#4682b4'}} closeButton>
         <span style={{color:'white'}}>{`SKU : ${detailItem.itemNo} / SOH : ${detailItem.soh} `}</span> 
        </Modal.Header>
        <Modal.Body>
          <Detailtable itemNo={detailItem.itemNo} itemDesc={detailItem.itemDesc} itemURL={detailItem.itemURL} 
          soh={detailItem.soh} mstatus={detailItem.mstatus} soldout={detailItem.soldout} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Row>
        <Col>
          <Card className="mb-3  mt-2">
            <CardHeader>Notify List</CardHeader>
            <CardBody>
              <Row>
                <Col>
                  {/* <Card body> */}

                    <div className="ml-4">
                      <Row>
                        <Col sm={2}>
                          SKU<br />
                          <Input
                            type="text"
                            name="searchSku"
                            placeholder="Search SKU"
                            value={sku}
                            onChange={e => setSku(e.target.value)}
                          />
                        </Col>
                        <Col sm={2}>
                          From Date<br />
                          <Input
                            type="date"
                            name="FromDate"
                            placeholder="From Date"
                            value={fromDate}
                            onChange={e => setfromDate(e.target.value)}
                          />
                        </Col>
                        <Col sm={2}>
                          To Date<br />
                          <Input
                            type="date"
                            name="ToDate"
                            placeholder="To Date"
                            value={toDate}
                            onChange={e => settoDate(e.target.value)}
                          />
                        </Col>
                        <Col sm={2}>
                          Phone<br />
                          <Input
                            type="text"
                            name="Phone"
                            placeholder="Phone"
                            value={phone}
                            onChange={e => setphone(e.target.value)}
                          />
                        </Col>
                        <Col sm={2}>
                          Sort By<br />
                          <select
                            className="form-control"
                            name="sortBy"
                            value={orderBy}
                            onChange={e=>{setorderBy(e.target.value);setarrow('')}}
                          >
                            <option value="Id">Default</option>
                            <option value="ItemNo">Sku</option>
                            <option value="NotifyDate">NotifyDate</option>
                            <option value="NotifyQty">NotifyQty</option>
                            <option value="SMSUpdatedDate">SMS Date</option>
                            
                          </select>
                        </Col>
                        <Col sm={2}>
                          Asc/Desc<br />
                          <select
                            className="form-control"
                            name="ascDesc"
                            value={ascDesc}
                            onChange={e=>{setascDesc(e.target.value);setarrow('')}}
                          >
                            <option value="asc">asc</option>
                            <option value="desc">desc</option>
                          </select>
                        </Col>
                        </Row>
                        <Row>
                        <Col sm={2}>
                          <Button className="m-1" onClick={e => handleTableChange(PaginationTypes.Search, { page, sizePerPage })}><FaSearch/></Button>
                          <Button className="m-1" onClick={e => handleClear()}><GrPowerReset/></Button>
                        </Col>
                        <Col  sm={{size:'10'}}>
                        <Button className="float-right m-1" disabled ={!userData.roles.includes(RoleNames.NotifyMeSendSms)} onClick={e => handleSendSMS()}>Send SMS</Button>
                        </Col>
                      </Row>

                      <BootstrapTable
                        remote
                        keyField="id"
                        data={data}
                        columns={columns}
                        classes="customTable"
                        pagination={paginationFactory({ showTotal: true, page, sizePerPage, totalSize })}
                        onTableChange={handleTableChange}
                      />

                    </div>
                  {/* </Card> */}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Page>
  );
}
export default NotifyList;
