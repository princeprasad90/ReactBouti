import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect, useRef } from 'react'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import {  Modal } from 'react-bootstrap';
import { FaCheck, FaEdit, FaBan } from "react-icons/fa";
import { useHistory} from "react-router-dom";
import moment from 'moment';
import {  Card,  CardBody,  CardHeader,  Col,FormGroup,Input,
  Button,     Label,  Row,  Table,
} from 'reactstrap';
import Page from 'components/Page';
import {    GetOrdersForConfirmation,    orderConfirmAction,
    orderCancelAction,    EditOrderAction,
} from 'actions/celebrityActions/OrderApprovalActions';
import {AccessButtons,checkAccessControl} from 'actions/celebrityActions/celebAccessControl';
import {RoleNames} from 'utils/roleNames'
import { toast } from "react-toastify";
import 'react-confirm-alert/src/react-confirm-alert.css';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import * as common from 'network/index';
const OrderApproval = () => {
      let history = useHistory();
      
      const [objRequest, setobjRequest] = useState({})
      const [lstOrderData, setlstOrderData] = useState([]);
      const [lstOrderTableData, setlstOrderTableData] = useState([])
      const [lstViewData, setlstViewData] = useState([])
      const userData = JSON.parse(localStorage.getItem("userData"));
      const [ShowDetail, setShowDetail] = useState(false);
      const [isApproveAllowed, setIsApproveAllowed] = useState(false);
      const [isCancelAllowed, setIsCancelAllowed] = useState(false);
      const [isEditAllowed, setIsEditAllowed] = useState(false);
      const dispatch = useDispatch();
  useEffect(() => {
    getAll();
  }, []);
      const getAll = async () => {
        objRequest.magentoUserId = userData.magentoUserId;
        let isApproveAllowedTemp = checkAccessControl(AccessButtons.ApproveOrder,true);
        setIsApproveAllowed(isApproveAllowedTemp); 
        let isCancelAllowedTemp = checkAccessControl(AccessButtons.CancelOrder,true);
        setIsCancelAllowed(isCancelAllowedTemp); 
        let isEditAllowedTemp = checkAccessControl(AccessButtons.EditOrder,true);
        setIsEditAllowed(isEditAllowedTemp);        
        let OrderForConfirmationResponse = await dispatch(GetOrdersForConfirmation(objRequest));      
        setlstOrderData(OrderForConfirmationResponse?OrderForConfirmationResponse.result:{} );       
      }

      useEffect(() => {
        let listforTable = [];
        lstOrderData.forEach(obj=>{
          let temp = {...obj};
          temp.orderIdLink =  <a style={{cursor:'pointer',color:'blue'}}  data-item={JSON.stringify(obj)} onClick={handleShow} >{obj.orderId}</a>;
          temp.createdDate = moment(obj.orderDate).format('YYYY-MM-DD hh:mm:ss');
          temp.action = <>
            {isApproveAllowed && <a style={{cursor:'pointer',color:'green'}} className=" m-1" data-item={JSON.stringify(obj)} onClick={handleConfirm}   ><FaCheck  /></a> }
            {isCancelAllowed && <a style={{cursor:'pointer',color:'red'}} className=" m-1" data-item={JSON.stringify(obj)} onClick={handleCancel} ><FaBan /></a> }
            {isEditAllowed && <a style={{cursor:'pointer',color:'blue'}} className=" m-1 " data-item={JSON.stringify(obj)} onClick={handleEdit} ><FaEdit /></a> }
          </>;
          listforTable.push(temp);
     
        });
        setlstOrderTableData([...listforTable]);
      }, [lstOrderData]);
      const handleShow = async (e) => {

        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        let request = {orderId:obj.orderId}
        let output = await common.apiCall2('POST',`OrderSearch/GetOrderDetailByOrderId`, request)
        setlstViewData(output.data.result);
        setShowDetail(true);
      }
      const handleClose = (e) => {
        setShowDetail(false);
      }
      const handleConfirm = async (e) => {
            
          if (window.confirm('Are you sure to Confirm.. ?')) {
            objRequest.magentoUserId = userData.userCode
  
            const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
            let objConfirm = { orderId: obj.orderId, userCode: userData.magentoUserId };
             await dispatch(orderConfirmAction(objConfirm)) ; 
          }
          else {
            setobjRequest({ orderId: 0, magentoUserId: 0 })
          }
          Reset();       
      }
      const handleCancel = async (e) => {
        if (userData.roleCode !=4)
           if (window.confirm('Are you sure to cancel.. ?')) {

          const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
          let objCancel = { orderId: obj.orderId, userCode: userData.magentoUserId };
           await dispatch(orderCancelAction(objCancel) ); 
          }
          else {
          setobjRequest({ orderId: 0, magentoUserId: 0 })
          }
          Reset();
        
         
      }
    const handleEdit = async (e) => { 
         
          const obj = JSON.parse(e.currentTarget.getAttribute('data-item')); 
          let request = {orderId:obj.orderId}
          let output = await common.apiCall2('POST',`OrderSearch/GetOrderDetailByOrderId`, request)
          obj.celeb_OrderDetail=output.data.result;
          if (obj==null) {
            toast.info("Invalid order data")
            return;
          }
          await dispatch(EditOrderAction(obj)) ; 
           history.push('/editorder');
  }
  const Search=async(e)=>{
       
          let filterRecrord=[];
          if (objRequest.Sku!=undefined)
          {
            for (const item of lstOrderData) {
              for  (const childItem of item.celeb_OrderDetail)
              {
                if (childItem.itemNo==objRequest.Sku){
                  filterRecrord.push(item);
                }
              }       
            }            
            setlstOrderData(filterRecrord);
          }
          else if (objRequest.OrderId!=undefined)
          {      
               filterRecrord=lstOrderData.filter(data => data.orderId == objRequest.OrderId);
               setlstOrderData(filterRecrord);
          }
  }
  const Reset=async(e)=>{    
    setobjRequest({});   
    let userRequest={};
    userRequest.magentoUserId = userData.magentoUserId  ; 
    let OrderForConfirmationResponse = await dispatch(GetOrdersForConfirmation(userRequest));      
    setlstOrderData(OrderForConfirmationResponse.result ); 
  }
  const handleNewOrder = async (e) => { 
    history.push('/createorder');
}
const handleMyOrder = async (e) => { 
  history.push('/myorder');
}
const styleDeleted = {background:'silver'}
  const ordColumns = [{ dataField: 'orderIdLink', text: 'OrderId' },
  { dataField: 'createdDate', text: 'CreatedDate' },
  { dataField: 'celebName', text: 'Celebrity' },
  { dataField: 'countryCode', text: 'Country' },
  { dataField: 'notes', text: 'Notes' },
  { dataField: 'createdUser', text: 'Coordinator' },
  { dataField: 'orderStatus', text: 'Status' },
  { dataField: 'action', text: 'Action' }
  ];


  return (
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
                      <tr key={index} style={remarks==='Deleted'? styleDeleted:{}}>
                        <td>{orderId}</td>
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
          <Card className="mb-12">
            <CardHeader>Order Approval</CardHeader>
            <CardBody>
              <div className="row" style={{ fontSize: "0.8rem" }}>
                <div className=" col-sm-5  colShadow " >
                  <Row>
                    <Col>
                      <FormGroup className=" InnerBoxLayout">
                        <Label for="exampleTime">Order No</Label>
                        <Input
                          type="text"
                          name="OrderId"
                          id="OrderId"
                          placeholder="Enter OrderNo"
                          value={objRequest.OrderId || ''}
                          onChange={e => setobjRequest({ ...objRequest, OrderId: +e.target.value })}
                          style={{ fontSize: "0.8rem" }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
                <div className=" col-sm-6 colShadow" >
                  <Row >
                    <Col sm={4} >
                      <FormGroup >
                        <Button color="link" className="mt-3" onClick={Search}  >
                          Search
                    </Button>
                      </FormGroup>
                    </Col>
                    <Col sm={4} >
                      <FormGroup >
                        <Button color="link" className="mt-3" onClick={Reset} >
                          Reset</Button>
                      </FormGroup>
                    </Col>

                    <Col sm={4} >
                      <FormGroup >
                        <Button color="link" className="mt-3" onClick={handleNewOrder}  >
                          New Order
                    </Button>
                      </FormGroup>
                    </Col>
                   </Row>
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
              <BootstrapTable id="myorders" bootstrap4 keyField='orderId' classes="customTable"
                data={lstOrderTableData} columns={ordColumns} pagination={paginationFactory()} />
            </CardBody>
          </Card>
        </Col>
      </Row> 
    </Page>
  );

}
export default OrderApproval;