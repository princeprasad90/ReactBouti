import React,{useEffect,useState} from 'react';
import PropTypes from 'utils/propTypes';
import {Col,  Row,Form ,Button,Card,CardBody,CardText,Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {  toast } from 'react-toastify';
import * as common from '../../network/index';
import {RoleNames} from 'utils/roleNames'

export function Detailtable({itemNo,itemDesc,itemURL,soh,mstatus,soldout}) {
  const [page, setpage] = useState(1);
  const [data, setdata] = useState([]);
  const [sizePerPage, setsizePerPage] = useState(10);
  const [totalSize, settotalSize] = useState(0);
  const [country, setcountry] = useState("-1");
  const [selectedIds, setselectedIds] = useState([]);
  const [smsCount, setsmsCount] = useState();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [isDisabled, setisDisabled] = useState((!userData.roles.includes(RoleNames.NotifyMeSendSms)||mstatus === 'Disabled'||soh<=0) ? true : false);


  const columns = [
        { dataField: 'chkBox', text: '' },
        { dataField: 'mobileNo', text: 'MobileNo' },
        { dataField: 'countryCode', text: 'Country' },
        { dataField: 'ndate', text: 'NotifyDate' }];


//#region useEffect

  useEffect(() => {
    getDetailData(0,10);
  }, []);

 useEffect(() => {
     handleTableChange('Country', { page, sizePerPage }) ;
 }, [country]);

 useEffect(() => {
  let newData = data.map(obj =>{
      let exists =  selectedIds.includes(String(obj.id));
      let chkBox;
      if (exists)
      {
        chkBox = <input type="checkbox" style={{ width: '15px', height: '15px' }}
        disabled={isDisabled}
        checked ={true}   className="m-1 mr-2" name={obj.id} id={obj.id} value={obj.id} 
        onChange={e=>handleChkChange(e)} ></input>
       }
       else
       {
         chkBox = <input type="checkbox" style={{ width: '15px', height: '15px' }}
         disabled={isDisabled}
         checked ={''}   className="m-1 mr-2" name={obj.id} id={obj.id} value={obj.id} 
         onChange={e=>handleChkChange(e)} ></input>
       }
       return {...obj,chkBox:chkBox}
   });
 setdata(newData);
 }, [selectedIds,page])

//#endregion
  const getDetailData = async (currentIndex, sizePerPage)=>{
    let notifyReqObj =  {
      currentIndex: currentIndex, pageSize: sizePerPage, 
      sKU: itemNo,country:(country==="-1")?null:country
    } 
    let response = await GetNotifyDetailPagination(notifyReqObj);
    let detailList = response.result.detailList;
    let mappedData = [];
    if(detailList.length>0){

      mappedData = detailList.map(obj => {
        let chkBox = <input type="checkbox" style={{ width: '15px', height: '15px' }}
        disabled={isDisabled}
          checked={''} className="m-1 mr-2" name={obj.id} id={obj.id} value={obj.id}
          onChange={e => handleChkChange(e)} ></input>
        return ({ ...obj, ndate: obj.notifyDate.substring(0, 10), chkBox: chkBox });
      });
    }
    setdata(mappedData);
    settotalSize(response.result.totalSize);
  };
  
  const handleTableChange = async (type, { page, sizePerPage }) => {
    const currentIndex = (page - 1) * sizePerPage;
    await getDetailData(currentIndex, sizePerPage);
    setpage(page);
    setsizePerPage(sizePerPage);
  } 

const handlecountryChange=async (e)=>{
    setcountry(e.target.value); 
    setpage(1);
    setsizePerPage(10);
}


const handleChkChange = e =>{    
  let selected = e.target.value;
    setselectedIds(state=>{
      let rtn = [...state];
      let exists= rtn.includes(selected);
      if(exists){
        rtn =rtn.filter(ele=>ele!==selected);
        
      }
      else {
        rtn =[...rtn,selected];
      }
      return(rtn)
    });
}

const handleSMSCount = (e)=>{
  let num = +e.target.value;
  if(Number.isNaN(num)||(num>999))
  setsmsCount(0); 
  else 
  {
   setsmsCount(num)
  }
 
}

const handleSendSMS = async(e)=>{
  let smsReqObj ={
    selectedIds:[...selectedIds],
    sMSCount:smsCount===''?0:smsCount,
    country:country=='-1'?null:country,
    soh:parseInt(soh),
    sku:itemNo
  }
try{
  let response = await SendSMSByDetail(smsReqObj);
  let {message} = response;
  toast.info(` ${message}`)
}
catch(e){
  console.log("e",e);
}
}

  //#region api calls
  const GetNotifyDetailPagination = async (notifyReqObj) => {
    let output = await common.apiCall2('POST', `Notify/GetNotifyDetailPagination`, notifyReqObj)
    return output.data;
  }

  const handleExport = async () => {
    let accessToken = JSON.parse(common.getCookie('accessToken'));
    let response = await fetch(`${common.BASE_URL}Notify/GetNotifyDetailCSV`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.accessToken}`
      },
      body: JSON.stringify({
        "sku": itemNo,
        "country": (country === "-1") ? null : country
      })
    });
    let blob = await response.blob();
    let blobUrl = window.URL.createObjectURL(blob);
    let tempLink = document.createElement('a');
    tempLink.href = blobUrl;
    tempLink.setAttribute('download', `${itemNo}_${new Date().getTime()}.csv`);
    tempLink.click();
  }

  const SendSMSByDetail = async (smsReqObj) => {
    let output = await common.apiCall2('POST', `Notify/SendSMSByDetail`, smsReqObj);
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
    console.log("output",{...output});
    getDetailData(0, 10);
    return returnObj;
  }
//#endregion
    return (
        <Form>
        <Row>
          <Col sm={8}>
            <Card>
              <CardBody>
                <CardText > {` بناء على طلبكم نفيدكم علما  أن المنتج  :   ${itemDesc}  أصبح متوفر الان فى بوتيكات ويمكن شراءة عبر الرابط`}
                  <br/>
                  <a href={itemURL}>{itemURL}</a>                 
                </CardText>
              </CardBody>
            </Card>
          </Col>
          <Col sm={2}>
            <Input className="float-right"
              type="text"  pattern="[0-9]*"
              name="smsCount"   placeholder="Count" disabled={isDisabled}
              value ={smsCount} onChange ={e=>handleSMSCount(e)}
            />
            </Col>
             <Col sm={2} className="d-flex flex-column"> 
            <Button disabled={isDisabled} onClick={e => handleSendSMS(e)}>SendSMS</Button>
            <Button className=" mt-3"   onClick={e => handleExport()}>Export</Button>
          </Col>

        </Row>
          <hr/>
            <Row>
                <Col sm={4}>
                    <select
                        className="form-control m-3"
                        name="country"
                        value={country}
                        onChange={handlecountryChange}>
                        <option value="-1">Select Country</option>   
                        <option value="KW">Kuwait</option>
                        <option value="QA">Qatar</option>
                        <option value="AE">UAE</option>
                        <option value="SA">Saudi</option>
                        <option value="BH">Bahrain</option>
                        <option value="OM">Oman</option>
                        <option value="IQ">Iraq</option>
                    </select>
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
        </Form>
    )
}
Detailtable.propTypes = {
    itemNo:PropTypes.string,
    itemDesc:PropTypes.string,
    itemURL:PropTypes.string,
    soh:PropTypes.string,
    mstatus:PropTypes.string,
    soldout:PropTypes.string
   };
  
  Detailtable.defaultProps = {
      itemNo:'SC-00002578',
      itemDesc:'Default desc',
      itemURL:'Default URL',
      soh:'0',
      mstatus:'',
      soldout:'s'
  };
  