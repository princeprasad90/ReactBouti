import { useSelector, useDispatch } from "react-redux";
import bg1Image from 'assets/img/bg/NoImage.png';
import React, { useState, useEffect, useRef,useCallback  } from 'react'
import { FaTrash } from "react-icons/fa";
import { Modal, Spinner } from 'react-bootstrap';
import {  toast } from 'react-toastify';
import Tooltip from "@material-ui/core/Tooltip";
import {  Button,  Card,  CardBody,  CardHeader,  Col,  FormGroup,  FormText,
  Input,  Label,  Row,  Table} from 'reactstrap';
import Page from 'components/Page';
import 'styles/components/_table.scss';
import {  GetCelebrityAddress, GetSkusInfo, CreateOrder, SkuUpload,
   GetProductInfoSearchPlus,AddSku,GetOrderStatus,ResetCelebAddress
} from 'actions/celebrityActions/OrderCreationAction';
import {  listMappedCelebrityAction} from 'actions/celebrityActions/CelebrityActions';
import Loader from 'react-loader-spinner';
import Select from 'react-select';
import * as common from 'network/index';
import { RoleNames } from 'utils';
import {AccessButtons,checkAccessControl} from 'actions/celebrityActions/celebAccessControl';
const createorder = () => {
  const inputRef = useRef();
  const [objCeleb, setobjCeleb] = useState({})
  const [objRequest, setobjRequest] = useState({ date1: "", date2: "", celebrityCode: 0, name_EN: '', agentCode: 0, orderId: 0, isSync: 0 })
  const mappedCeleb = useSelector((state) => state.CelebrityReducer.listCelebrity);
  const [celebHeirarchy, setCelebHeirarchy] = useState([]);
  const CelebrityAddress = useSelector((state) => state.OrderCreationReducer.listCelebrityAddress);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [Order, setOrder] = useState({});
  const [Sku, setSku] = useState({});
  const [Skus, SetSkuDetails] = useState([]);
  const [ConfigurableSku, SetConfigurableSku] = useState([]);
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [ShowCelebrity, setShowCelebrity] = useState(false); 
  const [csvFile, setcsvFile] = useState({ attachment: '' });
  let one = React.createRef();
  const [isLoading, setisLoading] = useState(false);
  const [ShowDetail, setShowDetail] = useState(false);
  const [AddressDetail,setAddressDetail]=useState({});
  const [isCreating, setisCreating] = useState(false);
  const [isUploading, setisUploading] = useState(false);
  const [isCreateAllowed, setIsCreateAllowed] = useState(false);
  const [objCelebExclusive, setobjCelebExclusive] = useState({})
  const [selectedCelebrity, setselectedCelebrity] = useState();
  const [ddlCeleb, setDdlCeleb] = useState([]);
  useEffect(() => {
    getAll();
  }, []);

  const getAll = async () => {
    objCeleb.userid = userData.magentoUserId;
    let iscreateAllowedTemp = checkAccessControl(AccessButtons.CreateOrder,true);
    setIsCreateAllowed(iscreateAllowedTemp);
    if (userData.roles.includes(RoleNames.CelebSuperAdmin)) {
      let output = await common.apiCall2('POST', "ApprovalMatrix/GetCelebHeirarchy", {});
      let celebHierarchyTemp = output.data.result;
      setCelebHeirarchy(celebHierarchyTemp);
    }
    else if (mappedCeleb.length ===0)
    {
      await dispatch(listMappedCelebrityAction(objCeleb));
    }
  }

  useEffect(() => {
    if (celebHeirarchy.length > 0 && userData.roles.includes(RoleNames.CelebSuperAdmin)){
      let mapObj = new Map();
      celebHeirarchy.forEach(c => {
        mapObj.set(c.celebrityCode, {label: c.name_EN, value: c.celebrityCode,magentoCustomerId:c.magentoCustomerId});
      });
      let nonDuplicateCelebs = [...mapObj.values()];
      setDdlCeleb(nonDuplicateCelebs);
    }
    else if (mappedCeleb.length>0){
      setDdlCeleb([...mappedCeleb]);
    }

  }, [mappedCeleb,celebHeirarchy]);

  const GetCelebrityDetails = async (e) => {
    Order.userid = parseInt(e.value, 10);
    await dispatch(GetCelebrityAddress(Order));
    Order.CelebName = e.label;
  }
  const handleKeyDown = async(e)=>{
    if (e.key === 'Enter')
    {e.target.blur(); }
  }
  const GetSkuDetails =useCallback(async (e) => {
    if ((e.key === 'Enter' || e.key === undefined) && Sku.ItemNo) {    
      if (objRequest.celebrityCode == 0) {
        toast.warning("Please Select Celebrity");
        setSku({});
      }
      else if (Order.AddressId == undefined) {
        toast.warning("Please Select Address");
        setSku({});
      }      
      else {
        setisLoading(true);
        let searchplusRequest = {};
        searchplusRequest.skuCode = Sku.ItemNo;
        searchplusRequest.parentSku = "";
        searchplusRequest.countryCode = Order.Country.toString().toLowerCase() + "_en";
        searchplusRequest.columns = "";
        let searchplusResponse = await dispatch(GetProductInfoSearchPlus(searchplusRequest));
        if (searchplusResponse.length > 0) {
          if (searchplusResponse[0].product_type != "configurable") {
            let JsonRequest = {};
            JsonRequest.itemNo = Sku.ItemNo;
            JsonRequest.countryCode = Order.Country;
            JsonRequest.celebrityId = objRequest.celebrityCode;
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
            objCelebExclusive.ExclusiveCelebrity=searchplusResponse[0].exclusive_celebrity_name;
            objCelebExclusive.ExclusiveCelebrityId=searchplusResponse[0].exclusive_celebrity;
            let skuconfig = [];
            skuconfig = searchplusResponse[0].configurable_option[0].attributes;
            var skucode = '';
            for (var i = 0; i < skuconfig.length; i++) {
              skucode += skuconfig[i].sku + ",";
            }
            let searchplusConfigRequest = {};
            searchplusConfigRequest.skuCode = skucode;
            searchplusConfigRequest.parentSku = "";
            searchplusConfigRequest.countryCode = Order.Country.toString().toLowerCase() + "_en";
            searchplusConfigRequest.columns = "";
            let searchplusConfigResponse = await dispatch(GetProductInfoSearchPlus(searchplusConfigRequest)); 
            let configArray = [];
            for (var i = 0; i < searchplusConfigResponse.length; i++) {
              let objConfig = {};
              objConfig.sku = searchplusConfigResponse[i].sku;
              objConfig.name = searchplusConfigResponse[i].name; 
              objConfig.actual_available_qty = searchplusConfigResponse[i].actual_available_qty;               
              configArray.push(objConfig);              
            }
            if (configArray.length>1)
            {              
              SetConfigurableSku(configArray);
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
  })

  const GetCheckBoxIndex = (e) => {
    const objAddress = JSON.parse(e.currentTarget.getAttribute('data-item'));
   
    Order.CustomerId = objAddress.magentoCustomerId;
    Order.AddressId = objAddress.magentoAddressId;
    Order.Country = objAddress.countryCode;
    let vAddressDetail = "Block: " + objAddress.block + ", Street: "+ objAddress.street +   ", Building: "+ objAddress.building + "\n";
    vAddressDetail =vAddressDetail + "City: " +objAddress.city+ ",\nCountry: "+ objAddress.countryCode;
    setAddressDetail({...AddressDetail, "Address":vAddressDetail});   
  }
  const GetCheckBoxIndexConfig = (e) => {
    const objConfigSku = JSON.parse(e.currentTarget.getAttribute('data-item'));
    Sku.ItemNo = objConfigSku.sku; 
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
  const GetQtyChangeEvent = (e) => {
    if (e.key === 'Enter'){
     AddSku(Sku,Skus,setSku,SetSkuDetails,isLoading,Clear,one);      
    } 
  }
  const DeleteSku = (e) => {   
    let skuno = e.currentTarget.getAttribute('data-item');
    if (window.confirm('Are you sure .. ?')) {
      let index = Skus.findIndex(x => x.ItemNo === (skuno));
      if (index > -1) {
        Skus.splice(index, 1);
        SetSkuDetails([...Skus]);
      }
    }
    document.getElementById("ItemNo").focus();
  }
  const Clear = () => {
    
    setSku({
    });
   document.getElementById("ItemNo").focus();
  }
  const AddConfigurableSku =async () => {
    SetConfigurableSku([]);
    setShow(false);
    setisLoading(true);
    let JsonRequest = {};
            JsonRequest.itemNo = Sku.ItemNo;
            JsonRequest.countryCode = Order.Country;
            JsonRequest.celebrityId = objRequest.celebrityCode;
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
                //ExclusiveFor: arr.result.exclusiveFor,
                ExclusiveFor: objCelebExclusive.ExclusiveCelebrity,
                Image: arr.result.image,
                ItemId: arr.result.itemId,
                ItemPrice: arr.result.itemPrice,
              //  CelebrityCode: arr.result.celebrityCode,
                CelebrityCode: objCelebExclusive.ExclusiveCelebrityId,
                Remarks: objCelebExclusive.ExclusiveCelebrityId==""?arr.result.remarks:"Sku Exclusive to another Celebrity",
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
    //GetSkuDetails();
  };
  const handleShowItemUpload = () => { 
    setShowDetail(true);
  }
  const handleClose = () => {
    setShowDetail(false);
    setShow(false);
    setShowCelebrity(false);
    setisCreating(false);
  }
  const handleShow = () => { 
    setShow(true);
  };
  const handleShowCelebrity = async() => { 
    //reset on showing celelbrity modal
    setselectedCelebrity(null);
    setobjRequest({ ...objRequest, celebrityCode: 0 });
    Order.CustomerId = undefined;
    Order.AddressId = undefined;
    Order.Country =undefined;
    Order.CelebName=undefined;
    setAddressDetail({"Address":""});
    setobjRequest({ ...objRequest, celebrityCode: 0});
    await dispatch(ResetCelebAddress());
    setShowCelebrity(true);
  };
  const SaveOrder = async () => {
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
      orderHead.Flag = "NEW";
      orderHead.OrderId = 0;
      orderHead.CelebrityCode = objRequest.celebrityCode;
      orderHead.CelebName = Order.CelebName;
      orderHead.CelebEmail = objRequest.CelebEmail;
      orderHead.CountryCode = Order.Country;
      orderHead.CustomerId = Order.CustomerId;
      orderHead.AddressId = Order.AddressId;
      orderHead.Notes = Order.Notes;
      orderHead.OrderStatus = Order.OrderStatus;
      orderHead.ApprovalLevelNo = 1;
      orderHead.ApprovalStages = userData.approvalStages;
      orderHead.CreatedBy = userData.magentoUserId;
      orderHead.CreatedUser = userData.userName;
      orderHead.Celeb_OrderDetail = Skus;
      try {
        let arr = await dispatch(CreateOrder(orderHead));
        if('status' in arr && arr.status==true)
        {
          toast.success("Celebrity OrderNo -" + arr.result + " Created Successfully");
        }
        else
        {
          toast.error("Cannot Save!");
        }
        SetSkuDetails([]);
        setOrder({});   
        setAddressDetail({"Address":""});
        CelebrityAddress.splice(0,CelebrityAddress.length);
        setobjRequest({ ...objRequest, celebrityCode: 0});
       
      }
      catch {
        toast.info("Something Went Wrong Please try again Later");
        SetSkuDetails([]);
        setOrder({});   
        setAddressDetail({"Address":""});
        CelebrityAddress.splice(0,CelebrityAddress.length);
        setobjRequest({ ...objRequest, celebrityCode: 0});
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
  const CancelOrder = () => {
    setAddressDetail({"Address":""})
    setOrder({})
    SetSkuDetails([]);
    setSku({});
    CelebrityAddress.splice(0,CelebrityAddress.length);
    setobjRequest({ ...objRequest, celebrityCode: 0});
  }
  const uploadSku = async () => {  
    setisUploading(true);
    if (objRequest.celebrityCode == 0) {
      toast.warning("Please Select Celebrity");    
    }
    else if (Order.AddressId == undefined) {
      toast.warning("Please Select Address");
     
    }
    else {
      let bulkSkus =[];
      const formData = new FormData();
      formData.append('countryCode', Order.Country);
      formData.append('CelebrityId', objRequest.celebrityCode);
      formData.append('ItemNo', csvFile.attachment);
      let res = await dispatch(SkuUpload(formData));
      if (res.result.length > 0) {
        for (var i = 0; i < res.result.length; i++) {
          let obj = {};
          obj.ItemNo = res.result[i].itemNo;
          obj.Qty = res.result[i].qty;
          obj.ItemDesc = res.result[i].itemDesc;
          obj.CRSAvailableQty = res.result[i].crsAvailableQty;
          obj.ItemType = res.result[i].itemType;
          obj.Brand = res.result[i].brand;
          obj.GivenBeforeQty = res.result[i].givenBeforeQty;
          obj.GRNTotal = res.result[i].grnTotal;
          obj.ExclusiveFor = res.result[i].exclusiveFor;
          obj.Image = res.result[i].image;
          obj.ItemId = res.result[i].itemId;
          obj.ItemPrice = res.result[i].itemPrice;
          obj.CelebrityCode = res.result[i].celebrityCode;
          obj.Remarks =obj.Qty>1?res.result[i].remarks+"Qty more than 1/ " :res.result[i].remarks;
          obj.ItemStatus = res.result[i].itemStatus;
          obj.ItemGivenOtherCeleb = res.result[i].itemGivenOtherCeleb;
          obj.MaxGiftQty = res.result[i].maxGiftQty;
          obj.GRNPercentage = res.result[i].grnPercentage;
          obj.ElegibleQty = res.result[i].elegibleQty;
          let invalidProps ={};
          obj.inValidStyle = {};
          obj.errMessage='';
          if(obj.CRSAvailableQty<1){
            invalidProps={isValid : false,errMessage :"No Sufficient Qty.",inValidStyle:{background:'silver'}}
          };
          bulkSkus.forEach(r=>{
            if(r.ItemNo === obj.ItemNo){
              invalidProps={isValid : false,errMessage :"Duplicate Item",inValidStyle:{background:'silver'}}
              r.isValid=invalidProps.isValid;
              r.errMessage=invalidProps.errMessage;
              r.inValidStyle=invalidProps.inValidStyle;
            }
            });
          bulkSkus.push({...obj,...invalidProps});
        }
        bulkSkus.sort(function (a, b) {
          if (a.ItemNo < b.ItemNo) {
              return -1;
          }
          if (b.ItemNo < a.ItemNo) {
              return 1;
          }
          return 0;
      });
        SetSkuDetails([...bulkSkus]);
        setShowDetail(false);       
        toast.info("Uploaded Successfully");
      }
      else {
        toast.warning("Please Upload the File txt Format");      
      }
    }
    setisUploading(false);

  }

  const handleSelectCelebChange = (val,act)=>{
    setselectedCelebrity(val);
    if(act.action==='select-option')
   {
    GetCelebrityDetails(val); setobjRequest({ ...objRequest, celebrityCode: +val.value });
   }
    else if(act.action==="clear")
    {
      setselectedCelebrity(null);
      setobjRequest({ ...objRequest, celebrityCode: 0 });
    }
  }
  return (
    <Page>

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
      </div>
      <div style={{width:"140%"}} >
        <Modal show={ShowCelebrity} onHide={handleClose}  >
          <Modal.Header closeButton>
            <Modal.Title>Select Celebrity</Modal.Title>
          </Modal.Header>
          <Modal.Body  >
            <div className="row" style={{ fontSize: "0.8rem" }}>
              <div className=" colShadow" >
                <FormGroup className="InnerBoxLayout">
                  <Label for="exampleTime">Celebrity</Label>
                  <Select name="selCeleb" placeholder='Select Celebrity'
                    value={selectedCelebrity}
                    onChange={handleSelectCelebChange}
                    isClearable={true} options={ddlCeleb} />
                </FormGroup>
                              <FormGroup className="InnerBoxLayout"  >
                                <Label for="exampleTime">Address</Label>
                                <table className="table table-hover">
                                  <thead>
                                    <tr>
                                      <th scope="col">Select</th>
                                      <th scope="col">Country</th>
                                      <th scope="col">City</th>
                                      <th scope="col">Block</th>
                                      <th scope="col">Street</th>
                                      <th scope="col">Building</th>
                                      <th scope="col">Phone</th> 
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {
                                      CelebrityAddress.map(Addr => { 
                                        const { magentoCustomerId, magentoAddressId, countryCode, city, block, street, building, phoneNo } = Addr;
                                        return (
                                          <tr key={magentoAddressId}>
                                            <td>
                                              <div className="checkbox checkbox-circle checkbox-color-scheme">
                                                <label className="checkbox-checked"> 
                                                  <input type="radio" name="rdadd" data-item={JSON.stringify(Addr)} onClick={GetCheckBoxIndex} />
                                                </label>
                                              </div>
                                            </td>
                                            <td>{countryCode}</td>
                                            <td>{city}</td>
                                            <td>{block}</td>
                                            <td>{street}</td>
                                            <td>{building}</td>
                                            <td>{phoneNo}</td>
                                          </tr>
                                        )  
                                      })
                                    }
                                  </tbody>
                                </table>
                              </FormGroup>
                            </div> 
                          </div>  
  	      </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
      <Row>
        <Col>
          <Card className="mb-12">
          <CardHeader>New Order</CardHeader>
          <div style={{ float: 'left', position: 'relative' }}>
              <a href="#" onClick={(e) => handleShowCelebrity()} color="primary" className="caret btn-sm mr-10">+Celebrity
               </a>
              </div>
            <CardBody style={{ marginTop: "-14px" }}>
              <div className="row" style={{ fontSize: "0.8rem" }}>
                <div className="BoxLayout colShadow" >
                  <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">SKU</Label>
                    <Input
                      type="text"
                      id="ItemNo"
                      className="focus-visible"
                      name="ItemNo"
                      placeholder="Type the Sku And Press EnterKey"
                      autoComplete="off"
                      ref={one}
                      value={Sku.ItemNo || ''}
                      onBlur={GetSkuDetails}                  
                      onKeyDown={handleKeyDown}
                      onChange={e => setSku({ ...Sku, ItemNo: e.target.value.toUpperCase() })}
                      style={{ fontSize: "0.8rem" }}
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
                      placeholder="Enter Qty"
                      className="focus-visible"
                      value={Sku.Qty || ''}
                      disabled={isLoading}
                      // ref = {qtyRef}
                      name="OrderQty"
                      onKeyDown={GetQtyChangeEvent}
                      onChange={e => {
                      GetQtyChangeEvent(e); setSku({ ...Sku, Qty: + e.target.value }
                      )
                    }}
                     // onChange={e => setSku({ ...Sku, Qty: + e.target.value }),GetQtyChangeEvent}
                      style={{ fontSize: "0.8rem" }}
                    />
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">Description</Label>
                    <Input
                      type="text"
                      id="ItemDesc"
                      disabled
                      placeholder="Description"
                      value={Sku.ItemDesc || ''}
                      name="ItemDesc"
                      onChange={e => setSku({ ...Sku, ItemDesc: e.target.value })}
                      style={{ fontSize: "0.8rem" }}
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
                      value={Sku.ItemType || ''}
                      onChange={e => setSku({ ...Sku, ItemType: e.target.value })}
                      style={{ fontSize: "0.8rem" }}
                    />
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Table  >
                      <thead>
                        <tr >
                          <th scope="col" style={{ fontWeight: "400" }}>SOH</th>
                          <th scope="col" style={{ fontWeight: "400" }}>Given</th>
                          <th scope="col" style={{ fontWeight: "400" }}>GRN</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr >
                          <td style={{ padding: "0.40rem" }} > <Input
                            type="text"
                            name="soh"
                            id="soh"
                            disabled
                            placeholder="SOH"
                            value={Sku.CRSAvailableQty || 0}
                            onChange={e => setSku({ ...Sku, CRSAvailableQty: +e.target.value })}
                            style={{ fontSize: "0.8rem" }}
                          /></td>
                          <td style={{ padding: "0.40rem" }} > <Input
                            type="text"
                            name="givenBeforQty"
                            id="givenBeforQty"
                            disabled
                            placeholder="Given"
                            value={Sku.GivenBeforeQty || 0}
                            onChange={e => setSku({ ...Sku, GivenBeforeQty: + e.target.value })}
                            style={{ fontSize: "0.8rem" }}
                          /></td>
                          <td style={{ padding: "0.40rem" }} ><Input
                            type="text"
                            name="grnQty"
                            id="grnQty"
                            disabled
                            placeholder="GRN"
                            value={Sku.GRNTotal || ''}
                            onChange={e => setSku({ ...Sku, GRNTotal: +e.target.value })}
                            style={{ fontSize: "0.8rem" }}
                          /> </td>
                        </tr>
                      </tbody>
                    </Table>
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Button className="btn btn-success" disabled={isLoading}  onClick={e=>{AddSku(Sku,Skus,setSku,SetSkuDetails,isLoading,Clear,one);}} style={{ fontSize: "0.8rem", width: "45%", marginLeft: "5%" }}  >Add</Button>
                    <Button className="btn btn-primary" style={{ fontSize: "0.8rem", width: "45%", marginLeft: "5%" }} onClick={Clear} >
                      Reset </Button>
                  </FormGroup>
                </div>
                <div className="BoxLayout colShadow" >
                  <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">Celebrity-Exclusive</Label>
                    <Input
                      type="text"
                      name="Exclusive"
                      id="Exclusive"
                      disabled
                      placeholder=""
                      value={Sku.ExclusiveFor || ''}
                      onChange={e => setSku({ ...Sku, ExclusiveFor: e.target.value })}
                      style={{ fontSize: "0.8rem" }}
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
                      value={Sku.Brand || ''}
                      onChange={e => setSku({ ...Sku, Brand: e.target.value })}
                      style={{ fontSize: "0.8rem" }}
                    />
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout"  style={{ textAlign:"center"}} >
                  <input type="image" src={Sku.Image || bg1Image} style={{ width: "80px", height: "80px" }} ></input>

                  </FormGroup>
                </div>
                <div className="BoxLayout colShadow" >
                  {/* <FormGroup className="InnerBoxLayout">  
                    <input type="image" src={Sku.Image || bg1Image} style={{ width: "100%", height: "100%" }}></input>
                </FormGroup> */}
                <FormGroup className="InnerBoxLayout">
                    <Label for="exampleTime">Celebrity </Label> 
                    <Input
                      type="text"
                      name="txtName"
                      id="txtName"
                      disabled
                      placeholder="Celebrity"
                      defaultValue={Order.CelebName } 
                      style={{ fontSize: "0.8rem" }}
                    />
                     <Label for="exampleTime">Address</Label> 
                    <Input
                      type="textarea"
                      name="txtAddress"
                      id="txtAddress"
                      disabled
                      rows="4" cols="30"
                      placeholder="Address"
                      defaultValue={AddressDetail.Address} 
                      style={{ fontSize: "0.8rem", height:"106px" }}
                    />
                </FormGroup>  
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
          <Col>
              <div style={{ float: 'left', position: 'relative' }}>
              <a href="#" onClick={(e) => handleShowItemUpload()} color="primary" className="caret btn-sm mr-10">+Upload Items
               </a>    
              </div>
          </Col>
      </Row>
      <Row>
        <Col>
          <Card className="mb-3">
            <CardBody>
              <Table className="customTable"  >
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
                    {/* <th scope="col">CurrentSOH</th> */}
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    Skus.map((obj,index) => {
                      const { ItemNo, ItemDesc, Qty, ItemType, CRSAvailableQty, ExclusiveFor, GRNPercentage,
                        GRNTotal, MaxGiftQty,inValidStyle,errMessage,
                        GivenBeforeQty, ItemGivenOtherCeleb, ElegibleQty, Remarks } = obj;

                      return (
                        <Tooltip key={index} title={errMessage||''} placement="left-start" >
                        <tr key={index} style={inValidStyle}  >
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
                          <td><a className="btn btn-sm" onMouseDown={(DeleteSku)} data-item={(ItemNo)} ><FaTrash /></a></td>
                        </tr>
                        </Tooltip>
                       
                      )
                    })
                  }
                </tbody>
              </Table>
            </CardBody>
          </Card>

        </Col>

      </Row>
      <Row>
      <div className="BoxLayout " >
        <FormGroup className="InnerBoxLayout">
          {!isCreating && isCreateAllowed && <Button className="btn btn-success" onClick={SaveOrder} style={{ fontSize: "0.8rem", width: "45%", marginLeft: "5%" }}  >Create</Button> }
          {isCreating && <Spinner animation="border" variant="primary" />}
          <Button className="btn btn-primary" style={{ fontSize: "0.8rem", width: "45%", marginLeft: "5%" }} onClick={CancelOrder} >
            Cancel </Button> 
        </FormGroup>
      </div>
      <div>
        <Modal show={ShowDetail} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Bulk Item Upload</Modal.Title>
          </Modal.Header>
          <Modal.Body>
         
          <div className="colShadow" style={{width:'100%'}} >
          <FormGroup className="m-2">
            <Label for="exampleTime">Upload Items</Label>
            <FormText color="muted">
            </FormText>
            <input type="file" className="m-2" onChange={e => setcsvFile({ ...csvFile, attachment: e.target.files[0] })} />
            {isUploading && <Spinner animation="border" variant="primary" />}
            {!isUploading && <Button color="primary"  className="m-2" size="lg" style={{float: 'right'}} onClick={uploadSku} >Upload</Button> }
          </FormGroup> 
        </div>
       
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
        </Row>
    </Page>
  )

};
export default createorder;
