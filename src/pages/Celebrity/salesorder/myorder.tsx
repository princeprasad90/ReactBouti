import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect, useRef } from 'react'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  FormText,
  Input,
  Label,
  Row,
  Table,
   
} from 'reactstrap';
import Page from 'components/Page';
//import '../../../styles/components/_table.scss';
import {
  listMappedCelebrityAction
} from '../../../actions/celebrityActions/CelebrityActions';
import {
  searchMyOrderAction,

} from '../../../actions/celebrityActions/MyOrdersActions';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';


  const MyOrder = () => { 
  const [objRequest, setobjRequest] = useState({FromDate:moment().subtract(3,'d').format('YYYY-MM-DD'),ToDate:moment(new Date()).format('YYYY-MM-DD'),CelebrityCode:0,agentCode:0,orderStatus:"",orderId:0,isSync:0}) 
  const [objCeleb, setobjCeleb] = useState({}) 
  const orderData = useSelector((state) => state.MyOrdersReducer.dataGrid);
  const ddlCeleb = useSelector((state) => state.CelebrityReducer.listCelebrity);
  const userData =  JSON.parse(localStorage.getItem("userData")) ;
  const [ShowDetail, setShowDetail] = useState(false);
  const [lstViewData, setlstViewData] = useState([]);
  const [orderDataTable, setorderDataTable] = useState([])
  const dispatch = useDispatch();
  useEffect(() => {
    const myAbortController = new AbortController();
    let signal = {signal:myAbortController.signal};

      getAll(signal);
      
    return () => {
      myAbortController.abort();
    }
  }, []);

 useEffect(() => {
   let listforTable = [];
    orderData.forEach(obj=>{
     let temp = {...obj};
     temp.orderIdLink = <a className="btn btn-outline-dark  btn-sm" data-item={JSON.stringify(obj)} onClick={handleShow} >{obj.orderId}</a>;
     temp.createdDate = moment(obj.orderDate).format('YYYY-MM-DD hh:mm:ss');
     listforTable.push(temp);

   });
   setorderDataTable([...listforTable]);
 }, [orderData])
  const getAll = async (signal) => {  
    objCeleb.userid = userData.magentoUserId; 
     await dispatch(listMappedCelebrityAction(objCeleb,signal)); 
     await handleSearch(signal);
  }
  const handleSearch = async (signal) => {  
    objRequest.UserCode = userData.magentoUserId;
    await dispatch(searchMyOrderAction(objRequest,signal));
  }
  const handleShow = (e) => {

    const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
    setlstViewData(obj.celeb_OrderDetail);

    setShowDetail(true);
  }
  const handleClose = (e) => {
    setShowDetail(false);
  }
  const handleReset = async () => {   
    window.location.reload(false);

  }
  const backGroundSilver = {background:'silver'}
  const rowStyles = (row, rowIndex) => {
    let style = {};

    if (row.orderStatus=== "Received" ) {
      style = {...backGroundSilver};
    }
    return style;
  };

const ordColumns = [{
  dataField: 'orderIdLink',
  text: 'OrderId'
},

  {
  dataField: 'webOrderNo',
  text: 'AppOrderNo'
},
{
  dataField: 'createdDate',
  text: 'CreatedDate'
},

  {
  dataField: 'celebName',
  text: 'Celebrity'
},
{
  dataField: 'countryCode',
  text: 'Country'
}
  ,{
  dataField: 'createdUser',
  text: 'Coordinator'
},
  {
  dataField: 'orderStatus',
  text: 'Status'
}
];
  return (
    // <div>
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

                    const { orderId, itemNo, itemDesc, qty, givenBeforeQty, exclusiveFor,remarks } = obj;

                    return (
                      <tr key={index}  style={remarks==='Deleted'? backGroundSilver:{}}  >
                        <td >{orderId}</td>
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
          <Card className="mb-3">
            <CardHeader>My Orders</CardHeader>
            <CardBody>
            <div className="row" style={{fontSize:"0.8rem"}}>
            <div className="col-md-3 colShadow" >  
              <FormGroup>
                <Label for="Date1">From Date</Label>
                <Input
                  type="date"
                  name="Date1"
                  id="Date1"
                  placeholder="From date"
                  defaultValue={moment().subtract(3,'d').format('YYYY-MM-DD') || objRequest.FromDate }                  
                  onChange={e => setobjRequest({ ...objRequest, FromDate: e.target.value })}
                  style={{fontSize:"0.8rem"}}
                />
              </FormGroup>
              <FormGroup>
                <Label for="exampleTime">To Date</Label>
                <Input
                  type="date"
                  name="Date2"
                  id="Date2"
                  placeholder="To date"                  
                  defaultValue={moment(new Date()).format('YYYY-MM-DD') || objRequest.ToDate}
                  onChange={e => setobjRequest({ ...objRequest, ToDate: e.target.value })}
                  style={{fontSize:"0.8rem"}}
                />
              </FormGroup>
              </div>
            <div className="col-md-3 colShadow" >
              <FormGroup>
                <Label for="exampleSelect">Celebrity</Label>
                <select
                  className="form-control"
                  name="drpDriver"
                  value={objRequest.CelebrityCode || 0}
                  onChange={(e) =>
                    setobjRequest({ ...objRequest, CelebrityCode: +e.target.value }
                    )
                  }
                  style={{fontSize:"0.8rem"}}>
                  <option value="">-- Select --</option>
                  {ddlCeleb &&
                    ddlCeleb.map((data) => {
                      const { celebrityCode, name_EN } = data;
                      return (
                        <option key={celebrityCode} value={celebrityCode}>
                          {name_EN}
                        </option>
                      );
                    })}
                </select>
              </FormGroup>  
              <FormGroup check row style={{marginTop:"40px"}}> 
                 <Button className="btn btn-success" onClick={handleSearch} style={{fontSize:"0.8rem"}}  >Search</Button> 
                 <Button className="btn btn-primary" onClick={handleReset} style={{fontSize:"0.8rem", marginLeft:"5%"}}  >Reset</Button>  
              </FormGroup>              
              </div> 
            </div>
            </CardBody>
          </Card>
        </Col> 
      </Row> 
      <Row>
       
        <Col>
          <Card className="mb-3"> 
            <CardBody>
           
            <div style={{textAlign:"right", fontSize:"10px"}}> <ReactHTMLTableToExcel color="primary" 
                                fontSize="10px"
                                table="myorders"
                                filename="myorders"
                                sheet="Sheet"  
                                width="100px"
                                buttonText="Export" /></div>               
         <BootstrapTable  id="myorders"  bootstrap4 keyField='orderId' classes="customTable"
         data={ orderDataTable } columns={ ordColumns } rowStyle={rowStyles} pagination={ paginationFactory() } />
            </CardBody>
          </Card>
        </Col>
      </Row>
    {/* </div> */}
    </Page>
  );

};
export default MyOrder;
