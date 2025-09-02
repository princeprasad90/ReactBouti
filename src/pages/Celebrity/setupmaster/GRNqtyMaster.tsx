import React, { useEffect, useState } from 'react';
import {  Card,  CardBody,  CardHeader,  Col,
  Row,  Button,  Form,  FormGroup,
  Input,  Label,} from 'reactstrap';
import PageSpinner from 'components/PageSpinner';
import Page from 'components/Page';
import {  toast } from 'react-toastify';
import * as common from '../../../network/index';

function GRNqtyMaster() {
  const [ruleGRNQty, setruleGRNQty] = useState({});
  const [initGrnPer,setinitGrnPer]=useState();
  const [isSettuped, setisSettuped] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData"));

  const getGRNPercentage= ()=>{
    common.apiCall2('GET',`Master/GetRulesByType/GRNQtyPercentage`).then(res => {
      setruleGRNQty(res.data[0]);
      setinitGrnPer(res.data[0].ruleValue);
    });
  }
  useEffect(() => {
    getGRNPercentage();
  }, []);


 
  const handleOnChanges = (val)=>{
   setruleGRNQty((prev)=>({
    ...prev,
    ruleValue: Number(val),
    updatedBy:userData.userName
  }));

  }
  const SAVERULE = () => {
    setisSettuped(true);
    common.apiCall2('POST',`Master/SetUpRule`, ruleGRNQty).then(res => {
      setisSettuped(false);
      toast.info(res.data);
      getGRNPercentage();
    });
   
  };


  return (
    <Page className="TablePage">
      <Row>
        <Col>
          <Card className="mb-3  mt-2">
          <CardHeader>GRN Ratio Master</CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <Card body>
                    <Form className="ml-4">

                      { (ruleGRNQty!==null) &&
                      <FormGroup tag="fieldset" row>
                        <Col sm={10}>
                         
                              <FormGroup check >
                                <Label > Current GRN Percentage :
                                {" "+initGrnPer} 
                                </Label>
                                  <Input
                                    type="number"
                                     name="GRNQtyPer"
                                     id="GRNQtyPer"
                                    defaultValue={ruleGRNQty.ruleValue}
                                    className='col-sm-3'
                                     onChange={e=>handleOnChanges(e.target.value)}
                                  />
                                 
                              </FormGroup>
                      
                        </Col>
                      </FormGroup>
                      }

                      <div style={{ float: 'left', position: 'relative' }}>
                        <a href="#" onClick={SAVERULE} color="primary" className="caret btn-sm mr-10">Update
                        </a>
                      </div>
                      {isSettuped && <PageSpinner />}
                    </Form>
                  </Card>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Page>
  );
}

export default GRNqtyMaster;
