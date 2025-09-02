import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {
  Card,  CardHeader,  CardBody,  Col,
  Row,  Table,  Button,  FormGroup,
  Input,  Label} from 'reactstrap';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import Page from 'components/Page';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import * as common from 'network/index';
import {BASE_URL as API_URL } from 'network';
import {  listMappedCelebrityAction} from 'actions/celebrityActions/CelebrityActions';
import Select from 'react-select';
const AddressMaster = () => {
  const [magentoUserId, setMagentoUserId] = useState(
    JSON.parse(localStorage.getItem('userData')).magentoUserId,
  );
  const [addressgrid, setaddressgrid] = useState([]);
  const ddlCeleb = useSelector((state) => state.CelebrityReducer.listCelebrity);
  const [selectedCelebrity, setselectedCelebrity] = useState();
  const dispatch = useDispatch();
  useEffect(() => {
    // Celebrities Drop
    const getCeleb = async ()=>{
      if (ddlCeleb.length ===0)
      {
        await dispatch(listMappedCelebrityAction({userid: magentoUserId}));
      }
    }
    getCeleb();
    // axios
    //   .post(`${API_URL}CelebrityRegister/GetMappedCelebrites`, {
    //     userid: magentoUserId,
    //   })
    //   .then(res => {
    //     const { result } = res.data;
    //     setcelebDrop(result);
    //   });
  }, []);

  const BINDGRID = e => {
    let id = e.target.value;
    if (id !== '0') {
      common.apiCall2('GET',`AddressMaster/GetCelebritiesAddress/${id}`)
        .then(res => {
          setaddressgrid(res.data);
          if(res.data.length==0)
          toast.info("No Records Found");
        });
      return;
    }
    setaddressgrid([]);
  };
  const handleSelectCelebChange=(val,act)=>{
    console.log("val,act",val,act);
    setselectedCelebrity(val);
    if(act.action==='select-option')
    { let id = +val.value;
      if (id !== '0') {
      common.apiCall2('GET',`AddressMaster/GetCelebritiesAddress/${id}`)
        .then(res => {
          setaddressgrid(res.data);
          if(res.data.length==0)
          toast.info("No Records Found");
        });
      return;
      }
  }
    else if(act.action==="clear")
    {
      setselectedCelebrity(null);
      setaddressgrid([]);
    }
  }

  const DEACTIVATE = id => {
    if (window.confirm('Are you sure .. ?')){
      common.apiCall2('GET',`AddressMaster/DeactivateAddress/${id}`).then(res => {
        toast.success('Deactivated');
        setaddressgrid(res.data);
      });
    }
   
  };

  return (
    <Page >
      <Row>
        <Col>
          <Card className="mb-3 mt-2">
          <CardHeader>New Address</CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <Card body>
                    <FormGroup row className="ml-2 mt-1">
                      <Label sm={2} style={{ fontSize: '15px' }}>
                        Celebrity Name
                      </Label>
                      <Col sm={3}>
                        {/* <Input
                          style={{ fontSize: '15px' }}
                          type="select"
                          name="celebrityName"
                          onChange={BINDGRID}
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
                        <Select name="selCeleb" placeholder='Select Celebrity'
                          value={selectedCelebrity}
                          onChange={handleSelectCelebChange}
                          isClearable={true} options={ddlCeleb} />

                      </Col>
                      <Col>
                      <Link sm={2}  className="btn btn" to="/addressCreate" style={{'fontSize': '0.9rem'}}   >
                          +Address
                        </Link>
                      </Col>
                    </FormGroup>
                    <FormGroup check row>
                    
                    </FormGroup>
                    <hr />
                    <Table {...{ striped: true }} style={{ fontSize: '14px' }} className="customTable">
                      <thead>
                        <tr>
                          <th>Country</th>
                          <th>City</th>
                          <th>Block</th>
                          <th>Street</th>
                          <th>Building</th>
                          <th>Floor_No</th>
                          <th>Flat_No</th>
                          <th>Phone</th>
                          <th>Deactivate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addressgrid.length > 0 ? (
                          <>
                            {addressgrid.map((address, index) => {
                              const {
                                id,
                                countryCode,
                                city,
                                block,
                                street,
                                building,
                                floorNo,
                                flatNo,
                                phoneNo,
                              } = address;
                              return (
                                <tr key={index}>
                                  <th scope="row">{countryCode}</th>
                                  <td>{city}</td>
                                  <td>{block}</td>
                                  <td>{street}</td>
                                  <td>{building}</td>
                                  <td>{floorNo}</td>
                                  <td>{flatNo}</td>
                                  <td>{phoneNo}</td>
                                  <td><a className="btn btn-sm"  onClick={() => DEACTIVATE(id)} ><FaTrash /></a></td>
                                </tr>
                              );
                            })}
                          </>
                        ) : (
                          <>
                            <tr>
                              <td
                                colSpan={8}
                                className="text-center text-danger"
                              >
                                No Data Found
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </Table>
                  </Card>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Page>
  );
};

export default AddressMaster;
