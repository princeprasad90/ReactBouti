import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap';
import { Button, Table, Col, Row, } from 'reactstrap';
import Select from 'react-select';
import * as common from 'network/index';
import { toast } from 'react-toastify';
export function Blockitem({ ShowDetailEdit, handleCloseDetailEdit, lstViewData, title }) {
    const [itemOptionsList, setitemOptionsList] = useState([]);
    const [selectedOptions, setselectedOptions] = useState([]);
    const [selectedBlocked, setselectedBlocked] = useState([]);
    const [tableData, settableData] = useState([]);

    useEffect(() => {
        let options = lstViewData.map(obj => { return { 'label': obj.itemNo, 'value': obj.id } });
        setitemOptionsList(options);
        let tempBlockedList = lstViewData.filter(l => l.isActive != 1);
        setselectedBlocked(tempBlockedList);
        formTableDate(lstViewData);
        setselectedOptions([]);
    }, [lstViewData]);

    useEffect(() => {
        if (selectedOptions.length > 0) {
            let tempTableData = [];
            selectedOptions.forEach(el => {
                let temp = lstViewData.find(obj => obj.id === el.value);
                tempTableData.push(temp);
            });
            formTableDate(tempTableData);
        }
        else {
            formTableDate(lstViewData);
        }
    }, [selectedOptions, selectedBlocked]);

    const handleSelectItems = (val, act) => {
        setselectedOptions(val);
    }

    const handleCheckboxChange = e => {
        let targetId = e.target.id;
        let tempblocked = [...selectedBlocked];
        let exists = tempblocked.find(obj => String(obj.id) === targetId);
        if (exists != null) {
            let indextoRemove = tempblocked.indexOf(exists);
            tempblocked.splice(indextoRemove, 1);
        }
        else {
            tempblocked.push(lstViewData.find(obj => String(obj.id) === targetId));
        }
        setselectedBlocked(tempblocked);
    }
    const formTableDate = (dataList) => {
        let tempDataList = dataList.map(e => {
            let temp = { ...e };
            let blocked = selectedBlocked.includes(e);
            temp.chkBox = <input type="checkbox" style={{ width: '15px', height: '15px' }}
                checked={!blocked}
                className="m-1 mr-2" name={`${e.id}`} id={`${e.id}`} value={`${e.id}`}
                onChange={handleCheckboxChange}
            ></input>
            return temp;
        });
        settableData(tempDataList);
    }
    const handleUpdate = async (e) => {
        let request = {};
        if (selectedBlocked.length > 0) {
            let itemNoCSV = selectedBlocked.map(obj => obj.itemNo).join(',');
            request = { batchIdCSV: String(selectedBlocked[0].batchId), itemNoCSV, flag: 4 };
        }
        else {
            request = { batchIdCSV: String(lstViewData[0].batchId), flag: 4 }
        }
        try {
            let output = await common.apiCall2('POST', `Booster/UpadateBatchDetail`, request);
            let { data } = output;
            if (data.status) {
                toast.success(`Successfully Updated batch# ${request.batchIdCSV} `);
            }
            else {
                toast.info(`Not Updated`);
            }
        } catch (e) {
            toast.error(`Something went wrong`);
        }
        handleCloseDetailEdit();

    }
    const blockAllItems = async (e) => {
        if (window.confirm('Are you sure to block all items .. ?')) {
            let request = { batchIdCSV: String(lstViewData[0].batchId), flag: 5 }
            try {
                let output = await common.apiCall2('POST', `Booster/UpadateBatchDetail`, request);
                let { data } = output;
                if (data.status) {
                    toast.success(`Successfully Blocked All items in batch# ${request.batchIdCSV} `);
                }
                else {
                    toast.info(`Not Blocked`);
                }
            } catch (e) {
                toast.error(`Something went wrong`);
            }
        }
        handleCloseDetailEdit();
    }
    const unblockAllItems = async (e) => {
        if (window.confirm('Are you sure to unblock all items .. ?')) {
            let request = { batchIdCSV: String(lstViewData[0].batchId), flag: 6 }
            try {
                let output = await common.apiCall2('POST', `Booster/UpadateBatchDetail`, request);
                let { data } = output;
                if (data.status) {
                    toast.success(`Successfully Unblocked All items in batch# ${request.batchIdCSV} `);
                }
                else {
                    toast.info(`Not Unblocked`);
                }
            } catch (e) {
                toast.error(`Something went wrong`);
            }
        }
        handleCloseDetailEdit();
    }
    return (
        <Modal show={ShowDetailEdit} onHide={handleCloseDetailEdit}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Select name="items"
                    placeholder='Select Items'
                    isMulti
                    onChange={handleSelectItems}
                    isClearable={true} options={itemOptionsList} />
                <br />
                <Row>
                    <Col sm={7}>
                        <div id="scr" style={{ 'overflow': 'scroll', 'height': '300px' }}>
                            <Table className="customTable" id="vieworder">
                                <thead>
                                    <tr>
                                        <th scope="col">IsActive</th>
                                        <th scope="col">ItemNo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        tableData && tableData.map((obj) => {
                                            const { id, chkBox, itemNo } = obj;
                                            return (
                                                <tr key={id} >

                                                    <td>{chkBox}</td>
                                                    <td>{itemNo}</td>

                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                    <Col sm={5}>
                        <Table className="customTable" id="blockedList">
                            <thead>
                                <tr>
                                    <th scope="col">Blocked Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    selectedBlocked && selectedBlocked.map((obj) => {
                                        const { id, itemNo } = obj;
                                        return (
                                            <tr key={id} >
                                                <td>{itemNo}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <br />
                <div className="d-flex  justify-content-end w-50 float-right" >
                    <Button  size="sm" className="bg-dark text-white w-25 m-1" onClick={handleUpdate} >Update</Button>
                    <Button color="primary" size="sm" className="w-25 m-1" onClick={blockAllItems} >Block All</Button>
                    <Button color="primary" size="sm" className="w-25 m-1" onClick={unblockAllItems} >Unblock All</Button>
                </div>

            </Modal.Body>
        </Modal>
    )
}
