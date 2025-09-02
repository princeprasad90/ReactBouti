import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Modal, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
  Collapse,
} from 'reactstrap';
import Page from 'components/Page';
import {
  allListCelebrityAction,
  GetCelebrityListCampaign,
} from 'actions/celebrityActions/CelebrityActions';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import * as common from 'network/index';
import { PaginationTypes, PageSizeVals } from 'constants/common';
import { FaEllipsisH } from 'react-icons/fa';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { GetCampaignApprovalData } from 'actions/boosterActions/CampaignActions';
import { FaCheck, FaEdit, FaBan } from 'react-icons/fa';
import { RoleNames } from 'utils/roleNames';
const CampaignListSearch = () => {
  const [objRequest, setobjRequest] = useState({});
  const ddlAllCeleb = useSelector(state => state.CelebrityReducer.allCelebs);
  const userData = JSON.parse(localStorage.getItem('userData'));
  const [ShowDetail, setShowDetail] = useState(false);
  const [showEdit, setshowEdit] = useState(false);
  const [isloading, setisloading] = useState({
    OnGoing: false,
    UpComing: false,
    History: false,
    Rejected: false,
  });
  const [page, setpage] = useState({
    OnGoing: 1,
    UpComing: 1,
    History: 1,
    Rejected: 1,
  });
  const [sizePerPage, setsizePerPage] = useState({
    OnGoing: 10,
    UpComing: 10,
    History: 10,
    Rejected: 10,
  });
  const [selectedCelebrity, setselectedCelebrity] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isOnGoingOpen, setisOnGoingOpen] = useState(false);
  const [isUpComingOpen, setisUpComingOpen] = useState(false);
  const [isHistoryOpen, setisHistoryOpen] = useState(false);
  const [isRejectedOpen, setisRejectedOpen] = useState(false);
  const [CelebsList, setCelebsList] = useState([]);
  const [dataOnGoing, setdataOnGoing] = useState([]);
  const [dataUpComing, setdataUpComing] = useState([]);
  const [dataHistory, setdataHistory] = useState([]);
  const [dataRejected, setdataRejected] = useState([]);
  const [totalSizeOnGoing, settotalSizeOnGoing] = useState(0);
  const [totalSizeUpComing, settotalSizeUpComing] = useState(0);
  const [totalSizeHistory, settotalSizeHistory] = useState(0);
  const [totalSizeRejected, settotalSizeRejected] = useState(0);
  const [isSearching, setisSearching] = useState(false);
  const [listItemNo, setlistItemNo] = useState([]);
  const [listCelebrity, setlistCelebrity] = useState([]);
  const [details, setdetails] = useState({});
  const [isEditEnabled, setisEditEnabled] = useState(false);
  const dispatch = useDispatch();
  const columns = [
    { dataField: 'campId', text: '#' },
    { dataField: 'title', text: 'Title' },
    { dataField: 'fromDate', text: 'From Date' },
    { dataField: 'toDate', text: 'To Date' },
    { dataField: 'commision', text: 'Extra Commision' },
    { dataField: 'campaignType', text: 'Campaign Type' },
    { dataField: 'insertedUser', text: 'Inserted User' },
    { dataField: 'approvalLevelNo', text: 'Approval Level' },
  ];
  const [tableColumns, settableColumns] = useState({
    OnGoing: [...columns],
    UpComing: [...columns],
    History: [...columns],
    Rejected: [...columns],
  });
  const Choice = {
    OnGoing: 'OnGoing',
    UpComing: 'UpComing',
    History: 'History',
    Rejected: 'Rejected',
  };
  useEffect(() => {
    let isEditEnabledTemp =
      userData.roleId == 3 ? true : userData.roleId == 2 ? true : false;
    setisEditEnabled(isEditEnabledTemp);
    console.log('Sagsggsiii', isEditEnabledTemp);
    settableColumns({
      OnGoing: [...columns, { dataField: 'action', text: 'Action' }],
      UpComing: [...columns, { dataField: 'action', text: 'Action' }],
      History: [...columns],
      Rejected: [
        ...columns,
        { dataField: 'rejectionReason', text: 'RejectionReason' },
      ],
    });
    getAll();
  }, []);

  useEffect(() => {
    let tempCeleb = [...ddlAllCeleb];
    let celebArray = tempCeleb.map(c => {
      return { value: c.value, label: `${c.value}-${c.label}` };
    });
    setCelebsList(celebArray);
  }, [ddlAllCeleb]);

  const getAll = async () => {
    setisloading({
      OnGoing: true,
      UpComing: true,
      History: true,
      Rejected: true,
    });
    if (ddlAllCeleb.length === 0) {
      // await dispatch(allListCelebrityAction({ userid: -1 }));

      //await dispatch(GetCelebrityListCampaign({ userid: userData.magentoUserId,RoleId:Number(userData.roleId )}));
      let tempCeleb = await dispatch(
        GetCelebrityListCampaign({
          userid: userData.magentoUserId,
          RoleId: Number(userData.roleId),
        }),
      );
      let celebArray = tempCeleb.result.map(c => {
        return { value: c.value, label: `${c.value}-${c.label}` };
      });
      setCelebsList(celebArray);
    }
    setisloading({
      OnGoing: false,
      UpComing: false,
      History: false,
      Rejected: false,
    });
  };
  const handleSearch = async () => {
    console.log('Sagsggsiii', isEditEnabled);
    setisSearching(true);
    let celebIdCSV = null;
    if (selectedCelebrity.length > 0) {
      celebIdCSV = selectedCelebrity.map(c => c.value).join(',');
    }
    let request = { ...objRequest, celebIdCSV };
    Promise.all([
      getData(
        request,
        Choice.OnGoing,
        userData.magentoUserId,
        Number(userData.roleId),
      ),
      getData(
        request,
        Choice.UpComing,
        userData.magentoUserId,
        Number(userData.roleId),
      ),
      getData(
        request,
        Choice.History,
        userData.magentoUserId,
        Number(userData.roleId),
      ),
      getData(
        request,
        Choice.Rejected,
        userData.magentoUserId,
        Number(userData.roleId),
      ),
    ]).then(
      ([resultOnGoing, resultUpComing, resultHistory, resultRejected]) => {
        loadData(resultOnGoing, Choice.OnGoing);
        loadData(resultUpComing, Choice.UpComing);
        loadData(resultHistory, Choice.History);
        loadData(resultRejected, Choice.Rejected);
      },
    );
    setpage({ OnGoing: 1, UpComing: 1, History: 1, Rejected: 1 });
    setsizePerPage({ OnGoing: 10, UpComing: 10, History: 10, Rejected: 10 });
    setisSearching(false);
  };

  const getData = (request, id, MagentoUserId, RoleId) => {
    return common.apiCall2('POST', `Misc/GetCampaignListSearch`, {
      ...request,
      choice: id,
      MagentoUserId: MagentoUserId,
      RoleId: RoleId,
    });
  };
  const loadData = (response, id) => {
    try {
      let { data } = response;
      console.log('Sagsggsiii', response);
      if (data.status) {
        let { result } = data;
        let tempData = result.data;
        let dataArray = [];
        console.log('Sagsggsiii', isEditEnabled);
        tempData.forEach(obj => {
          let ApprovalLevel =
            obj.approvalLevelNo == 0
              ? 'JuniorRM'
              : obj.approvalLevelNo == 1
              ? 'SeniorRM'
              : obj.approvalLevelNo == 2
              ? 'Management'
              : obj.approvalLevelNo == 10
              ? 'CANCELLED'
              : obj.approvalLevelNo == 11
              ? 'REJECTED'
              : obj.approvalLevelNo == 12
              ? 'AUTOREJECTED'
              : 'APPROVED';
          obj.approvalLevelNo = ApprovalLevel;
          let actionEdit =
            isEditEnabled && id != Choice.History && id != Choice.Rejected ? (
              <a
                style={{ cursor: 'pointer', color: 'blue' }}
                data-choice={id}
                data-item={JSON.stringify(obj)}
                onClick={handleEdit}
              >
                <FaEdit />
              </a>
            ) : (
              ''
            );
          let actionCancel =
            isEditEnabled && id == Choice.UpComing ? (
              <a
                style={{ cursor: 'pointer', color: 'red' }}
                className=" m-1"
                data-item={JSON.stringify(obj)}
                onClick={handleCancel}
              >
                <FaBan />
              </a>
            ) : (
              ''
            );
          let camp = {
            ...obj,
            campId: (
              <a
                className="btn btn-outline-dark  btn-sm"
                data-item={JSON.stringify(obj)}
                onClick={handleDetails}
              >
                {obj.id}
              </a>
            ),
            fromDate: moment(obj.date1).format('YYYY-MM-DD hh:mm:ss'),
            toDate: moment(obj.date2).format('YYYY-MM-DD hh:mm:ss'),
            action: (
              <>
                {actionEdit} {actionCancel}
              </>
            ),
          };
          dataArray.push(camp);
        });
        switch (id) {
          case Choice.OnGoing:
            setdataOnGoing(dataArray);
            settotalSizeOnGoing(result.totalSize);
            break;
          case Choice.UpComing:
            setdataUpComing(dataArray);
            settotalSizeUpComing(result.totalSize);
            break;
          case Choice.History:
            setdataHistory(dataArray);
            settotalSizeHistory(result.totalSize);
            break;
          case Choice.Rejected:
            setdataRejected(dataArray);
            settotalSizeRejected(result.totalSize);
            break;
        }
      } else {
        toast.error(`Failed fetching ${id} `);
      }
    } catch (e) {
      console.log('e', e);
    }
  };

  const handleTableChange = async (
    type,
    { page: pageParam, sizePerPage: sizePerPageParam },
    id,
  ) => {
    if (type === PaginationTypes.Clear || type === PaginationTypes.Search) {
      pageParam = 1;
    }
    const currentIndex = (pageParam - 1) * sizePerPageParam;
    setisloading({ ...isloading, [`${id}`]: true });
    let pageSizeAllowed = PageSizeVals.includes(sizePerPageParam);
    let size = pageSizeAllowed ? sizePerPageParam : 10;
    let paginationObj = {
      pageSize: size,
      currentIndex,
    };
    let response = await getData(
      { ...objRequest, ...paginationObj },
      id,
      userData.magentoUserId,
      Number(userData.roleId),
    );
    loadData(response, id);
    setisloading({ ...isloading, [`${id}`]: false });
    setpage({ ...page, [`${id}`]: pageParam });
    setsizePerPage({ ...sizePerPage, [`${id}`]: sizePerPageParam });
  };

  const handleTableChangeOnGoing = async (type, { page, sizePerPage }) => {
    handleTableChange(type, { page, sizePerPage }, Choice.OnGoing);
  };
  const handleTableChangeUpComing = async (type, { page, sizePerPage }) => {
    handleTableChange(type, { page, sizePerPage }, Choice.UpComing);
  };
  const handleTableChangeHistory = async (type, { page, sizePerPage }) => {
    handleTableChange(type, { page, sizePerPage }, Choice.History);
  };
  const handleTableChangeRejected = async (type, { page, sizePerPage }) => {
    handleTableChange(type, { page, sizePerPage }, Choice.Rejected);
  };
  const handleReset = async () => {
    setobjRequest({});
    setselectedCelebrity([]);
  };
  const handleDetails = async e => {
    const obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
    setdetails(obj);
    let objDetails = { Flag: 'DETAILS', CampaignId: obj.id.toString() };
    let CampaignDetailsResponse = await dispatch(
      GetCampaignApprovalData(objDetails),
    );
    setlistItemNo([
      ...(CampaignDetailsResponse.result[0].campItems == undefined
        ? ''
        : JSON.parse(CampaignDetailsResponse.result[0].campItems)),
    ]);
    setlistCelebrity([
      ...(CampaignDetailsResponse.result[0].campCelebrities == undefined
        ? ''
        : JSON.parse(CampaignDetailsResponse.result[0].campCelebrities)),
    ]);
    setShowDetail(true);
  };

  const handleClose = e => {
    setShowDetail(false);
  };

  const toggle = () => setIsOpen(!isOpen);
  const handleEdit = async e => {
    let obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
    obj.choice = e.currentTarget.getAttribute('data-choice');
    obj.date1 = moment(new Date(obj.date1)).format('YYYY-MM-DD');
    obj.date2 = moment(new Date(obj.date2)).format('YYYY-MM-DD');
    setdetails(obj);
    setshowEdit(true);
  };
  const handleCancel = async e => {
    let obj = JSON.parse(e.currentTarget.getAttribute('data-item'));
    if (window.confirm(`Are you sure you wan to cancel campaign#${obj.id}`)) {
      console.log('Cancel Button Clicked', obj);
      let objUpdate = {
        Flag: 'CANCEL',
        CampainId: obj.id.toString(),
      };
      try {
        let output = await common.apiCall2(
          'POST',
          `Booster/Camp_Edit`,
          objUpdate,
        );
        let { data } = output;
        toast.info(data.message);
      } catch (e) {
        toast.error(`Something went wrong`);
      }
    }
  };
  const handleUpdate = async e => {
    let date1 = moment(details.date1);
    let date2 = moment(details.date2);
    let today = moment(new Date());
    if (date1.isAfter(date2)) {
      toast.warn('To Date Should be Greater than From Date !');
      return;
    }
    if (details.choice === Choice.UpComing) {
      if (today.isAfter(date1)) {
        toast.warn('For Upcoming campaign From Date cannot be a previous day');
        return;
      }
    } else if (details.choice === Choice.OnGoing) {
      if (date2.startOf('day').isBefore(today.startOf('day'))) {
        toast.warn('For OnGoing campaign To Date cannot be a previous day');
        return;
      }
    }
    let objUpdate = {
      Flag: 'UPDATE',
      CampainId: details.id.toString(),
      Date1: details.date1,
      Date2: details.date2,
    };
    try {
      let output = await common.apiCall2(
        'POST',
        `Booster/Camp_Edit`,
        objUpdate,
      );
      let { data } = output;
      setshowEdit(false);
      await handleSearch();
      toast.info(data.message);
    } catch (e) {
      toast.error(`Something went wrong`);
    }
  };
  return (
    <Page>
      <div>
        <Modal size="lg" centered show={ShowDetail} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              CampId#{details.id} {details.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col sm="7">
                <div id="scr" style={{ overflow: 'scroll', height: '300px' }}>
                  <Table className="customTable">
                    <thead>
                      <tr>
                        <th scope="col">SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listItemNo &&
                        listItemNo.map(obj => {
                          const { SrNo, CampItems, CampItemDesc } = obj;
                          return (
                            <tr key={SrNo}>
                              <td>
                                {CampItems}/{CampItemDesc}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </div>
              </Col>
              <Col sm="5">
                <div id="scr" style={{ overflow: 'scroll', height: '300px' }}>
                  <Table className="customTable">
                    <thead>
                      <tr>
                        <th scope="col">Celebrities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listCelebrity &&
                        listCelebrity.map(obj => {
                          const { SrNo, CampCelebrityId, CampCelebrityName } =
                            obj;
                          return (
                            <tr key={SrNo}>
                              <td>
                                {CampCelebrityId} - {CampCelebrityName}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      </div>
      <div>
        <Modal show={showEdit} onHide={e => setshowEdit(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              Edit - CampId#{details.id} {details.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {details.choice}
            <div className="row shadow m-2">
              <FormGroup className="col-sm-6">
                <Label for="date1">From Date </Label>
                <Input
                  type="date"
                  name="date1"
                  value={details.date1 || ''}
                  disabled={details.choice === Choice.OnGoing}
                  onChange={e =>
                    setdetails({ ...details, date1: e.target.value })
                  }
                  style={{ fontSize: '0.8rem' }}
                />
              </FormGroup>
              <FormGroup className="col-sm-6">
                <Label for="date2">To Date </Label>
                <Input
                  type="date"
                  name="date2"
                  value={details.date2 || ''}
                  onChange={e =>
                    setdetails({ ...details, date2: e.target.value })
                  }
                  style={{ fontSize: '0.8rem' }}
                />
              </FormGroup>
            </div>
            <div style={{ float: 'right', position: 'relative' }}>
              <a
                href="#"
                color="primary"
                onClick={handleUpdate}
                className="caret btn-sm mr-10"
              >
                Save
              </a>
            </div>
          </Modal.Body>
        </Modal>
      </div>
      <Row>
        <Col>
          <Card className="mb-12">
            <CardHeader>
              <span style={{ cursor: 'pointer' }} onClick={toggle}>
                Campaign Search
              </span>
            </CardHeader>
            <CardBody>
              <Collapse isOpen={isOpen}>
                <div className="row" style={{ fontSize: '0.8rem' }}>
                  <div className="BoxLayout colShadow">
                    <FormGroup className="InnerBoxLayout">
                      <Label for="campaignIdCSV">CampaignId</Label>
                      <Input
                        type="text"
                        name="campaignIdCSV"
                        placeholder="campaignIdCSV"
                        value={objRequest.campaignIdCSV || ''}
                        onChange={e =>
                          setobjRequest({
                            ...objRequest,
                            campaignIdCSV: e.target.value,
                          })
                        }
                        style={{ fontSize: '0.8rem' }}
                      />
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="campaignTitle">Campaign Name</Label>
                      <Input
                        type="text"
                        name="campaignTitle"
                        id="campaignTitle"
                        placeholder="Campaign Name"
                        value={objRequest.campaignTitle || ''}
                        onChange={e =>
                          setobjRequest({
                            ...objRequest,
                            campaignTitle: e.target.value,
                          })
                        }
                        style={{ fontSize: '0.8rem' }}
                      />
                    </FormGroup>
                  </div>
                  <div className="BoxLayout colShadow">
                    <FormGroup className="InnerBoxLayout">
                      <Label for="itemNoCSV">SKU CSV</Label>
                      <Input
                        type="text"
                        name="itemNoCSV"
                        id="itemNoCSV"
                        placeholder="SKU CSV"
                        value={objRequest.itemNoCSV || ''}
                        onChange={e =>
                          setobjRequest({
                            ...objRequest,
                            itemNoCSV: e.target.value,
                          })
                        }
                        style={{ fontSize: '0.8rem' }}
                      />
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="selCeleb">Celebrity</Label>
                      <Select
                        name="selCeleb"
                        placeholder="Select Celebrity"
                        isMulti
                        value={selectedCelebrity}
                        onChange={(val, act) => setselectedCelebrity(val)}
                        isClearable={true}
                        options={CelebsList}
                      />
                    </FormGroup>
                  </div>
                  <div className="BoxLayout colShadow">
                    <FormGroup className="InnerBoxLayout">
                      <Label for="commission">Extra Commission</Label>
                      <Input
                        type="number"
                        name="commission"
                        id="commission"
                        placeholder="commission"
                        value={objRequest.commission || ''}
                        onChange={e =>
                          setobjRequest({
                            ...objRequest,
                            commission: +e.target.value,
                          })
                        }
                        style={{ fontSize: '0.8rem' }}
                      />
                    </FormGroup>
                    <FormGroup className="InnerBoxLayout">
                      <Label for="drpCampaignType">Campaign Type</Label>
                      <select
                        className="form-control"
                        name="drpCampaignType"
                        value={objRequest.campaignType || 'All'}
                        onChange={e =>
                          setobjRequest({
                            ...objRequest,
                            campaignType: e.target.value,
                          })
                        }
                        style={{ fontSize: '0.8rem' }}
                      >
                        <option value="All">-- Select --</option>
                        <option value="Celebrity"> Celebrity</option>
                        <option value="Management"> Management</option>
                      </select>
                    </FormGroup>
                  </div>
                  <div className="BoxLayout colShadow">
                    <FormGroup className="InnerBoxLayout">
                      <Label for="startDate">Start Date</Label>
                      <Input
                        type="Date"
                        name="startDate"
                        id="startDate"
                        placeholder="Start Date"
                        value={objRequest.startDate || ''}
                        onChange={e =>
                          setobjRequest({
                            ...objRequest,
                            startDate: e.target.value,
                          })
                        }
                        style={{ fontSize: '0.8rem' }}
                      />
                    </FormGroup>
                    <FormGroup
                      className="InnerBoxLayout"
                      style={{ marginTop: '30px' }}
                    >
                      {isSearching && (
                        <Spinner animation="border" variant="primary" />
                      )}
                      {!isSearching && (
                        <Button
                          className="btn btn-success"
                          onClick={e => handleSearch(e)}
                          style={{
                            fontSize: '0.8rem',
                            width: '40%',
                            marginLeft: '5%',
                          }}
                        >
                          Search
                        </Button>
                      )}
                      <Button
                        className="btn btn-primary"
                        onClick={e => handleReset(e)}
                        style={{
                          fontSize: '0.8rem',
                          width: '40%',
                          marginLeft: '5%',
                        }}
                      >
                        Reset
                      </Button>
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
          <Card className="mb-3">
            <CardBody>
              <div className="shadow  m-2 p-2">
                <div
                  className="border-bottom m-1 p-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setisOnGoingOpen(!isOnGoingOpen)}
                >
                  <span className="font-italic">
                    {' '}
                    <FaEllipsisH /> On Going Campaign : {totalSizeOnGoing}{' '}
                  </span>
                </div>
                <Collapse isOpen={isOnGoingOpen}>
                  {isloading.OnGoing && (
                    <Spinner animation="border" variant="primary" />
                  )}
                  {!isloading.OnGoing && (
                    <BootstrapTable
                      remote
                      keyField="id"
                      data={dataOnGoing}
                      columns={tableColumns.OnGoing}
                      classes="customTable"
                      id="OnGoing"
                      pagination={paginationFactory({
                        showTotal: true,
                        page: page.OnGoing,
                        sizePerPage: sizePerPage.OnGoing,
                        totalSize: totalSizeOnGoing,
                      })}
                      onTableChange={handleTableChangeOnGoing}
                    />
                  )}
                </Collapse>
              </div>

              <div className="shadow  m-2 p-2 ">
                <div
                  className="border-bottom m-1 p-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setisUpComingOpen(!isUpComingOpen)}
                >
                  <span className="font-italic">
                    {' '}
                    <HiArrowRight /> Up Coming Campaign : {
                      totalSizeUpComing
                    }{' '}
                  </span>
                </div>
                <Collapse isOpen={isUpComingOpen}>
                  {isloading.UpComing && (
                    <Spinner animation="border" variant="primary" />
                  )}
                  {!isloading.UpComing && (
                    <BootstrapTable
                      remote
                      keyField="id"
                      data={dataUpComing}
                      columns={tableColumns.UpComing}
                      classes="customTable"
                      id="UpComing"
                      pagination={paginationFactory({
                        showTotal: true,
                        page: page.UpComing,
                        sizePerPage: sizePerPage.UpComing,
                        totalSize: totalSizeUpComing,
                      })}
                      onTableChange={handleTableChangeUpComing}
                    />
                  )}
                </Collapse>
              </div>
              <div className="shadow  m-2 p-2">
                <div
                  className="border-bottom m-1 p-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setisHistoryOpen(!isHistoryOpen)}
                >
                  <span className="font-italic">
                    {' '}
                    <HiArrowLeft /> History : {totalSizeHistory}{' '}
                  </span>
                </div>
                <Collapse isOpen={isHistoryOpen}>
                  {isloading.History && (
                    <Spinner animation="border" variant="primary" />
                  )}
                  {!isloading.History && (
                    <BootstrapTable
                      remote
                      keyField="id"
                      data={dataHistory}
                      columns={tableColumns.History}
                      classes="customTable"
                      id="History"
                      pagination={paginationFactory({
                        showTotal: true,
                        page: page.History,
                        sizePerPage: sizePerPage.History,
                        totalSize: totalSizeHistory,
                      })}
                      onTableChange={handleTableChangeHistory}
                    />
                  )}
                </Collapse>
              </div>
              <div className="shadow  m-2 p-2">
                <div
                  className="border-bottom m-1 p-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setisRejectedOpen(!isRejectedOpen)}
                >
                  <span className="font-italic">
                    {' '}
                    <FaBan /> Rejected : {totalSizeRejected}{' '}
                  </span>
                </div>
                <Collapse isOpen={isRejectedOpen}>
                  {isloading.Rejected && (
                    <Spinner animation="border" variant="primary" />
                  )}
                  {!isloading.Rejected && (
                    <BootstrapTable
                      remote
                      keyField="id"
                      data={dataRejected}
                      columns={tableColumns.Rejected}
                      classes="customTable"
                      id="Rejected"
                      pagination={paginationFactory({
                        showTotal: true,
                        page: page.Rejected,
                        sizePerPage: sizePerPage.Rejected,
                        totalSize: totalSizeRejected,
                      })}
                      onTableChange={handleTableChangeRejected}
                    />
                  )}
                </Collapse>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Page>
  );
};
export default CampaignListSearch;
