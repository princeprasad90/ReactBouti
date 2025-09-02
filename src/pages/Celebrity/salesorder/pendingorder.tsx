import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect, useRef } from 'react'
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import moment from 'moment';
import { Modal } from 'react-bootstrap';
import { toast } from "react-toastify";
import {
    searchPendingOrderAction, DeleteSkuAction
  } from '../../../actions/celebrityActions/PendingOrderActions';
  import BootstrapTable from 'react-bootstrap-table-next';
  import paginationFactory from 'react-bootstrap-table2-paginator';
  import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
  import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// /import "./Table.css";
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
  import { FaTrash} from "react-icons/fa";
  import Page from 'components/Page';
  import {
     GetProductInfoSearchPlus,RepushOrder,CancelOrder
  } from '../../../actions/celebrityActions/OrderCreationAction';

const PendingOrder = () => { 
    const [getInitial, setgetInitial]=useState({})
    const orderData = useSelector((state) => state.PendingOrderReducer.dataPendingGrid);
    const [orderTableData, setorderTableData] = useState([]);
    const [objRequest, setobjRequest] = useState({}) 
    const [lstOrderData, setlstOrderData] = useState([])
      const [lstViewData, setlstViewData] = useState([])
      const userData = JSON.parse(localStorage.getItem("userData"));
      const [ShowDetail, setShowDetail] = useState(false);
      const { SearchBar } = Search;
    const [objTable, setobjTable] = useState({
        active: null,
        date: null,
        celebrity: null,
        country: null,
        reason: null,
        vieworder: null,
        orderData: orderData,
        originalorderData: orderData, 
        celebrity: "",
        country: "",
        reason: "",
        vieworder: "", 
        currentPage: 1,
        todosPerPage: 5,
        totalLength: orderData.length,
        indexOfFirstTodo: null,
        indexOfLastTodo: null,
        isLast: false,
        isFirst: false,
        searchString: ""
      });
    const dispatch = useDispatch();
    useEffect(() => {
    getAll();
    }, []);

    useEffect(() => {
      let listforTable = [];
       orderData.forEach(obj=>{
        let temp = {...obj};
        temp.orderIdLink = <a className="btn btn-outline-dark  btn-sm" data-item={JSON.stringify(obj)} onClick={handleShow} >{obj.orderId}</a>;
        temp.createdDate = moment(obj.orderDate).format('YYYY-MM-DD hh:mm:ss');
        listforTable.push(temp);
   
      });
      setorderTableData([...listforTable]);
    }, [orderData])
  
      const getAll = async () => {  
        objRequest.UserCode = userData.magentoUserId;
         await dispatch(searchPendingOrderAction(objRequest)); 
      }
      const handleShow =async (e) => {

        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        objRequest.OrderNo=obj.orderId;
        const ArrPendingItems = [];
        for (var i = 0; i < obj.celeb_OrderDetail.length; i++) {
          let searchplusRequest = {};
          searchplusRequest.skuCode = obj.celeb_OrderDetail[i].itemNo;
          searchplusRequest.parentSku = "";
          searchplusRequest.countryCode = "kw_en";
          searchplusRequest.columns = "";
          let searchplusResponse = await dispatch(GetProductInfoSearchPlus(searchplusRequest));         
          ArrPendingItems.push({'itemNo':obj.celeb_OrderDetail[i].itemNo,
          'description':obj.celeb_OrderDetail[i].itemDesc,
          'qty':obj.celeb_OrderDetail[i].qty,
          'remarks':obj.celeb_OrderDetail[i].remarks,
          'id':obj.celeb_OrderDetail[i].id,
          'orderId':obj.celeb_OrderDetail[i].orderId,
          'LiveStock':searchplusResponse[0].actual_available_qty,
          'ForceSoldOut':searchplusResponse[0].is_saleable=='0'&& parseInt(searchplusResponse[0].actual_available_qty) >0 ?'Yes':'No'})
        }
        setlstViewData(ArrPendingItems);        
        setShowDetail(true);
      }
      useEffect(() => {
        // when user deletes an item, to get modal refreshing 
        if(lstViewData.length>0){
          let templstViewData = [...lstViewData];
          if (orderData.length>0)
          {
            let {celeb_OrderDetail} = orderData.find(element=>element.orderId===lstViewData[0].orderId);
            templstViewData = templstViewData.map((element) => {
              let obj = { ...element };
              let celebObj = celeb_OrderDetail.find(element => element.id === obj.id);
              obj.remarks = celebObj.remarks;
              return obj;
            });
            setlstViewData(templstViewData);
          }
         
        }
      }, [orderData])
      const handleClose = (e) => {
        setShowDetail(false);
      }
      const handleRepush = async(e) => {
        let RepushReq = {};      
        RepushReq.OrderId = objRequest.OrderNo;       
        try {
          let arr = await dispatch(RepushOrder(RepushReq));
          toast.success("Celebrity OrderNo -" + objRequest.OrderNo + " Repushed Successfully");
          setobjRequest({});     
          setlstViewData([]);    
          setShowDetail(false);
          getAll();
        }
        catch {
          toast.error("Something Went Wrong Please try again Later");
        }
      }

      const handleCancel = async(e) => {
        let cancelReq = {};      
        cancelReq.OrderId = objRequest.OrderNo;       
        try {
          let arr = await dispatch(CancelOrder(cancelReq));
          toast.success("Celebrity OrderNo -" + objRequest.OrderNo + " Cancelled Successfully");
          setobjRequest({});   
          setlstViewData([]);    
          setShowDetail(false);      
          getAll();
        }
        catch {
          toast.error("Something Went Wrong Please try again Later");
        }
        setShowDetail(false);
      }

      const handleDelete = async(e)=>{
        const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
        await dispatch(DeleteSkuAction({Id:obj.id},orderData));
      }
      const styleDeleted = {background:'silver'};
      const styleSoldOut = {background:'red'};
  const ordColumns = [{ dataField: 'orderIdLink', text: 'OrderId',headerAlign: 'center' },
                      { dataField: 'orderId', text: 'OrderId',hidden:true },
                      { dataField: 'createdDate', text: 'CreatedDate',headerAlign: 'center' },
                      { dataField: 'celebName', text: 'Celebrity',headerAlign: 'center' },
                      { dataField: 'countryCode', text: 'Country',headerAlign: 'center'},
                      { dataField: 'createdUser', text: 'Coordinator',headerAlign: 'center' },
                      { dataField: 'orderStatus', text: 'Status',headerAlign: 'center' },
                      { dataField: 'response', text: 'Reason',headerAlign:'center'}
  ];
  const rowStyle = { textAlign: 'center' };
      return(
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
                
                  <th scope="col">ItemNo</th>
                  <th scope="col">Description</th>
                  <th scope="col">Qty</th>
                  <th scope="col">LiveStock</th> 
                  <th scope="col">ForceSoldOut</th> 
                  <th scope="col">Remarks</th>       
                  <th scope="col">Action</th>               
                </tr>
              </thead>
              <tbody>
                {
                  lstViewData && lstViewData.map((obj, index) => {

                    const { itemNo, description, qty, LiveStock,ForceSoldOut,remarks,id } = obj;
                    return (
                      <tr key={index} style={remarks==='Deleted'? styleDeleted:{}}>                       
                        <td>{itemNo}</td>
                        <td>{description}</td>
                        <td>{qty}</td>
                        <td>{LiveStock}</td> 
                        <td style={ForceSoldOut==='Yes'?styleSoldOut:{}}>{ForceSoldOut}</td> 
                        <td>{remarks}</td>  
                        <td><Button outline color="danger" className="m-1"
                         disabled={(remarks==='Deleted')? true:false}
                         data-item={JSON.stringify(obj)}
                          onClick={handleDelete}   ><FaTrash /></Button>
                        </td>                    
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
          </Modal.Body>
              <Modal.Footer>
                <Button color="info" onClick={handleRepush}>Repush</Button>
                <Button color="warning"  onClick={handleCancel}>Cancel</Button>
                <Button color="secondary" onClick={handleClose}>Close</Button>
                
              </Modal.Footer>
        </Modal>
      </div>
          <Row >
            <Col>
              <Card className="mb-3">
                <CardHeader>Pending Orders</CardHeader>
                <CardBody> 
            {/* <div style={{textAlign:"right", fontSize:"10px"}}> <ReactHTMLTableToExcel color="primary" 
                                fontSize="10px"
                                table="pendingorders"
                                filename="pendingorders"
                                sheet="Sheet"  
                                width="100px"
                                buttonText="Export" /></div>               
          <BootstrapTable  id="myorders"  bootstrap4 keyField='orderId' classes="customTable"
         data={ orderTableData } columns={ ordColumns } pagination={ paginationFactory() } /> */}
         <ToolkitProvider
  keyField="orderId"
  data={ orderTableData }
  columns={ ordColumns }
  search
>
  {
    props => (
      <div>        
        <SearchBar { ...props.searchProps } />
        <hr />
        <BootstrapTable id="myorders" bootstrap4  classes="customTable" striped hover condensed rowStyle={ rowStyle }  pagination={ paginationFactory() }
          { ...props.baseProps }
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
};
export default PendingOrder;