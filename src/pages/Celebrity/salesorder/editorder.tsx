import { useSelector, useDispatch } from "react-redux";
import React, { useState, useEffect, useRef } from 'react'
import {Button, Modal,Spinner } from 'react-bootstrap';
import { FaTrash } from "react-icons/fa";
import {  toast } from 'react-toastify';
import { useHistory, Route, withRouter } from "react-router-dom";
import {
 GetSkusInfo, CreateOrder, GetProductInfoSearchPlus,AddSku,GetOrderStatus
} from 'actions/celebrityActions/OrderCreationAction';
import {   Card,  CardBody,  CardHeader,  Col,  FormGroup,
  FormText,  Input,  Label,  Row,  Table,  } from 'reactstrap';
import Page from 'components/Page';   
import { set } from "react-ga";
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import Loader from 'react-loader-spinner';
import bg1Image from 'assets/img/bg/background_640-1.jpg';


const EditOrder=()=>{
    const editOrderData = useSelector((state) => state.OrderConfirmReducer.dataEditOrder);
    const [objRequest, setobjRequest]=useState({})
    let history = useHistory();
    let dataGrid= editOrderData && editOrderData.celeb_OrderDetail;
    const [Sku, setSku] = useState({});
    const [Skus, SetSkuDetails] = useState([]);
    const dispatch = useDispatch();
    const [Order, setOrder] = useState({});
    const userData = JSON.parse(localStorage.getItem("userData"));
    const [isLoading, setisLoading] = useState(false);
    const [ConfigurableSku, SetConfigurableSku] = useState([]);
    const [show, setShow] = useState(false);
    const [isCreating, setisCreating] = useState(false)
    const Reset=()=>{
        setobjRequest({});
    } 
    const handleShow = () => { 
      setShow(true);
    };
    const GetCheckBoxIndexConfig = (e) => {
      const objConfigSku = JSON.parse(e.currentTarget.getAttribute('data-item'));
      Sku.ItemNo = objConfigSku.sku;
    }
    
    
     const AddConfigurableSku =async () => {
      SetConfigurableSku([]);
      setShow(false);
      setisLoading(true);
      let JsonRequest = {};
      JsonRequest.itemNo = Sku.ItemNo;
      JsonRequest.countryCode = editOrderData.countryCode;
      JsonRequest.celebrityId = editOrderData.celebrityCode;
      let arr = await dispatch(GetSkusInfo(JsonRequest));

  
              if (arr.result.itemId == 0) {
                toast.error("Sku Not Found");
                setSku({});
                setisLoading(false);
              }
              else {
                setSku({
                  ...Sku,
                  ItemDesc: arr.result.itemDesc,
                  CRSAvailableQty: arr.result.crsAvailableQty,
                  ItemType: arr.result.itemType,
                  Brand: arr.result.brand,
                  GivenBeforeQty: arr.result.givenBeforeQty,
                  GRNTotal: arr.result.grnTotal,
                  ExclusiveFor: arr.result.exclusiveFor,
                  Image: arr.result.image,
                  ItemId: arr.result.itemId,
                  ItemPrice: arr.result.itemPrice,
                  CelebrityCode: arr.result.celebrityCode,
                  Remarks: arr.result.remarks,
                  ItemStatus: arr.result.itemStatus,
                  ItemGivenOtherCeleb: arr.result.itemGivenOtherCeleb,
                  MaxGiftQty: arr.result.maxGiftQty,
                  GRNPercentage: arr.result.grnPercentage,
                  ElegibleQty: arr.result.elegibleQty,
                  Qty:1
                });
                setisLoading(false);
                document.getElementById("OrderQty").focus(); 
                document.getElementById("OrderQty").select(); 
              }
    };
    
    const handleClose = () => {
      setShow(false);
      setisCreating(false);
    }
    useEffect(() => {
      getAll();
    }, []);
   
    const getAll = async () => {      
      dataGrid = JSON.stringify(editOrderData);
      if (editOrderData.orderId !=undefined)
      {
        for (var i = 0; i < editOrderData.celeb_OrderDetail.length; i++) {
          let obj = {};    
          obj.OrderId=editOrderData.orderId;
          obj.ItemNo=editOrderData.celeb_OrderDetail[i].itemNo;
          obj.Qty=editOrderData.celeb_OrderDetail[i].qty;
          obj.ItemType=editOrderData.celeb_OrderDetail[i].itemType;
          obj.ItemDesc= editOrderData.celeb_OrderDetail[i].itemDesc;
          obj.CRSAvailableQty= editOrderData.celeb_OrderDetail[i].crsAvailableQty;         
          obj.GivenBeforeQty= editOrderData.celeb_OrderDetail[i].givenBeforeQty;
          obj.GRNTotal= editOrderData.celeb_OrderDetail[i].grnTotal;
          obj.ExclusiveFor= editOrderData.celeb_OrderDetail[i].exclusiveFor;       
          obj.ItemId= editOrderData.celeb_OrderDetail[i].itemId;
          obj.ItemPrice= editOrderData.celeb_OrderDetail[i].itemPrice;
          obj.CelebrityCode= editOrderData.celeb_OrderDetail[i].celebrityCode;
          obj.Remarks= editOrderData.celeb_OrderDetail[i].remarks;        
          obj.ItemGivenOtherCeleb= editOrderData.celeb_OrderDetail[i].itemGivenOtherCeleb;
          obj.MaxGiftQty= editOrderData.celeb_OrderDetail[i].maxGiftQty;
          obj.GRNPercentage= editOrderData.celeb_OrderDetail[i].grnPercentage;
          obj.ElegibleQty= editOrderData.celeb_OrderDetail[i].elegibleQty;
          Skus.push(obj);
        }     
        SetSkuDetails([...Skus]);    
        if (editOrderData!=null) {
          objRequest.Celebrity=editOrderData.celebName;
          objRequest.OrderId=editOrderData.orderId;
          objRequest.OrderDate=editOrderData.orderDate;
          objRequest.celebrityCode=editOrderData.celebrityCode;
          setobjRequest({...objRequest,Celebrity:editOrderData.celebName,OrderId:editOrderData.orderId,OrderDate:editOrderData.orderDate})        
        }
      }
      else{
        history.push('/OrderApproval');        
      }
      
    }
 
    const handleKeyDown = async(e)=>{
      if (e.key === 'Enter')
      {e.target.blur(); }
    }
    const GetSkuDetails = async (e) => {   
      if ((e.key === 'Enter' || e.key === undefined) && Sku.ItemNo) {    
       setisLoading(true);
        let searchplusRequest = {};
        searchplusRequest.skuCode = Sku.ItemNo;
        searchplusRequest.parentSku = "";
        searchplusRequest.countryCode = editOrderData.countryCode.toString().toLowerCase() + "_en";
        searchplusRequest.columns = "";
        let searchplusResponse = await dispatch(GetProductInfoSearchPlus(searchplusRequest));
        if (searchplusResponse.length > 0) {
          if (searchplusResponse[0].product_type != "configurable") {
            let JsonRequest = {};
            JsonRequest.itemNo = Sku.ItemNo;
            JsonRequest.countryCode = editOrderData.countryCode;
            JsonRequest.celebrityId = editOrderData.celebrityCode;
            let arr = await dispatch(GetSkusInfo(JsonRequest));
            if (arr.result.itemId == 0) {
              toast.error("Sku Not Found");
              setSku({});
              setisLoading(false);
            }
            else {
              setSku({
                ...Sku,
                ItemDesc: arr.result.itemDesc,
                CRSAvailableQty: arr.result.crsAvailableQty,
                ItemType: arr.result.itemType,
                Brand: arr.result.brand,
                GivenBeforeQty: arr.result.givenBeforeQty,
                GRNTotal: arr.result.grnTotal,
                ExclusiveFor: arr.result.exclusiveFor,
                Image: arr.result.image,
                ItemId: arr.result.itemId,
                ItemPrice: arr.result.itemPrice,
                CelebrityCode: arr.result.celebrityCode,
                Remarks: arr.result.remarks,
                ItemStatus: arr.result.itemStatus,
                ItemGivenOtherCeleb: arr.result.itemGivenOtherCeleb,
                MaxGiftQty: arr.result.maxGiftQty,
                GRNPercentage: arr.result.grnPercentage,
                ElegibleQty: arr.result.elegibleQty,
                Qty:1
              });
              setisLoading(false);
              document.getElementById("OrderQty").focus();
              document.getElementById("OrderQty").select();  
            }
          }
          else {
            let skuconfig = [];
            skuconfig = searchplusResponse[0].configurable_option[0].attributes;
            var skucode = '';
            for (var i = 0; i < skuconfig.length; i++) {
              skucode += skuconfig[i].sku + ",";
            }
            let searchplusConfigRequest = {};
            searchplusConfigRequest.skuCode = skucode;
            searchplusConfigRequest.parentSku = "";
            searchplusConfigRequest.countryCode = editOrderData.countryCode.toString().toLowerCase() + "_en";
            searchplusConfigRequest.columns = "";
            let searchplusConfigResponse = await dispatch(GetProductInfoSearchPlus(searchplusConfigRequest)); 
            
            for (var i = 0; i < searchplusConfigResponse.length; i++) {
              let objConfig = {};
              objConfig.sku = searchplusConfigResponse[i].sku;
              objConfig.name = searchplusConfigResponse[i].name; 
              objConfig.actual_available_qty = searchplusConfigResponse[i].actual_available_qty;               
              ConfigurableSku.push(objConfig);              
            }
            if (ConfigurableSku.length>1)
            {              
              SetConfigurableSku(ConfigurableSku);
              handleShow();       
            }  
            setisLoading(false);
            //document.getElementById("ItemNo").focus();
          }
        }
        else {
          toast.error("Sku Not Found");
          setSku({});
          setisLoading(false);
        }
      }       
      
    }
    const GetQtyChangeEvent = (e) => {
      if (e.key === 'Enter'){
        Sku.OrderId=editOrderData.orderId;
       AddSku(Sku,Skus,setSku,SetSkuDetails,isLoading,Clear);      
      } 
    }

    const FindDuplicate = ()=>{
      let result = [];
      let rtn = false;
      Skus.forEach(function(item) {
           if(result.indexOf(item.ItemNo) < 0) {
               result.push(item.ItemNo);
           }
           else{
             toast.error(`${item.ItemNo} is duplicated. Please remove to continue.`);
             rtn = true;
           }
      });
   return rtn;
      
    }
    const Clear = () => {
      setSku({});
    }
  const DeleteSku = (e) => {
    let skunindex = e.currentTarget.getAttribute('data-item');
    if (window.confirm('Are you sure .. ?')) {

      SetSkuDetails(Skus.map((x,index) => {
            if (index !== parseInt(skunindex)) return x
          return { ...x, Remarks: 'Deleted' }
        
      }))
    }
  }
    const Home = () => {
      history.push('/OrderApproval');
    }
    const UpdateOrder = async () => {
      setisCreating(true);
      let noQtySku =  Skus.find(obj =>( obj.ItemId==undefined ||obj.ItemId==0||
        obj.CRSAvailableQty==undefined || obj.CRSAvailableQty < 1));
      if(noQtySku!==null && noQtySku!==undefined ){
        toast.error(`${noQtySku.ItemNo} has no sufficient Qty. Please remove to continue`);
        setisCreating(false); 
        return;
      } 
      let isDuplicated = FindDuplicate();
       if(isDuplicated){
         setisCreating(false); 
         return;
       }
      OrderStatusValidation();
      if (Skus.length > 0) {
        let orderHead = {};       
        orderHead.Flag = "EDIT";
        orderHead.OrderId = objRequest.OrderId;
        orderHead.CelebrityCode = 0;
        orderHead.CelebName = objRequest.CelebName;
        orderHead.CelebEmail = "";
        orderHead.CountryCode = editOrderData.countryCode;
        orderHead.CustomerId = 0;
        orderHead.AddressId = 0;
        orderHead.Notes = Order.Notes;
        orderHead.OrderStatus = Order.OrderStatus;
        orderHead.ApprovalLevelNo = 1;
        orderHead.ApprovalStages = userData.approvalStages;
        orderHead.CreatedBy = userData.magentoUserId;
        orderHead.Celeb_OrderDetail = Skus;
        try {
          let arr = await dispatch(CreateOrder(orderHead));
          toast.success("Celebrity OrderNo -" + arr.result + " Updated Successfully");
        }
        catch {
          toast.info("Something Went Wrong Please try again Later");
        }
      }
      else {
        toast.warning("Please Add or Upload Sku");
      }
      setisCreating(false); 
    }
    const OrderStatusValidation = () => {
      let rtn = GetOrderStatus(Skus,userData,objRequest);
      Order.OrderStatus = rtn.OrderStatus;
      Order.Notes = rtn.Notes;
    }
    return (
        <div>
          <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Configurable Sku</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table className="customTable" id="vieworder">
              <thead>
                <tr>
                  <th scope="col">Select</th>
                  <th scope="col">Sku</th>
                  <th scope="col">Description</th>
                  <th scope="col">SOH</th>
                </tr>
              </thead>
              <tbody>
                {
                  ConfigurableSku.map(config => {

                    const { sku, name, actual_available_qty } = config;
                    return (
                      <tr key={sku}>
                        <td>
                          <div className="checkbox checkbox-circle checkbox-color-scheme">
                            <label className="checkbox-checked">
                              <input type="radio" name="rdconfig" data-item={JSON.stringify(config)} onClick={GetCheckBoxIndexConfig} />
                            </label>
                          </div>
                        </td>
                        <td>{sku}</td>
                        <td>{name}</td>
                        <td>{actual_available_qty}</td>
                      </tr>
                    )

                  })
                }
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-success" onClick={AddConfigurableSku} style={{ fontSize: "0.8rem", width: "20%", marginLeft: "5%" }}  >Add</Button>
            <Button className="btn btn-primary" style={{ fontSize: "0.8rem", width: "20%", marginLeft: "5%" }} onClick={handleClose} >
              Close </Button>

          </Modal.Footer>
        </Modal>
        <Row>
           <Col>
            <Card className="mb-12">
            <CardHeader>Edit Order</CardHeader>
            <CardBody>
            <div className="row" style={{fontSize:"0.8rem"}}>
                  <div className="BoxLayout colShadow" >
                  <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">SKU</Label>
                    <Input
                      type="text"
                      name="ItemNo"
                      id="ItemNo"
                      placeholder="Sku"
                      value={Sku.ItemNo || ''}
                      onBlur={GetSkuDetails}
                      onKeyDown={handleKeyDown}
                      onChange={e => setSku({ ...Sku, ItemNo: e.target.value.toUpperCase() })}
                      style={{fontSize:"0.8rem"}}
                    />
                     {isLoading && (
                      <div className="text-center">
                        <Loader
                          type="Oval"
                          color="#00BFFF"
                          height={30}
                          width={30}
                        />
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">Qty</Label>
                    <Input
                      type="text"                      
                      id="OrderQty"
                      placeholder="Enter qty"
                      value={Sku.Qty || ''}
                      disabled={isLoading}
                      onKeyDown={GetQtyChangeEvent}
                     onChange={e => {
                      GetQtyChangeEvent(e); setSku({ ...Sku, Qty: + e.target.value }
                      )
                    }}
                      name="OrderQty"
                      style={{fontSize:"0.8rem"}}
                    />
                  </FormGroup>
                 
                  <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">Description</Label> 
                    <Input
                      type="text"
                      name="ItemDesc"
                      id="ItemDesc"
                      disabled
                      placeholder="Description"
                      defaultValue={Sku.ItemDesc || ''}
                      onChange={e => setSku({ ...Sku, ItemDesc: e.target.value })}
                      style={{fontSize:"0.8rem"}}
                    />
                  </FormGroup>
                  </div> 
              
                  <div className="BoxLayout colShadow" >
                 
                  <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">ItemType</Label>
                    <Input
                      type="text"
                      name="ItemType"
                      id="ItemType"
                      disabled
                      placeholder="ItemType"
                      defaultValue={Sku.ItemType || ''}
                      onChange={e => setSku({ ...Sku, ItemType: e.target.value })}
                      style={{fontSize:"0.8rem"}}
                    />
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                  <Table  >
            <thead>
              <tr >
                <th scope="col" style={{fontWeight:"400"}}>SOH</th>
                <th scope="col" style={{fontWeight:"400"}}>Given</th>
                <th scope="col" style={{fontWeight:"400"}}>GRN</th> 
              </tr>
            </thead>
            <tbody> 
                    <tr >
                    <td style={{padding: "0.40rem"}} > <Input
                      type="text"
                      name="soh"
                      id="soh"
                      disabled
                      placeholder="SOH"
                      value={Sku.CRSAvailableQty || 0}
                      //onChange={e => setSku({ ...Sku, CRSAvailableQty: e.target.value })}
                      style={{fontSize:"0.8rem"}}
                    /></td>
                     <td style={{padding: "0.40rem"}} > <Input
                      type="text"
                      name="GivenQty"
                      id="GivenQty"
                      disabled
                      placeholder="Given"
                      defaultValue={Sku.GivenBeforeQty || 0}
                      onChange={e => setSku({ ...Sku, GivenBeforeQty: e.target.value })}
                      style={{fontSize:"0.8rem"}}
                    /></td>
                     <td style={{padding: "0.40rem"}} ><Input
                      type="text"
                      name="GRNQty"
                      id="GRNQty"
                      disabled
                      placeholder="GRN"
                      defaultValue={Sku.GRNTotal || ''}
                      onChange={e => setSku({ ...objRequest, GRNTotal: e.target.value })}
                      style={{fontSize:"0.8rem"}}
                    /> </td> 
                    </tr>
            </tbody>
            </Table>  
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                  <Button className="btn btn-success" disabled={isLoading} style={{fontSize:"0.8rem", width:"45%", marginLeft:"5%" }} onClick={e=>{ Sku.OrderId=editOrderData.orderId;AddSku(Sku,Skus,setSku,SetSkuDetails,isLoading,Clear);}}  >Add</Button>  
                  <Button className="btn btn-primary" style={{fontSize:"0.8rem", width:"45%", marginLeft:"5%"}} onClick={Clear} >
                  Reset </Button>  
                  </FormGroup>
                  </div>   
                  <div className="BoxLayout colShadow" >
                  <FormGroup className="InnerBoxLayout">
                  <Label for="exampleTime">Celebrity</Label>
                    <Input
                      type="text"
                      name="Celebrity"
                      id="Celebrity"
                      disabled
                      placeholder="Celebrity"
                      defaultValue={objRequest.Celebrity || ''}
                      onChange={e => setobjRequest({ ...objRequest, Celebrity: e.target.value })}
                      style={{fontSize:"0.8rem"}}
                    />
                  </FormGroup>  
                  <FormGroup className="InnerBoxLayout"  > 
                  <Label for="exampleTime">OrderId</Label>
                    <Input
                      type="text"
                      name="OrderId"
                      id="OrderId"
                      disabled
                      placeholder="OrderId"
                      defaultValue={objRequest.OrderId || ''}
                      onChange={e => setobjRequest({ ...objRequest, OrderId: e.target.value })}
                      style={{fontSize:"0.8rem"}}
                    />
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout"  > 
                  <Label for="exampleTime">Brand</Label>
                    <Input
                      type="text"
                      name="Brand"
                      id="Brand"
                      disabled
                      placeholder="Brand"
                      defaultValue={Sku.Brand || ''}
                      onChange={e => setSku({ ...Sku, Brand: e.target.value })}
                      style={{fontSize:"0.8rem"}}
                    />
                  </FormGroup>
                  </div> 
                  <div className="BoxLayout colShadow" >
                  <FormGroup className="InnerBoxLayout">
                    <input type="image" src={Sku.Image || bg1Image} style={{ width: 300, height: 200 }}></input>
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
                  <Table  className="customTable"  > 
                    <thead>
                      <tr>
                        <th scope="col">ItemNo</th> 
                        <th scope="col">Description</th>
                        <th scope="col">Qty</th>
                        <th scope="col">Type</th>
                        <th scope="col">SOH</th>
                        <th scope="col">Exclusive</th>
                        <th scope="col">GRN%</th>
                        <th scope="col">TotGRN</th>
                        <th scope="col">MaxGift</th>
                        <th scope="col">QtyGiven</th>
                        <th scope="col">QtyToOthers</th>
                        <th scope="col">ElegGiftQty</th>
                        <th scope="col">Remarks</th>
                        <th scope="col">Action</th> 
                      </tr>
                    </thead>
                    <tbody>
                        {
                           Skus.map((obj,index) => {
                            const {ItemNo, ItemDesc, Qty, ItemType, CRSAvailableQty, ExclusiveFor, GRNPercentage,
                              GRNTotal, MaxGiftQty,ItemId,
                              GivenBeforeQty, ItemGivenOtherCeleb, ElegibleQty, Remarks } = obj;
                              
                            return (
                              <tr key={index}>
                                <td scope="row">{ItemNo}</td>
                                <td>{ItemDesc}</td>
                                <td>{Qty}</td>
                                <td>{ItemType}</td>
                                <td>{CRSAvailableQty}</td>
                                <td>{ExclusiveFor}</td>
                                <td>{GRNPercentage}</td>
                                <td>{GRNTotal}</td>
                                <td>{MaxGiftQty}</td>
                                <td>{GivenBeforeQty}</td>
                                <td>{ItemGivenOtherCeleb}</td>
                                <td>{ElegibleQty}</td>
                                <td>{Remarks}</td>
                                <td><a className="btn btn-danger btn-sm" onClick={(DeleteSku)} data-item={(index)} ><FaTrash /></a></td>
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
        <div className="BoxLayout " >
        <FormGroup className="InnerBoxLayout">
        {!isCreating && <Button className="btn btn-success" onClick={UpdateOrder} style={{ fontSize: "0.8rem", width: "45%", marginLeft: "5%" }}  >Update</Button>  }
          {isCreating && <Spinner animation="border" variant="primary" />}
          <Button className="btn btn-primary" style={{ fontSize: "0.8rem", width: "45%", marginLeft: "5%" }} onClick={Home} >
            Home </Button>
        </FormGroup>
      </div>
      
        </div>
    ) 
}
export default EditOrder;