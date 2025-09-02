import React, { useEffect, useState } from 'react';
import {
  Card,  CardBody,  CardHeader,  Col,  Row,  Table,  Button,  Form,
  FormGroup,  Input,  Label,  Modal,  ModalBody,  ModalFooter,Badge
} from 'reactstrap';
import { FaEdit } from 'react-icons/fa';

import Page from 'components/Page';
import { toast } from 'react-toastify';
import * as commonApi from '../../../network/index';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import { BsFlagFill } from "react-icons/bs";
const ApprovalMatrix = () => {
  const [appovalMatrix, setappovalMatrix] = useState({
    id: 0,
    userId: 0,
    approvar1: '',
    delegate1: '',
    approvar2: '',
    delegate2: '',
    approvar3: '',
    delegate3: '',
  });

  const [coordinatorsDrop, setcoordinatorsDrop] = useState([]);
  const [approvalMatricesDrop, setapprovalMatricesDrop] = useState([]);
  const [approvalMatricesGrid, setapprovalMatricesGrid] = useState([]);
  const [approvalDelegate1, setapprovalDelegate1] = useState([]);
  const [approvalDelegate2, setapprovalDelegate2] = useState([]);
  const [approvalDelegate3, setapprovalDelegate3] = useState([]);
  const [modal, setModal] = useState(false);
  const [counter, setcounter] = useState(0);
  const [approvalMatricesTable, setapprovalMatricesTable] = useState([]);

  const Columns = [{ dataField: 'idWithFlag', text: '#' },
  { dataField: 'coordinator', text: 'User ID', filter: textFilter() },
  { dataField: 'approvar1', text: 'Approver 1' },
  { dataField: 'delegate1', text: 'Delegate 1' },
  { dataField: 'editLink', text: 'Edit' }
    ];
  useEffect(() => {
    // Coordinators Drop
      commonApi.apiCall2('GET','UserRegister/GetCoordinatorRegisterList').then(res=>{
        setcoordinatorsDrop(res.data);
      });
    //  Approval Drop
    commonApi.apiCall2('GET',`UserRegister/GetUserManagerList`).then(res => {
      setapprovalMatricesDrop(res.data);
    });

    // Manager Grid

    commonApi.apiCall2('GET',`ApprovalMatrix/GetApprovalMatrixList`).then(res => {
      setapprovalMatricesGrid(res.data);
    });
  }, [counter]);
useEffect(() => {
  let listforTable = [];
  approvalMatricesGrid.forEach(obj=>{
    let temp = {...obj};
    let badge="";
  if (obj.isManager){
    badge = <Badge className="m-1" color="success" ><BsFlagFill /></Badge>
  }
  temp.idWithFlag = <span>{obj.id} {badge} </span> ;
    temp.editLink =   <a style={{cursor:'pointer',color:'blue'}} className=" m-1 " onClick={() => BINDCOORDINATOR(obj)}><FaEdit /></a>;
    listforTable.push(temp);
  });

  setapprovalMatricesTable([...listforTable]);
}, [approvalMatricesGrid])

  const BINDCOORDINATOR = item => {
    setModal(!modal);
console.log("item",item);
    if (item.approvar1Id === '') {
      setapprovalDelegate1([]);
    } else {
      setapprovalDelegate1([...approvalMatricesDrop]);
    }

    if (item.approvar2Id === '') {
      setapprovalDelegate2([]);
    } else {
      setapprovalDelegate2([...approvalMatricesDrop]);
    }

    if (item.approvar3Id === '') {
      setapprovalDelegate3([]);
    } else {
      setapprovalDelegate3([...approvalMatricesDrop]);
    }

    setappovalMatrix({
      id: item.id,
      userId: item.coordinatorId,
      approvar1: item.approvar1Id,
      delegate1: item.delegate1Id,
      approvar2: item.approvar2Id,
      delegate2: item.delegate2Id,
      approvar3: item.approvar3Id,
      delegate3: item.delegate3Id,
      isManager:item.isManager
    });
  };

  const BINDDELEGATE1 = e => {
    setappovalMatrix({
      ...appovalMatrix,
      [e.target.name]: e.target.value,
      approvar2: '',
      delegate1: '',
      delegate2: '',
      approvar3: '',
      delegate3: '',
    });
    setapprovalDelegate2([]);

    let val = e.target.value;
    if (val === '') {
      setapprovalDelegate1([]);
      return;
    }
    setapprovalDelegate1([...approvalMatricesDrop]);
  };

  const BINDDELEGATE2 = e => {
    setappovalMatrix({
      ...appovalMatrix,
      [e.target.name]: e.target.value,
      approvar3: '',
      delegate2: '',
    });
    setapprovalDelegate3([]);
    let val = e.target.value;
    if (val === '') {
      setapprovalDelegate2([]);
      return;
    }
    setapprovalDelegate2([...approvalMatricesDrop]);
  };

  const BINDDELEGATE3 = e => {
    setappovalMatrix({
      ...appovalMatrix,
      [e.target.name]: e.target.value,
    });

    let val = e.target.value;
    if (val === '') {
      setapprovalDelegate3([]);
      return;
    }
    setapprovalDelegate3([...approvalMatricesDrop]);
  };

  const ADDAPPROVALMATRIX = _ => {
    if (appovalMatrix.approvar1 === '') {
      toast.error('Approver1 is required');
      return;
    }

    setappovalMatrix({ ...appovalMatrix, approvar1: +appovalMatrix.approvar1 });

   commonApi.apiCall2('POST','ApprovalMatrix/UpdateApprovalMatrix',appovalMatrix).then(res=>{
    toast.info(res.data);
    setcounter(counter => counter + 1);
    setModal(!modal);
   })

  };

  return (
    <Page >

      <Modal isOpen={modal} size="md">
        <ModalBody>
          <Card body>
            <Form>
              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Account Manager
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="select"
                    name="userId"
                    value={appovalMatrix.userId || 0}
                    disabled={true}
                    onChange={e =>
                      setappovalMatrix({
                        ...appovalMatrix,
                        userId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select --</option>
                    {coordinatorsDrop && coordinatorsDrop.map((coDrop, index) => {
                      const { magentoUserId, userName } = coDrop;
                      return (
                        <option key={index} value={magentoUserId}>
                          {userName}
                        </option>
                      );
                    })}
                  </Input>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                Approver 1
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="select"
                    name="approvar1"
                    disabled={appovalMatrix.isManager}
                    value={appovalMatrix.approvar1 || 0}
                    onChange={BINDDELEGATE1}
                  >
                    <option value="">-- Select --</option>
                    {approvalMatricesDrop && approvalMatricesDrop.map((approvalMatrixDrop, index) => {
                      const { magentoUserId, userName } = approvalMatrixDrop;
                      return (
                        <option key={index} value={magentoUserId}>
                          {userName}
                        </option>
                      );
                    })}
                  </Input>
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label sm={3} style={{ fontSize: '15px' }}>
                  Delegate 1
                </Label>
                <Col sm={9}>
                  <Input
                    style={{ fontSize: '15px' }}
                    type="select"
                    name="delegate1"
                    disabled={!appovalMatrix.isManager}
                    value={appovalMatrix.delegate1 || 0}
                    onChange={e =>
                      setappovalMatrix({
                        ...appovalMatrix,
                        delegate1: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select --</option>
                    {approvalDelegate1.map((delegate, index) => {
                      const { magentoUserId, userName } = delegate;
                      return (
                        <option key={index} value={magentoUserId}>
                          {userName}
                        </option>
                      );
                    })}
                  </Input>
                </Col>
              </FormGroup>

             
            </Form>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={ADDAPPROVALMATRIX} style={{'fontSize' : '1.2rem'}}>
            SAVE
          </Button>
          <Button color="danger" onClick={() => { setModal(!modal); }}>
            CLOSE
          </Button>
        </ModalFooter>
      </Modal>

      <Row>
        <Col>
          <Card className="mb-3">
          <CardHeader>Approval Matrix </CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <Card body>
                  <BootstrapTable id="approvalMatrix" bootstrap4 keyField='id' classes="customTable"
                   data={approvalMatricesTable} columns={Columns} filter={ filterFactory()}
                    pagination={paginationFactory()} />
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

export default ApprovalMatrix;
