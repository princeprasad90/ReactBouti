import React, { useEffect, useState } from 'react';
import {  Card,  CardBody,  CardHeader,  Col,
  Row,  Button,  Form,  FormGroup,  Input,  Label,
} from 'reactstrap';
import PageSpinner from 'components/PageSpinner';
import { FaSave } from "react-icons/fa";
import Page from 'components/Page';
import {  toast } from 'react-toastify';
import * as common from '../../../network/index';
function RuleMaster() {

  const [rulesRadios, setrulesRadios] = useState([]);
  const [isSettuped, setisSettuped] = useState(false);

  // useEffect(() => {
  //   axios.get(`${API_URL}Master/GetRulesByType/Exclusive`).then(res => {
  //     console.log(res.data);
  //     setrulesRadios(res.data);
  //   });
  // }, []);

  useEffect(() => {
    common.apiCall2('GET',`Master/GetRulesByType/Exclusive`).then(res => {
      setrulesRadios(res.data);
    });
  }, []);

  const SETRULE = item => {
    const { ruleId } = item;
    const rules = rulesRadios.map(item => {
      if (item.ruleId === ruleId) {
        item.isActive = 1;
      } else {
        item.isActive = 0;
      }
      return item;
    });

    setrulesRadios([...rules]);
  };

  const SAVERULE = () => {
    setisSettuped(true);
    let rule = rulesRadios.filter(r => r.isActive)[0];
    common.apiCall2('POST',`Master/SetUpRule`, rule).then(res => {
      setisSettuped(false);
      toast.info(res.data);
    });
  };

  return (
    <Page className="TablePage">
      <Row>
        <Col>
          <Card className="mb-3  mt-2">
          <CardHeader>Rule Master</CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <Card body>
                    <Form className="ml-4">
                      <FormGroup tag="fieldset" row>
                        <Col sm={10}>
                          {rulesRadios.map((rule, index) => {
                            const { ruleName, ruleId, isActive } = rule;
                            return (
                              <FormGroup check key={index}>
                                <Label check>
                                  <Input
                                    type="radio"
                                    name="setupRadio"
                                    value={ruleId}
                                    checked={isActive}
                                    onChange={() => SETRULE(rule)}
                                  />
                                  {ruleName}
                                </Label>
                              </FormGroup>
                            );
                          })}
                        </Col>
                      </FormGroup>
                      {/* <Button color="primary" onClick={SAVERULE}>
                        SAVE
                      </Button> */}
                      <div style={{ float: 'left', position: 'relative' }}>
                        <a href="#" onClick={SAVERULE} color="primary" className="caret btn-sm mr-10">Save
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

export default RuleMaster;
