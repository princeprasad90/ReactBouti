import React, { useEffect, useState } from 'react';
import {  Card,  CardHeader,  CardBody,
  Col,  Row,  Button,  Form,  FormGroup,
  Input,  Label,  CardFooter
} from 'reactstrap';
import Page from 'components/Page';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from "react-redux";
import Loader from 'react-loader-spinner';
import {  listMappedCelebrityAction} from '../../../actions/celebrityActions/CelebrityActions';
import * as common from '../../../network/index';
import { Link } from 'react-router-dom';
import { RoleNames } from 'utils';
import Select from 'react-select';
const AddressCreate = () => {
  const [celebDrop, setcelebDrop] = useState([]);
  const [countryDrop, setcountryDrop] = useState([
    { text: 'KW', value: 'KW' },
    { text: 'QA', value: 'QA' },
    { text: 'AE', value: 'AE' },
    { text: 'OM', value: 'OM' },
    { text: 'BH', value: 'BH' },
    { text: 'SA', value: 'SA' },
    { text: 'IQ', value: 'IQ' },
    // { text: 'JO', value: 'JO' },
    { text: 'OTHERS', value: 'OTHERS' },
  ]);

  const [KWResponse, setKWResponse] = useState([]);
  const [QAResponse, setQAResponse] = useState([]);
  const [AEResponse, setAEResponse] = useState([]);
  const [OMResponse, setOMResponse] = useState([]);
  const [BHResponse, setBHResponse] = useState([]);
  const [SAResponse, setSAResponse] = useState([]);
  const [IQResponse, setIQResponse] = useState([]);
  const [JOResponse, setJOResponse] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [isLoadingAdd, setisLoadingAdd] = useState(false);
  const [cityDrop, setcityDrop] = useState([]);
  const [blockDrop, setblockDrop] = useState([]);
  const [currentUser, setcurrentUser] = useState(
    JSON.parse(localStorage.getItem('userData')),
  );
  const [selectedCelebrity, setselectedCelebrity] = useState();
  const mappedCeleb = useSelector((state) => state.CelebrityReducer.listCelebrity);
  const [celebHeirarchy, setCelebHeirarchy] = useState([]);
  const [ddlCeleb, setDdlCeleb] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const dispatch = useDispatch();
  let errorMessages = [];

  const [addressMaster, setaddressMaster] = useState({
    id: 0,
    name: '',
    celebrityCode: '0',
    countryCode: '0',
    civilId: '',
    city: '0',
    block: '0',
    street: '',
    building: '',
    flatNo: '',
    floorNo: '',
    postalCode: '',
    phoneNo: '',
    email: '',
    magentoCustomerId: 0,
    insertedBy: currentUser.userName,
  });

  useEffect(() => {
    // Celebrities Drop
    const getCeleb = async ()=>{
      if (userData.roles.includes(RoleNames.CelebSuperAdmin)) {
        let output = await common.apiCall2('POST', "ApprovalMatrix/GetCelebHeirarchy", {});
        let celebHierarchyTemp = output.data.result;
        setCelebHeirarchy(celebHierarchyTemp);
      }
      if (mappedCeleb.length ===0)
      {
        await dispatch(listMappedCelebrityAction({userid : userData.magentoUserId}));
      }
    }
    getCeleb();

  }, []);

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

 

  const handleSelectCelebChange=(val,act)=>{
      setselectedCelebrity(val);
    if(act.action==='select-option')
    {
      setaddressMaster({
      ...addressMaster,
      celebrityCode: +val.value,
      magentoCustomerId: +val.magentoCustomerId
    });
  }
    else if(act.action==="clear")
    {
      setselectedCelebrity(null);
      setaddressMaster({
        ...addressMaster,
        celebrityCode: 0,
        magentoCustomerId: 0
      });
    }
  }


  const BINDBLOCK = e => {
    let cityValue = e.target.value;
    let specificArr = [];
    setblockDrop([]);

   // let tempBlock = addressMaster.countryCode ==='IQ'?'1':'0';
    setaddressMaster({
      ...addressMaster,
      city: cityValue,
      block: '0',
    });

    if (cityValue === '0') {
      setblockDrop([]);

      setaddressMaster({
        ...addressMaster,
        city: cityValue,
      });

      return;
    }

    specificArr = cityDrop.filter(a => a.text === cityValue)[0].specificArr;
    setblockDrop([...specificArr]);
  };

  const BINDCITIES = async(e) => {
    setcityDrop([]);
    setblockDrop([]);
    let countryValue = e.target.value;
      setaddressMaster({
        ...addressMaster,
        countryCode: countryValue,
        city: '0',
        block: '0',
      });

      if (countryValue === '0') {
       return;
      }

    if (countryValue === 'OTHERS') {

      setaddressMaster({
        ...addressMaster,
        countryCode: 'OTHERS',
        city: '',
        block: '1',
      });

      return;
    }

    if (countryValue === 'KW' && KWResponse.length > 0) {
      setcityDrop([...KWResponse]);
      return;
    } else if (countryValue === 'QA' && QAResponse.length > 0) {
      setcityDrop([...QAResponse]);
      return;
    } else if (countryValue === 'AE' && AEResponse.length > 0) {
      setcityDrop([...AEResponse]);
      return;
    } else if (countryValue === 'OM' && OMResponse.length > 0) {
      setcityDrop([...OMResponse]);
      return;
    } else if (countryValue === 'BH' && BHResponse.length > 0) {
      setcityDrop([...BHResponse]);
      return;
    } else if (countryValue === 'SA' && SAResponse.length > 0) {
      setcityDrop([...SAResponse]);
      return;
    } else if (countryValue === 'IQ' && IQResponse.length > 0) {
    setcityDrop([...IQResponse]);
    return;
  }
  else if (countryValue === 'JO' && JOResponse.length > 0) {
    setcityDrop([...JOResponse]);
    return;
  }

    setisLoading(true);

 
    common.apiCall2('GET',`AddressMaster/GetCelebritiesProvides/${countryValue}`)
      .then(res => {
        try 
        {
          let { options_list } = res.data;
          let cityKey = Object.keys(options_list)[0];
          if (countryValue === 'KW') {
            let { region_area } = options_list[cityKey];
            var region_areas = Object.keys(region_area).map(key => {
              return region_area[key];
            });
  
            let arr = [];
  
            for (var value of region_areas) {
              if (value.addr_block != undefined) {
                let lista = Object.keys(value.addr_block).map(key => {
                  return value.addr_block[key];
                });
                arr.push({ text: value.region_area_code, specificArr: lista });
              }
            }
  
            setcityDrop([...arr]);
            setKWResponse([...arr]);
            setisLoading(false);
          } else if (countryValue === 'QA') {
            let { city } = options_list[cityKey];
            var region_areas = Object.keys(city).map(key => {
              return city[key];
            });
  
            let arr = [];
            for (var value of region_areas) {
              if (value.english_region_area != undefined) {
                let lista = Object.keys(value.english_region_area).map(key => {
                  return value.english_region_area[key];
                });
                arr.push({ text: value.city_code, specificArr: lista });
              }
            }
            setcityDrop([...arr]);
            setQAResponse([...arr]);
            setisLoading(false);
          } else if (countryValue === 'AE') {
            let { city } = options_list[cityKey];
            var region_areas = Object.keys(city).map(key => {
              return city[key];
            });
  
            let arr = [];
  
            for (var value of region_areas) {
              if (value.region_area != undefined) {
                let lista = Object.keys(value.region_area).map(key => {
                  return value.region_area[key];
                });
                arr.push({ text: value.city_code, specificArr: lista });
              }
            }
            setcityDrop([...arr]);
            setAEResponse([...arr]);
            setisLoading(false);
          } else if (countryValue === 'OM') {
            let { city } = options_list[cityKey];
            var region_areas = Object.keys(city).map(key => {
              return city[key];
            });
  
            let arr = [];
  
            for (var value of region_areas) {
              if (value.english_region_area != undefined) {
                let lista = Object.keys(value.english_region_area).map(key => {
                  return value.english_region_area[key];
                });
                arr.push({ text: value.city_code, specificArr: lista });
              }
            }
            setcityDrop([...arr]);
            setOMResponse([...arr]);
            setisLoading(false);
          } else if (countryValue === 'BH') {
            let { city } = options_list[cityKey];
            var region_areas = Object.keys(city).map(key => {
              return city[key];
            });
  
            let arr = [];
  
            for (var value of region_areas) {
              if (value.english_region_area != undefined) {
                let lista = Object.keys(value.english_region_area).map(key => {
                  return value.english_region_area[key];
                });
                arr.push({ text: value.city_code, specificArr: lista });
              }
            }
            setcityDrop([...arr]);
            setBHResponse([...arr]);
            setisLoading(false);
          } else if (countryValue === 'SA') {
            let { city } = options_list[cityKey];
            var region_areas = Object.keys(city).map(key => {
              return city[key];
            });
  
            let arr = [];
  
            for (var value of region_areas) {
              if (value.english_region_area != undefined) {
                let lista = Object.keys(value.english_region_area).map(key => {
                  return value.english_region_area[key];
                });
                arr.push({ text: value.city_code, specificArr: lista });
              }
            }
            setcityDrop([...arr]);
            setSAResponse([...arr]);
            setisLoading(false);
          }
         else if (countryValue === 'IQ') {
          let { city } = options_list[cityKey];
          var region_areas = Object.keys(city).map(key => {
            return city[key];
          });
          let arr = [];

          for (var value of region_areas) {
            if (value.english_region_area != undefined) {
              let lista = Object.keys(value.english_region_area).map(key => {
                return value.english_region_area[key];
              });
              arr.push({ text: value.city_code, specificArr: lista });
            }
            else{
              arr.push({ text: value.city_code, specificArr: [] });
            }
          }
          setcityDrop([...arr]);
          setIQResponse([...arr]);
          setisLoading(false);
        }
        else if (countryValue === 'JO') {
          let { city } = options_list[cityKey];
          var region_areas = Object.keys(city).map(key => {
            return city[key];
          });
          let arr = [];

          for (var value of region_areas) {
            if (value.english_region_area != undefined) {
              let lista = Object.keys(value.english_region_area).map(key => {
                return value.english_region_area[key];
              });
              arr.push({ text: value.city_code, specificArr: lista });
            }
            else{
              arr.push({ text: value.city_code, specificArr: [] });
            }
          }
          setcityDrop([...arr]);
          setJOResponse([...arr]);
          setisLoading(false);
        }
        }
        catch
        {setisLoading(false);
          toast.warning("API is Not Responding.Please try again Later");
        }

        });



        
        
  };

  const VALIDATION = model => {
    let validation = true;
    errorMessages = [];
    if (model.name === '') {
      errorMessages.push('Name is required');
      validation = false;
    }

    if (model.celebrityCode === '0') {
      errorMessages.push('Celebrity Code is required');
      validation = false;
    }

    if (model.countryCode === '0') {
      errorMessages.push('Country Code is required');
      validation = false;
    }

    if (model.city === '0'||model.city ==='') {
      errorMessages.push('City is required');
      validation = false;
    }

    if (model.block === '0') {
      errorMessages.push('Block is required');
      validation = false;
    }

    if (model.street === '') {
      errorMessages.push('Street is required');
      validation = false;
    }

    if (model.building === '') {
      errorMessages.push('Building is required');
      validation = false;
    }

    if (model.flatNo === '') {
      errorMessages.push('Flat No is required');
      validation = false;
    }

    if (model.floorNo === '') {
      errorMessages.push('Floor No is required');
      validation = false;
    }

    if (model.postalCode === '') {
      errorMessages.push('Postal Code is required');
      validation = false;
    }

    if (model.phoneNo === '') {
      errorMessages.push('Phone No is required');
      validation = false;
    }

    if (model.email === '') {
      errorMessages.push('Email is required');
      validation = false;
    }

     if(model.countryCode==='SA' && model.civilId.length!==10)
     {      
        errorMessages.push('Civil Id is required and length must be 10');
        validation = false; 
     }
    return validation;
  };

  const ADDRRESSCREATE = () => {
    if ((addressMaster.countryCode === 'OTHERS')/*||(addressMaster.countryCode === 'IQ')*/) {
      setaddressMaster({
        ...addressMaster,
        block: '1',
      });
    }
    let validation = VALIDATION(addressMaster);
    if (!validation) {
      let msg = '';
      errorMessages.forEach(v => {
        msg += v + ` , `;
      });
      toast.error(msg);
    } else {
      setisLoadingAdd(true);
      document.getElementById("BtnAddressCreate").setAttribute("disabled", "disabled");
      let request = {...addressMaster};
      if (request.countryCode === 'OTHERS')
      {
        request.countryCode ='KW';
      }
      common.apiCall2('POST',`AddressMaster/SaveAddress`, request)
        .then(res => {
          setisLoadingAdd(false);
          toast.info(res.data);
          document.getElementById("BtnAddressCreate").removeAttribute("disabled");
          setaddressMaster({
            id: 0,
            name: '',
            celebrityCode: 0,
            countryCode: '0',
            civilId: '',
            city: '0',
            block: '0',
            street: '',
            building: '',
            flatNo: '',
            floorNo: '',
            postalCode: '',
            phoneNo: '',
            email: '',
            magentoCustomerId: 0,
            insertedBy: currentUser.userName,
          });
        });
    }
  };
  
  return (
    <Page className="TablePage">
      <Row >
        <Col>
          <Card className="mb-3">
            <CardHeader>CREATE NEW ADDRESS</CardHeader>
            <CardBody>
              <div className="row  m-1" style={{ fontSize: "0.8rem" }}>
                <div className="BoxLayout  colShadow"  >
                  <FormGroup className="InnerBoxLayout">
                    <Label for="name">Celebrity Name</Label>
                    {/* <Input
                      style={{ fontSize: '15px' }}
                      type="select"
                      name="name"
                      id="name"
                      value={addressMaster.celebrityCode || 0}
                      onChange={BINDCUSTOMERID}
                    >
                      <option value="0">-- Select --</option>
                      {ddlCeleb.map((celeb, index) => {
                        const { celebrityCode, name_EN } = celeb;
                        return (
                          <option key={index} value={celebrityCode}>
                            {name_EN}
                          </option>
                        );
                      })}
                    </Input> */}
                     <Select name="selCeleb" placeholder='Select Celebrity' menuPlacement="auto"
    menuPosition="fixed"
                    value={selectedCelebrity}
                   onChange={handleSelectCelebChange}
                    isClearable={true} options={ddlCeleb} />

                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Label for="name">Email</Label>
                          <Input
                            style={{ fontSize: '15px' }}
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={addressMaster.email || ''}
                            onChange={e =>
                              setaddressMaster({
                                ...addressMaster,
                                email: e.target.value,
                              })
                            }
                          />

                  </FormGroup>
                </div>
                <div className="BoxLayout  colShadow" >
                  <FormGroup className="InnerBoxLayout">
                    <Label for="name">FullName </Label>
                    <Input
                      style={{ fontSize: "0.8rem" }}
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Name"
                      value={addressMaster.name || ''}
                      onChange={e =>
                        setaddressMaster({
                          ...addressMaster,
                          name: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Label for="phoneNo">Mobile </Label>
                    <Input
                      style={{ fontSize: "0.8rem" }}
                      type="text"
                      name="phoneNo"
                      id="phoneNo"
                      placeholder="Mobile"
                      value={addressMaster.phoneNo || ''}
                      onChange={e =>
                        setaddressMaster({
                          ...addressMaster,
                          phoneNo: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Label for="civilId">Civil Id </Label>
                    <Input
                      style={{ fontSize: "0.8rem" }}
                      type="text"
                      name="civilId"
                      id="civilId"
                      placeholder="civil Id"
                      value={addressMaster.civilId || ''}
                      onChange={e =>
                        setaddressMaster({
                          ...addressMaster,
                          civilId: e.target.value,
                        })
                      }
                    />

                  </FormGroup>
                </div>
                <div className="BoxLayout  colShadow" >
                  <FormGroup className="InnerBoxLayout">
                    <Label for="countryCode"> Country </Label>
                    <Input
                      style={{ fontSize: '15px' }}
                      type="select"
                      name="countryCode"
                      id="countryCode"
                      value={addressMaster.countryCode || ''}
                      onChange={BINDCITIES}
                    >
                      <option value="0">-- Select --</option>
                      {countryDrop.map((country, index) => {
                        const { text, value } = country;
                        return (
                          <option key={value} value={value}>
                            {text}
                          </option>
                        );
                      })}
                    </Input>
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Label for="city">City </Label>
                    {isLoading && (
                      <Loader
                        type="Oval"
                        color="#00BFFF"
                        height={30}
                        width={30}
                      />
                    )}

                    {addressMaster.countryCode != 'OTHERS' ? (
                      <>
                        <Input
                          style={{ fontSize: '15px' }}
                          type="select"
                          name="city"
                          id="city"
                          value={addressMaster.city || ''}
                          onChange={BINDBLOCK}
                        >
                          <option value="0">-- Select --</option>
                          {cityDrop.map((city, index) => {
                            const { text, specificArr } = city;
                            return (
                              <option key={index} value={text}>
                                {text}
                              </option>
                            );
                          })}
                        </Input>
                      </>
                    ) : (
                      <>
                        {' '}
                        <Input
                          style={{ fontSize: '15px' }}
                          type="text"
                          name="city"
                          placeholder="City"
                          value={addressMaster.city || ''}
                          onChange={e =>
                            setaddressMaster({
                              ...addressMaster,
                              city: e.target.value,
                            })
                          }
                        />
                      </>
                    )}
                  </FormGroup>
                  <FormGroup className="InnerBoxLayout">
                    <Label for="block">Block </Label>
                    {addressMaster.countryCode != 'OTHERS' /*&& addressMaster.countryCode != 'IQ'*/ ? (
                      <>
                        {' '}
                        <Input
                          style={{ fontSize: '15px' }}
                          type="select"
                          name="block"
                          id="block"
                          value={addressMaster.block || ''}
                          onChange={e =>
                            setaddressMaster({
                              ...addressMaster,
                              block: e.target.value,
                            })
                          }
                        >
                          <option value="0">-- Select --</option>
                          {blockDrop.map((block, index) => {
                            return (
                              <option key={index} value={block}>
                                {block}
                              </option>
                            );
                          })}
                        </Input>
                      </>
                    ) : (
                      <>
                        {' '}
                        <Input
                          style={{ fontSize: '15px' }}
                          type="text"
                          name="block"
                          placeholder="Block"
                          disabled={true}
                          value={addressMaster.block || '1'}
                          onChange={e =>
                            setaddressMaster({
                              ...addressMaster,
                              block: e.target.value,
                            })
                          }
                        />
                      </>
                    )}

                  </FormGroup>
                </div>
                <div className="BoxLayout  colShadow" >
                  <Row>
                    <Col>
                      <FormGroup className="InnerBoxLayout">
                        <Label for="street">Street </Label>
                        <Input
                          style={{ fontSize: '15px' }}
                          type="text"
                          name="street"
                          id="street"
                          placeholder="street"
                          value={addressMaster.street || ''}
                          onChange={e =>
                            setaddressMaster({
                              ...addressMaster,
                              street: e.target.value,
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup className="InnerBoxLayout">
                        <Label for="building">Building </Label>
                        <Input
                          style={{ fontSize: '15px' }}
                          type="text"
                          name="building"
                          id="building"
                          placeholder="building"
                          value={addressMaster.building || ''}
                          onChange={e =>
                            setaddressMaster({
                              ...addressMaster,
                              building: e.target.value,
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FormGroup className="InnerBoxLayout">
                        <Label for="floorNo">Floor </Label>
                        <Input
                          style={{ fontSize: '15px' }}
                          type="text"
                          name="floorNo"
                          id="floorNo"
                          placeholder="floor No"
                          value={addressMaster.floorNo || ''}
                          onChange={e =>
                            setaddressMaster({
                              ...addressMaster,
                              floorNo: e.target.value,
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup className="InnerBoxLayout">
                        <Label for="flatNo">Flat </Label>
                        <Input
                          style={{ fontSize: '15px' }}
                          type="text"
                          name="flatNo"
                          id="flatNo"
                          placeholder="flat No"
                          value={addressMaster.flatNo || ''}
                          onChange={e =>
                            setaddressMaster({
                              ...addressMaster,
                              flatNo: e.target.value,
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup className="InnerBoxLayout">
                    <Label for="postalCode">Postal Code </Label>
                    <Input
                      style={{ fontSize: '15px' }}
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      placeholder="postal Code"
                      value={addressMaster.postalCode || ''}
                      onChange={e =>
                        setaddressMaster({
                          ...addressMaster,
                          postalCode: e.target.value,
                        })
                      }
                    />

                  </FormGroup>
                </div>
              </div>

            </CardBody>
            <CardFooter>                    
               <FormGroup row>
              <Col sm={{ size: 7,  offset: 3 }} >
                {isLoadingAdd && (
                  <Loader
                    type="Oval"
                    color="#00BFFF"
                    height={30}
                    width={30}
                  />
                )}
                <Button id="BtnAddressCreate" className="btn btn-success" onClick={ADDRRESSCREATE} style={{ fontSize: "0.8rem", width: "20%", marginLeft: "5%" }}  >Create</Button>
                <Link to="/addressMaster" className="btn btn-primary " style={{ fontSize: "0.8rem", width: "20%", marginLeft: "5%" }}>Back</Link>
              </Col>
            </FormGroup></CardFooter>
          </Card>
        </Col> 
      </Row> 

    </Page>
  );
};

export default AddressCreate;
