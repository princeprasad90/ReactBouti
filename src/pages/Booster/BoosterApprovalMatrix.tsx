import React, { useEffect, useState } from 'react';
import Page from 'components/Page';
import { Spinner } from 'react-bootstrap';
import { Card, CardBody, CardHeader, Col, Row, Alert } from 'reactstrap';
import * as common from '../../network/index';
import { toast } from 'react-toastify';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { FaSave } from 'react-icons/fa';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';

const BoosterApprovalMatrix = args => {
  const [approvalMatrixGrid, setapprovalMatrixGrid] = useState([]);
  const [isDataLoaded, setisDataLoaded] = useState(false);
  const [gridDropdowns, setgridDropdowns] = useState({});
  const [delegatedUsers, setdelegatedUsers] = useState();
  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    LoadDelegatedUsers();
    LoadGridDropDowns();
  }, []);

  const LoadDelegatedUsers = async () => {
    let output = await common.apiCall2(
      'GET',
      `api/boosterApprovalMatrix/delegated-users`,
    );
    const { data } = output.data;
    setdelegatedUsers(data);
  };

  const LoadGridDropDowns = async () => {
    let output = await common.apiCall2(
      'GET',
      `api/boosterApprovalMatrix/get-grid-selet`,
    );
    const { data } = output.data;
    const dropDownsOptions = {
      ...data,
      seniors: [{ value: '', label: '' }, ...data.seniors],
    };
    setgridDropdowns(dropDownsOptions);
    await LoadApprovalMatrixGrid();
  };

  const LoadApprovalMatrixGrid = async () => {
    let output = await common.apiCall2(
      'GET',
      `api/boosterApprovalMatrix/get-all`,
    );
    const { data } = output.data;
    setisDataLoaded(true);
    setapprovalMatrixGrid(data);
  };

  const ActionButton = (cell, row, rowIndex, formatExtraData) => {
    if (userData.roleId == 15) {
      return (
        <FaSave
          style={{ cursor: 'pointer', color: 'steelblue' }}
          onClick={() => onFollowChanged(row)}
        />
      );
    }

    return null;
  };

  const handleValidate = item => {
    if (item.approval1 == '') {
      toast.error('Approval 1 is required');
      return true;
    }

    if (item.approval1 == item.delegate1) {
      toast.error('Approval1 and Delegate1 should not be same');
      return true;
    }
    if (item.approval3 == '') {
      toast.error('Approval 3 is required');
      return true;
    }

    var delegatedUserCode = delegatedUsers.map(function (item) {
      return item['userCode'];
    });

    if (delegatedUserCode.includes(item.delegate1)) {
      toast.error('delegate1 user is delegated');
      return true;
    }

    if (delegatedUserCode.includes(item.approval2)) {
      toast.error('approvar2 user is delegated');
      return true;
    }

    if (delegatedUserCode.includes(item.delegate2)) {
      toast.error('delegate2 user is delegated');
      return true;
    }

    if (delegatedUserCode.includes(item.approval3)) {
      toast.error('approvar3 user is delegated');
      return true;
    }

    if (delegatedUserCode.includes(item.delegate3)) {
      toast.error('Delegate3 user is delegated');
      return true;
    }
  };

  const onFollowChanged = async row => {
    if (!handleValidate(row)) {
      row.createdBy = JSON.parse(
        localStorage.getItem('userData'),
      ).magentoUserId;
      let output = await common.apiCall2(
        'POST',
        `api/boosterApprovalMatrix/create-approval-matrix`,
        { model: row },
      );
      const { data } = output.data;
      toast.success(data);
    }
  };

  const columns = [
    { dataField: 'username', text: 'User', filter: textFilter() },
    {
      dataField: 'approval1',
      text: 'Approvar 1',
      editor: {
        type: Type.SELECT,
        options: gridDropdowns.juniors,
      },
      validator: (newValue, row, column) => {
        if (!newValue) {
          toast.error('Approval 1 is required');
          return;
        }

        if (newValue && newValue == row.delegate1) {
          toast.error('Approval 1 should not be same delegate 1');
          return;
        }

        var delegatedUserCode = delegatedUsers.map(function (item) {
          return item['userCode'];
        });

        if (delegatedUserCode.includes(newValue)) {
          toast.error('This user is delegated');
          return;
        }

        return true;
      },
      classes: (cell, row, rowIndex, colIndex) => {
        if (cell && cell == row.delegate1) {
          return 'bg-danger text-light font-weight-bold';
        }

        var delegatedUserCode = delegatedUsers.map(function (item) {
          return item['userCode'];
        });

        if (delegatedUserCode.includes(cell)) {
          return 'bg-danger text-light font-weight-bold';
        }
      },
      formatter: (cell, row) => {
        if (cell && gridDropdowns.juniors)
          return gridDropdowns.juniors.find(x => x.value == cell).label;
      },
    },
    {
      dataField: 'delegate1',
      text: 'Delegate 1',
      editor: {
        type: Type.SELECT,
        options: gridDropdowns.jrSeniors,
      },
      validator: (newValue, row, column) => {
        if (newValue && newValue == row.approval1) {
          toast.error('Approval 1 should not be same delegate 1');
          return;
        }

        var delegatedUserCode = delegatedUsers.map(function (item) {
          return item['userCode'];
        });

        if (delegatedUserCode.includes(newValue)) {
          toast.error('This user is delegated');
          return;
        }

        return true;
      },
      classes: (cell, row, rowIndex, colIndex) => {
        var delegatedUserCode = delegatedUsers.map(function (item) {
          return item['userCode'];
        });

        if (delegatedUserCode.includes(cell)) {
          return 'bg-danger text-light font-weight-bold';
        }
      },
      formatter: (cell, row) => {
        if (cell && gridDropdowns.jrSeniors)
          return gridDropdowns.jrSeniors.find(x => x.value == cell).label;
      },
    },
    {
      dataField: 'approval2',
      text: 'Approvar 2',
      editor: {
        type: Type.SELECT,
        options: gridDropdowns.seniors,
      },
      formatter: (cell, row) => {
        if (cell && gridDropdowns.seniors)
          return gridDropdowns.seniors.find(x => x.value == cell).label;
      },
      validator: (newValue, row, column) => {
        if (newValue && newValue == row.delegate2) {
          toast.error('Approval 2 should not be same delegate 2');
          return;
        }
        return true;
      },
      classes: (cell, row, rowIndex, colIndex) => {
        if (cell && cell == row.delegate2) {
          return 'bg-danger text-light font-weight-bold';
        }

        var delegatedUserCode = delegatedUsers.map(function (item) {
          return item['userCode'];
        });

        if (delegatedUserCode.includes(cell)) {
          return 'bg-danger text-light font-weight-bold';
        }
      },
    },
    {
      dataField: 'delegate2',
      text: 'Delegate 2',
      editor: {
        type: Type.SELECT,
        options: gridDropdowns.seniors,
      },
      formatter: (cell, row) => {
        if (cell && gridDropdowns.seniors)
          return gridDropdowns.seniors.find(x => x.value == cell).label;
      },
      validator: (newValue, row, column) => {
        if (newValue && newValue == row.approval2) {
          toast.error('Approval 2 should not be same delegate 2');
          return;
        }

        var delegatedUserCode = delegatedUsers.map(function (item) {
          return item['userCode'];
        });

        if (delegatedUserCode.includes(newValue)) {
          toast.error('This user is delegated');
          return;
        }

        return true;
      },
      classes: (cell, row, rowIndex, colIndex) => {
        if (cell && cell == row.approval2) {
          return 'bg-danger text-light font-weight-bold';
        }

        var delegatedUserCode = delegatedUsers.map(function (item) {
          return item['userCode'];
        });

        if (delegatedUserCode.includes(cell)) {
          return 'bg-danger text-light font-weight-bold';
        }
      },
    },
    {
      dataField: 'approval3',
      text: 'Approvar 3',
      editor: {
        type: Type.SELECT,
        options: gridDropdowns.managers,
      },
      formatter: (cell, row) => {
        if (cell && gridDropdowns.managers)
          return gridDropdowns.managers.find(x => x.value == cell).label;
      },
      validator: (newValue, row, column) => {
        if (!newValue) {
          toast.error('Approval 3 is required');
          return;
        }

        if (newValue && newValue == row.Delegate3) {
          toast.error('Approval 3 should not be same delegate 3');
          return;
        }
        return true;
      },
      classes: (cell, row, rowIndex, colIndex) => {
        if (cell && cell == row.Delegate3) {
          return 'bg-danger text-light font-weight-bold';
        }

        var delegatedUserCode = delegatedUsers.map(function (item) {
          return item['userCode'];
        });

        if (delegatedUserCode.includes(cell)) {
          return 'bg-danger text-light font-weight-bold';
        }
      },
    },
    {
      dataField: 'delegate3',
      text: 'Delegate 3',
      editor: {
        type: Type.SELECT,
        options: gridDropdowns.managers,
      },
      formatter: (cell, row) => {
        if (cell && gridDropdowns.managers)
          return gridDropdowns.managers.find(x => x.value == cell).label;
      },
      validator: (newValue, row, column) => {
        if (newValue && newValue == row.approval3) {
          toast.error('Approval 3 should not be same delegate 3');
          return;
        }
        return true;
      },
      classes: (cell, row, rowIndex, colIndex) => {
        if (cell && cell == row.approval3) {
          return 'bg-danger text-light font-weight-bold';
        }

        var delegatedUserCode = delegatedUsers.map(function (item) {
          return item['userCode'];
        });

        if (delegatedUserCode.includes(cell)) {
          return 'bg-danger text-light font-weight-bold';
        }
      },
    },
    { dataField: 'action', text: 'Actions', formatter: ActionButton },
  ];

  const beforeSaveCell = (oldValue, newValue, row, column, done) => {
    const { dataField } = column;
    if (['action', 'username'].includes(dataField)) {
      done(false);
    } else {
      done();
    }
    return { async: true };
  };

  return (
    <Page>
      <Row>
        <Col>
          <Card className="mb-3">
            <CardHeader>Booster Approval Matrix</CardHeader>
            <CardBody>
              <Alert color="info">Please double-click to update table</Alert>
              <div style={{ textAlign: 'right', fontSize: '10px' }}></div>
              <div className="mt-2">
                {!isDataLoaded ? (
                  <Spinner animation="border" variant="primary" />
                ) : (
                  <BootstrapTable
                    bootstrap4
                    classes="customTable"
                    keyField="userId"
                    data={approvalMatrixGrid}
                    columns={columns}
                    pagination={paginationFactory()}
                    cellEdit={cellEditFactory({
                      mode: userData.roleId == 15 ? 'dbclick' : '',
                      blurToSave: true,
                      beforeSaveCell,
                    })}
                    filter={filterFactory()}
                  />
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Page>
  );
};

export default BoosterApprovalMatrix;
