import React, { useEffect, useState } from 'react';
import {
  CardHeader, Col, CardBody, Row, Badge,
  Button, FormGroup, Input, Collapse
} from 'reactstrap';
import Page from 'components/Page';
import { toast } from 'react-toastify';
import { Card, Spinner, Modal } from 'react-bootstrap';
import * as common from '../../network/index';
import { Catalogitem } from 'components/Booster/CatalogItem';
import Select from 'react-select';
import Label from 'reactstrap/lib/Label';
import { useSelector, useDispatch } from "react-redux";
import { allListCelebrityAction,listMappedCelebrityAction } from 'actions/celebrityActions/CelebrityActions';
import { listBrandAction, listProdDeptAction,listProdCategoryAction } from 'actions/boosterActions/ProdDeptActions';
import Pagination from 'rc-pagination';
import localeInfo from 'assets/locale/en_GB';
import {RoleNames} from 'utils/roleNames';
import BootstrapTable from 'react-bootstrap-table-next';
import { ValidationForDecimal } from 'actions/helper/CommonActions';
function Catalog() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [items, setitems] = useState([]);
  const [selectedItems, setselectedItems] = useState([]);
  const [showCreate, setshowCreate] = useState(false);
  const [campObj, setcampObj] = useState({})
  const [selectedCelebrity, setselectedCelebrity] = useState([]);
  const dispatch = useDispatch();
  //const ddlAllCeleb = useSelector((state) => state.CelebrityReducer.allCelebs);
  const ddlCeleb = useSelector((state) => state.CelebrityReducer.listCelebrity);

  const ddlBrands = useSelector((state) => state.BoosterReducer.listBrands);
  const ddlDepts = useSelector((state) => state.BoosterReducer.listProdDept);
  const ddlCategory = useSelector((state) => state.BoosterReducer.listProdCategory);
  const [isOpen, setIsOpen] = useState(true);
  const [objRequest, setobjRequest] = useState({});
  const [selectedDepts, setselectedDepts] = useState([]);
  const [selectedCategory, setselectedCategory] = useState([]);
  const [ddlcelebrity, setddlcelebrity] = useState([]);
  const [selectedBrands, setselectedBrands] = useState([]);
  const [isloading, setisloading] = useState(false);
  const [current, setcurrent] = useState(1);
  const [pageSize, setpageSize] = useState(15);
  const [tolalSize, settolalSize] = useState(0);
  const [createRes, setcreateRes] = useState([]);
  const [isCreateEnabled, setIsCreateEnabled] = useState(false);
  
  const onChangePage = async page => {
    setcurrent(page);
    await getCatalog(page, pageSize);
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
  const toggle = () => setIsOpen(!isOpen);
  const getChecked = (temp) => {
    let index = selectedItems.findIndex(obj => obj.id === temp.id);
    temp.checked = (index === -1) ? false : true;
  }
  const getCatalog = async (currentIndex, pageSize, opt = 0) => {
    setisloading(true);
    let index = (currentIndex - 1) * pageSize;
    let paginationProps = { "currentIndex": index, "pageSize": pageSize };
    let request = {};
    switch (opt) {
      case 0:
        request = {
          itemNoCSV : ('itemNoCSV' in objRequest && objRequest.itemNoCSV.length>0 )?objRequest.itemNoCSV:null,
          batchIdCSV: ('batchIdCSV' in objRequest && objRequest.batchIdCSV.length>0 )?objRequest.batchIdCSV:null,
          productName: ('productName' in objRequest && objRequest.productName.length>0 )?objRequest.productName:null,
          batchTitle: ('batchTitle' in objRequest && objRequest.batchTitle.length>0 )?objRequest.batchTitle:null,
          deptsCSV: selectedDepts.length > 0 ? selectedDepts.map(d => d.label).join(',') : null,
          brandsCSV: selectedBrands.length > 0 ? selectedBrands.map(b => b.label).join(',') : null,
          categoriesCSV: selectedCategory.length > 0 ? selectedCategory.map(b => b.label).join(',') : null,
          ...paginationProps
        };
        break;
      case 1:
        request = { ...paginationProps };
        break;
      case 2:
        let itemNoCSV = selectedItems.map(i => i.itemNo).join(',');
        request = { ...paginationProps, itemNoCSV};
        break;
    }

    let output = await common.apiCall2('POST', `Misc/GetcatalogSearch`, request);
    let { data, totalSize } = output.data.result
    let tempItems = data;
    settolalSize(totalSize);
    let itemsCSV = tempItems.map(t => t.itemNo).join(',');
    let itemDetailsArray = await getItemDetails(itemsCSV);
    let tempItemList = [];

    tempItems.forEach(el => {
      try {
        let itemInfo = itemDetailsArray.find(i => i.sku.toUpperCase() === el.itemNo.toUpperCase());
        if (!itemInfo) {
          toast.error(`${el.itemNo} is an invalid item`);
        }
        else if (itemInfo.celebExclusive === true) {
          toast.error(`${el.itemNo} is an exclusive item`);
        }
        else {
          let gender = ('gender' in itemInfo)?itemInfo.gender:[];
          let genderDesc = '';
          if( gender.length>1)
              genderDesc ='Unisex';
          else if (gender[0]==='4194')
              genderDesc ='Women';
          else
              genderDesc ='Men';   
          let temp = {
            ...el,
            itemNo: itemInfo.sku,
            itemDesc: itemInfo.enShortDescription,
            itemURL: 'https://v2cdn.boutiqaat.com/media/catalog/product' + itemInfo.defaultImage,
            category: ('enCategoryName' in itemInfo) ? itemInfo.enCategoryName[0] : '',
            brand: ('brand' in itemInfo) ? itemInfo.brand.englishName : '',
            soh: itemInfo.inventory,
            sPrice: itemInfo.filter_specialPrices,
            price: itemInfo.price,
            type: itemInfo.type,
            gender : genderDesc
          }

          getChecked(temp);
          tempItemList.push(temp);
        }
      } catch (e) {
        toast.error(`Something wrong with ${el.itemNo} ${e}`);
      }
    });
    setitems(tempItemList);
    setisloading(false);
  }

  const showTotal = (total, range) => {
    return `${range[0]} - ${range[1]} of ${total} items`;
  }
  useEffect(() => {
    let boosterPriorityRole = 0;
    if (userData.roles.includes(RoleNames.BoosterManagement)){
      boosterPriorityRole = RoleNames.BoosterManagement;
    }
    else if (userData.roles.includes(RoleNames.BoosterProjectLeader)){
      boosterPriorityRole = RoleNames.BoosterProjectLeader;
    }
    else if (userData.roles.includes(RoleNames.BoosterManager)){
      boosterPriorityRole = RoleNames.BoosterManager;
    }
    let celebrityPriorityRole = 0;
    if (userData.roles.includes(RoleNames.CelebJuniorRM)){
      celebrityPriorityRole = RoleNames.CelebJuniorRM;
    }
    else if (userData.roles.includes(RoleNames.CelebAccountManager)){
      celebrityPriorityRole = RoleNames.CelebAccountManager;
    }

    // let isCreateEnabledTemp =( userData.roles.includes(RoleNames.BoosterManager) 
    //                            && !(userData.roles.includes(RoleNames.BoosterProjectLeader))
    //                            && !(userData.roles.includes(RoleNames.BoosterManagement))
    //                           );
    // let isCreateEnabledTemp = (boosterPriorityRole===RoleNames.BoosterManager
    //                           && celebrityPriorityRole === RoleNames.CelebJuniorRM);
    // setIsCreateEnabled(isCreateEnabledTemp);

    let isApprovalEnabledTemp =userData.roleId==4?true:false;
    setIsCreateEnabled(isApprovalEnabledTemp);     
    
    const getAll = async () => {
      // if (ddlAllCeleb.length === 0) {
      //   let objCeleb = { userid: -1 }
      //   await dispatch(allListCelebrityAction(objCeleb));
      // }
      let objCeleb = {userid : userData.magentoUserId}; 
      if (ddlCeleb.length ===0)
      {
        await dispatch(listMappedCelebrityAction(objCeleb));
      }
      if (ddlBrands.length === 0) {
        await dispatch(listBrandAction());
      }
      if (ddlDepts.length === 0) {
        await dispatch(listProdDeptAction());
      }
      if (ddlCategory.length === 0) {
        await dispatch(listProdCategoryAction());
      }
      await getCatalog(1, 15);
    }
    getAll();
  }, []);

  useEffect(() => {
    let tempItemList = [];
    let tempItems = [...items];
    tempItems.forEach(el => {
      let temp = { ...el };
      getChecked(temp);
      tempItemList.push(temp);
    });
    setitems(tempItemList);
  }, [selectedItems]);
  useEffect(() => {
    let tempCeleb = [...ddlCeleb];
    let celebArray = tempCeleb.map(c=>{return {value:c.value,label:`${c.value}-${c.label}`}});
    setddlcelebrity(celebArray);
}, [ddlCeleb]);

  const handleChkBox = async (e) => {
    let indexToRemove = selectedItems.findIndex(obj => obj.id === +e.target.value);
    if (indexToRemove === -1) {
      let val = items.find(i => i.id === +e.target.value);
      setselectedItems([...selectedItems, val]);
    }
    else {
      let tempSelectedItems = [...selectedItems];
      tempSelectedItems.splice(indexToRemove, 1);
      setselectedItems(tempSelectedItems);
    }
  }
  const handleClose = () => {
    setshowCreate(false);
    setcampObj({});
    setselectedCelebrity([]);
    setcreateRes([]);
  }
  const handleShowCreate = (e) => {
    if (selectedItems.length > 0)
      setshowCreate(true);
    else
      toast.error(`No Skus selected`);
  }
  const handleCreate = async (e) => {
    let today = new Date();
    let decimalLength = ValidationForDecimal(campObj.commission);
    if (!('title' in campObj) || !campObj.title) {
      toast.error(`Title is required`);
      return;
    }
    else if (!('fromDate' in campObj)) {
      toast.error(`From Date is required`);
      return;
    }
    else if (!('toDate' in campObj)) {
      toast.error(`To Date is required`);
      return;
    }
    else if (!selectedCelebrity || selectedCelebrity.length === 0) {
      toast.error(`Select celebrity`);
      return;
    }    
    else if (!('commission' in campObj) || (campObj.commission <= 0) || (campObj.commission >10)) {
      toast.error(`Extra Commission Must be Between 0 and 10 `);
      return;
    } 
    else if (decimalLength >3){
      toast.error(`Only 3 Decimal Places are allowed in Extra Commission`);
        return;
    }   
    let fromDate = new Date(campObj.fromDate);
    let toDate = new Date(campObj.toDate);   
    if (fromDate <= today) {
      toast.error(`From Date cannot be less than today `);
      return;
    }
    else if (fromDate > toDate) {
      toast.error(`To Date cannot be less than From Date `);
      return;
    }
    else {
      let itemNoArray = selectedItems.map(i => { return { 'ItemNo': i.itemNo,'ItemDesc':i.itemDesc } });
      let celebrityIdArray = [{ 'CelebrityId': selectedCelebrity.value }]
      let request = {
        "CampainId": "0",
        "Title": campObj.title,
        "Date1": campObj.fromDate,
        "Date2": campObj.toDate,
        "Commision": campObj.commission,
        "CampaignType": "Celebrity",
        "InsertedBy": "1",
        "ItemList": itemNoArray,
        "CelebrityList": celebrityIdArray
      }
      try {
        let output = await common.apiCall2('POST', `Booster/Camp_Create`, request);
        let { data } = output;
        let { result, status, message } = data;
        if (status) {
          let tempList = [];
          result.forEach(obj => {
            let temp = { ...obj,
            campID: <a className="btn btn-outline-dark  btn-sm"  >{obj.campaignStatus === '200' ? obj.campaignId : 0}</a> ,
            msg : obj.campaignStatus === '200' ? 'Success' : 'Fail',
            CelebName : (obj.celebrityId !== 0) ? ddlCeleb.find(c => c.value === obj.celebrityId.toString()).label : ''
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

    }
  }
  const handleSearch = async (e) => {
    if (current != 1)
      setcurrent(1);
    else {
      getCatalog(1, pageSize);
    }
  }

  const handleReset = (e) => {
    setobjRequest({});
    setselectedDepts([]);
    setselectedBrands([]);
    setselectedCategory([]);
    setcurrent(1);
    getCatalog(1, pageSize, 1);
  }
  const pageDropChange = async (e) => {
    let size = +e.target.value;
    setpageSize(size);
    await getCatalog(current, size);
  }

  const handleShowSelecteds = async (e)=>{
    setselectedDepts([]);
    setselectedBrands([]);
    setselectedCategory([]);
    setcurrent(1);
    let itemNoCSV = selectedItems.map(i=>i.itemNo).join(',');
    setobjRequest( {itemNoCSV});
    getCatalog(1,pageSize, 2);

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
 
  return (
    <Page >
      <Card className="mb-3  mt-2">
        <CardHeader>Catalog</CardHeader>
        <CardBody>
          <Row >
            <Col>
              <Card >
                <div className="border-bottom  border-2">
                  <button className=" btn float-left " onClick={toggle} >SKU SEARCH</button>
                  <div className="float-right">
                  {isCreateEnabled && <button  className="btn btn-link " onClick={handleShowCreate} >+Create Celebrity Campaign</button> }
                  <span className="mr-1" style={{'cursor':'pointer'}} onClick={handleShowSelecteds}> 
                    <Badge  color="dark">{selectedItems.length}</Badge> 
                  </span>              
                  </div>
                  </div>
                <CardBody>
                  <Collapse isOpen={isOpen}>
                    <div className="row" style={{ fontSize: "0.8rem" }}>
                      <div className="BoxLayout colShadow" >
                        <FormGroup className="InnerBoxLayout">
                          <Label for="batchIdCSV">BatchID</Label>
                          <Input
                            type="text"
                            name="batchIdCSV"
                            id="batchIdCSV"
                            placeholder="Enter Batch Id csv"
                            value={objRequest.batchIdCSV || ''}
                            onChange={e => setobjRequest({ ...objRequest, batchIdCSV: e.target.value })}
                            style={{ fontSize: "0.8rem" }}
                          />
                        </FormGroup>
                        <FormGroup className="InnerBoxLayout">
                          <Label for="batchTitle">Batch title</Label>
                          <Input
                            type="text"
                            name="batchTitle"
                            id="batchTitle"
                            placeholder="Enter Batch title"
                            value={objRequest.batchTitle || ''}
                            onChange={e => setobjRequest({ ...objRequest, batchTitle: e.target.value })}
                            style={{ fontSize: "0.8rem" }}
                          />
                        </FormGroup>

                      </div>
                      <div className="BoxLayout colShadow" >
                        <FormGroup className="InnerBoxLayout">
                          <Label for="selDepts">Departments</Label>
                          <Select name="selDepts" placeholder='Select Depts'
                            value={selectedDepts}
                            onChange={(val, act) => setselectedDepts(val)}
                            isMulti isClearable={true} options={ddlDepts} />
                        </FormGroup>
                        <FormGroup className="InnerBoxLayout">
                          <Label for="selCategory">Category</Label>
                          <Select name="selCategory" placeholder='Select Category'
                            value={selectedCategory}
                            onChange={(val, act) => setselectedCategory(val)}
                            isMulti isClearable={true} options={ddlCategory} />
                        </FormGroup>

                      </div>
                      <div className="BoxLayout colShadow" >
                        <FormGroup className="InnerBoxLayout">
                          <Label for="ItemNoCSV">SKU</Label>
                          <Input
                            type="text"
                            name="ItemNoCSV"
                            id="ItemNoCSV"
                            placeholder="ItemNoCSV"
                            value={objRequest.itemNoCSV || ''}
                            onChange={e => setobjRequest({ ...objRequest, itemNoCSV: e.target.value })}
                            style={{ fontSize: "0.8rem" }}
                          />
                          <FormGroup className="InnerBoxLayout">
                            <Label for="selBrands">Brands</Label>
                            <Select name="selBrands" placeholder='Select Brands'
                              value={selectedBrands}
                              onChange={(val, act) => setselectedBrands(val)}
                              isMulti isClearable={true} options={ddlBrands} />
                          </FormGroup>
                        </FormGroup>
                      </div>
                      <div className="BoxLayout colShadow" >
                        <FormGroup className="InnerBoxLayout">
                          <Label for="productName">Product Name</Label>
                          <Input
                            type="text"
                            name="productName"
                            id="productName"
                            placeholder="Product Name"
                            value={objRequest.productName || ''}
                            onChange={e => setobjRequest({ ...objRequest, productName: e.target.value })}
                            style={{ fontSize: "0.8rem" }}
                          />
                        </FormGroup>
                        <FormGroup className="InnerBoxLayout" style={{ marginTop: "30px" }}>
                          {isloading && <Spinner animation="border" variant="primary" />}
                          {!isloading && <Button className="btn btn-success" onClick={e => handleSearch(e)} style={{ fontSize: "0.8rem", width: "40%", marginLeft: "5%" }}  >Search</Button>}
                          <Button className="btn btn-primary" onClick={e => handleReset(e)} style={{ fontSize: "0.8rem", width: "40%", marginLeft: "5%" }}  >Reset</Button>
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
              <Modal show={showCreate} onHide={handleClose}>
                <Modal.Header closeButton>
                  <Modal.Title>Create Celebrity Campaign</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Selected Skus:
                  <div className="d-inline-flex  flex-wrap">
                    {
                      selectedItems && selectedItems.map((obj) => {
                        const { id, itemNo } = obj;
                        return (
                          <span key={id} className=" m-2"  >
                            {itemNo}
                          </span>
                        )
                      })
                    }
                  </div>
                  <div className="row">
                    <FormGroup className="col-sm-10 InnerBoxLayout">
                      <Label for="title">Title</Label>
                      <Input
                        type="text"
                        name="title"
                        id="title"
                        placeholder="Title"
                        value={campObj.title || ''}
                        onChange={e => setcampObj({ ...campObj, title: e.target.value })}
                        style={{ fontSize: "0.8rem" }}
                      />
                    </FormGroup>
                  </div>
                  <div className="row">
                    <FormGroup className="col-sm-10 InnerBoxLayout">
                      <Select name="selCeleb" placeholder='Select Celebrity'
                        value={selectedCelebrity}
                        onChange={(val, act) => setselectedCelebrity(val)}
                        isClearable={true} options={ddlcelebrity} />
                    </FormGroup>
                  </div>
                  <div className="row ">
                    <FormGroup className="col-sm-5 InnerBoxLayout">
                      <Label for="fromDate">From Date </Label>
                      <Input
                        type="date"
                        name="fromDate"
                        id="fromDate"
                        placeholder="From date"
                        value={campObj.fromDate || ''}
                        onChange={e => setcampObj({ ...campObj, fromDate: e.target.value })}
                        style={{ fontSize: "0.8rem" }}
                      />
                    </FormGroup>
                    <FormGroup className=" col-sm-5 InnerBoxLayout">
                      <Label for="toDate">To Date</Label>
                      <Input
                        type="date"
                        name="toDate"
                        id="toDate"
                        placeholder="To date"
                        value={campObj.toDate || ''}
                        onChange={e => setcampObj({ ...campObj, toDate: e.target.value })}
                        style={{ fontSize: "0.8rem" }}
                      />
                    </FormGroup>
                  </div>
                  <div className="row" >
                    <FormGroup className="col-sm-5 InnerBoxLayout">
                      <Label for="commission">Extra Commission </Label>
                      <Input
                        type="number"
                        name="commission"
                        id="commission"
                        placeholder="Commission"
                        value={campObj.commission || 0}
                        onChange={e => setcampObj({ ...campObj, commission: +e.target.value })}
                        style={{ fontSize: "0.8rem" }}
                      />
                    </FormGroup>
                    <FormGroup className="col-sm-6 InnerBoxLayout">
                      <Button color="primary" className="mt-4  float-right" onClick={handleCreate}   >Create</Button>
                    </FormGroup>
                  </div>
                  {createRes.length > 0 && <BootstrapTable
                    keyField="celebrityId"
                    data={createRes}
                    columns={columns}
                    rowStyle={rowStyle2}
                    classes="customTable"
                    expandRow={expandRow}
                  />}
                </Modal.Body>
                <Modal.Footer>

                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
          <Row>
            {isloading && <Spinner animation="border" variant="primary" />}
            {!isloading && items && items.map(obj => {
              return (
                <Catalogitem key={obj.id} item={obj} handleChkBox={handleChkBox} />)
            })}
          </Row>
          <div className="clearfix border ">
            <Pagination className="m-2 float-left"
              showTotal={showTotal}
              pageSize={pageSize}
              onChange={onChangePage}
              current={current}
              locale={localeInfo}
              total={tolalSize}
            />
            <select
              className="m-2 btn-secondary float-right"
              name="drpOrderNotes"
              value={pageSize}
              onChange={pageDropChange}
              style={{ fontSize: "0.8rem" }}>
              <option value="12">12</option>
              <option value="15"> 15</option>
              <option value="18"> 18</option>
              <option value="21"> 21</option>
            </select>
          </div>
        </CardBody>
      </Card>

   </Page>
  );
}

export default Catalog;
