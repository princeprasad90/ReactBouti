import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect, useRef } from 'react'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { Button, Modal } from 'react-bootstrap';
import { FaCheck, FaEdit, FaBan } from "react-icons/fa";
import { useHistory, Route, withRouter } from "react-router-dom";
import alertify from 'alertifyjs';
import {
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
import {
  searchOrderConfirmAction,
  orderConfirmAction,
  orderCancelAction,
  EditOrderAction,
  GetOrderDetailsBySearch
} from '../../../actions/celebrityActions/OrderConfirmActions';
import { set } from "react-ga";
import { toast } from "react-toastify";
import 'react-confirm-alert/src/react-confirm-alert.css';

const OrderConfirm = () => {
      let history = useHistory();
      //  const [objRequest, setobjRequest] = useState({date1:"", date2:"",celebrityCode:0,agentCode:0, orderStatus:"", orderId:0, magentoUserId:0,sku:0}) 
      const [objRequest, setobjRequest] = useState({})
      const [lstOrderData, setlstOrderData] = useState([])
      const [lstViewData, setlstViewData] = useState([])
      const userData = JSON.parse(localStorage.getItem("userData"));
      const [ShowDetail, setShowDetail] = useState(false);
      const [ShowRoleBase, setShowRoleBase] = useState(false);
      let gridData = useSelector((state) => state.OrderConfirmReducer.dataOrderConfirmGrid);
      //let lstOrderData;
      const dispatch = useDispatch();
      useEffect(() => {

        getAll();
      }, []);
      let data;
      const getAll = async () => {
        if (userData.roleCode == 4) {
          alert(ShowRoleBase)
          setShowRoleBase(true);
        }
        objRequest.magentoUserId = userData.magentoUserId        
        await dispatch(searchOrderConfirmAction(objRequest));
        setlstOrderData([...lstOrderData, gridData]);        
      }
      let ViewData;
      const handleShow = (e) => {

        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        setlstViewData(obj.celeb_OrderDetail);

        setShowDetail(true);
      }
      const handleClose = (e) => {
        setShowDetail(false);
      }
      const handleConfirm = async (e) => {
        if (window.confirm('Are you sure to Confirm.. ?')) {
          objRequest.magentoUserId = userData.userCode

          const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
          objRequest.orderId = obj.orderId;
          let objConfirm = ({ orderId: obj.orderId, userCode: userData.userCode });
          if (obj.celeb_OrderDetail.orderId == "") {
            toast.info("Invalid order id")
            return;
          }
           await dispatch(orderConfirmAction(objConfirm)) ; 
        }
        else {
          setobjRequest({ orderId: 0, magentoUserId: 0 })
        }
      }
      const handleCancel = async (e) => {
          if (window.confirm('Are you sure to cancel.. ?')) {

          objRequest.magentoUserId = userData.userCode
          const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
          objRequest.orderId = obj.orderId;
          let objCancel = ({ orderId: obj.orderId, userCode: userData.userCode });
          if (obj.celeb_OrderDetail.orderId == "") {
          toast.info("Invalid order id")
          return;
          } 
           await dispatch(orderCancelAction(objCancel) );  
       //   lstOrderData = gridData.filter(data => data.orderId != objRequest.orderId);
           lstOrderData = data; 
          }
          else {
          setobjRequest({ orderId: 0, magentoUserId: 0 })
          }
      }
    const handleEdit = async (e) => { 
         
          const obj = JSON.parse(e.currentTarget.getAttribute('data-item')); 
          if (obj==null) {
            toast.info("Invalid order data")
            return;
          }
         await dispatch(EditOrderAction(obj)) ; 
          history.push('/editorder');
  }
  const Search=async(e)=>{
   lstOrderData = gridData.filter(data => data.orderId == objRequest.OrderId);
   let searchRequest = {};
   searchRequest.ItemNo = objRequest.Sku;
   searchRequest.OrderId = objRequest.OrderId;       
   let SearchResponse = await dispatch(GetOrderDetailsBySearch(searchRequest));

   //lstOrderData.push(SearchResponse);
    //setlstOrderData[setlstOrderData];
     setlstOrderData([lstOrderData]);
    // let newArr=[];
    // const isExist = lstOrderData.some(el => (el.orderId == objRequest.OrderId) );
    // if (isExist==true)
    // {      
    //   let newArr=[];
    //   for (var i = 0; i < lstOrderData.length; i++) {       
    //      if (lstOrderData[i].orderId===objRequest.OrderId){        
    //        newArr.push(lstOrderData[i]);
    //      }
    //   }
    //   lstOrderData=[];
    //   lstOrderData.push(newArr);
    //   //setlstViewData(newArr);

    // }

    
  }
  const Reset=()=>{    
    setobjRequest({});
  }
//   lstOrderData = gridData.filter(data => data.orderId != objRequest.orderId);
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
                </tr>
              </thead>
              <tbody>
                {
                  lstViewData && lstViewData.map((obj, index) => {

                    const { orderId, itemNo, itemDesc, qty, givenBeforeQty, exclusiveFor } = obj;

                    return (
                      <tr key={index}>
                        <td>{orderId}</td>
                        <td>{itemNo}</td>
                        <td>{itemDesc}</td>
                        <td>{qty}</td>
                        <td>{givenBeforeQty}</td>
                        <td>{exclusiveFor}</td>
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
            <CardHeader>Order Search</CardHeader>
            <CardBody>
              <div className="row" style={{ fontSize: "0.8rem" }}>
                <div className="BoxLayout colShadow" >
                  <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">SKU</Label>
                    <Input
                      type="text"
                      name="Sku"
                      id="Sku"
                      placeholder="Enter SKU"
                      value={objRequest.Sku || ''}
                      onChange={e => setobjRequest({ ...objRequest, Sku: e.target.value })}
                      style={{ fontSize: "0.8rem" }}
                    />
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">Order No</Label>
                    <Input
                      type="text"
                      name="OrderId"
                      id="OrderId"
                      placeholder="Enter OrderNo"
                      value={objRequest.OrderId || ''}
                      onChange={e => setobjRequest({ ...objRequest, OrderId:+e.target.value })}
                      style={{ fontSize: "0.8rem" }}
                    />
                  </FormGroup>
                </div>
                <div className="BoxLayout colShadow" >
                  <FormGroup className="InnerBoxLayout">
                    <Button className="btn btn-success" style={{ fontSize: "0.8rem", width: "90%", marginLeft: "5%", marginTop: "5%" }} onClick={Search}  >Search</Button>
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout" style={{ marginTop: "40px" }}>
                    <Button className="btn btn-primary" style={{ fontSize: "0.8rem", width: "90%", marginLeft: "5%" }} onClick={Reset} >
                      <i className="glyphicon glyphicon-check">Reset</i></Button>
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
              <div style={{ textAlign: "right", fontSize: "10px" }}> <ReactHTMLTableToExcel color="primary"
                fontSize="10px"
                table="myorders"
                filename="myorders"
                sheet="Sheet"
                width="100px"
                buttonText="Export" />
              </div>
              <Table className="customTable" id="myorders">
                <thead>
                  <tr>
                    <th scope="col">OrderId</th>
                    <th scope="col">CreatedDate</th>
                    <th scope="col">Celebrity</th>
                    <th scope="col">Country</th>
                    <th scope="col">Notes</th>
                    <th scope="col">Coordinator</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {
                     lstOrderData.map(obj => {

                      const { orderId, orderDate, celebName, countryCode, notes, createdBy, orderStatus } = obj;
                      return (
                        <tr key={orderId}>
                          <td scope="row">
                            <a className="btn btn-outline-dark  btn-sm" data-item={JSON.stringify(obj)} onClick={handleShow} >{orderId}</a>
                          </td>

                          <td>{orderDate}</td>
                          <td>{celebName}</td>
                          <td>{countryCode}</td>
                          <td>{notes}</td>
                          <td>{createdBy}</td>
                          <td>{orderStatus}</td>
                          <td>
                            <a className="btn btn-danger btn-sm" data-item={JSON.stringify(obj)} onClick={handleConfirm}   ><FaCheck /></a>
                            <a className="btn btn-danger btn-sm" data-item={JSON.stringify(obj)} onClick={handleCancel} style={{ marginLeft: "10px" }} ><FaBan /></a>
                            <a className="btn btn-danger btn-sm" data-item={JSON.stringify(obj)} onClick={handleEdit} style={{ marginLeft: "10px" }} ><FaEdit /></a>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row> 
    </Page>
  );

}
export default OrderConfirm;