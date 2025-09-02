import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";
import {
    Card, CardBody, CardHeader, Col,Row} from 'reactstrap';
import Page from 'components/Page';
import { getCelebUsersRolesList } from 'actions/celebrityActions/UserActions';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import * as common from 'network/index';
const ViewMapping = () => {
    const [celebHeirarchy, setCelebHeirarchy] = useState([]);
    const [Mapgrid, setMapgrid] = useState([]);
    const userData = JSON.parse(localStorage.getItem("userData"));
    const celebUsersRoles = useSelector((state) => state.UserReducer.listCelebUsersRoles);
    const dispatch = useDispatch();
    useEffect(() => {
        getAll();
    }, []);
    useEffect(() => {
        if (celebHeirarchy.length > 0 && celebUsersRoles.length > 0) {
            let mapView = [];
            let index = 0;
            celebHeirarchy.forEach(m => {
                index = index + 1;
                let Celeb = `${m.celebrityCode}-${m.name_EN}`
                let parentAMObj = celebUsersRoles.find(c => Number(c.magentoUserId) === Number(m.parentAM));
                let AM = `${parentAMObj.magentoUserId}-${parentAMObj.userName}`;
                let parentJuniorRMObj = celebUsersRoles.find(c => Number(c.magentoUserId) === Number(m.parentJuniorRM));
                let JuniorRM = parentJuniorRMObj != undefined ? `${parentJuniorRMObj.magentoUserId}-${parentJuniorRMObj.userName}` : 'null';
                let parentSeniorRM = celebUsersRoles.find(c => Number(c.magentoUserId) === Number(m.parentSeniorRM));
                let SeniorRM = parentSeniorRM != undefined ? `${parentSeniorRM.magentoUserId}-${parentSeniorRM.userName}` : 'Independent';
                mapView.push({ index, Celeb, AM, JuniorRM, SeniorRM });
            });
            console.log(mapView)
            setMapgrid(mapView);
        }
    }, [celebHeirarchy, celebUsersRoles])
    const getAll = async () => {
        if (celebUsersRoles.length === 0) {
            await dispatch(getCelebUsersRolesList({}));
        }
        let output = await common.apiCall2('POST', "ApprovalMatrix/GetCelebHeirarchy", {});
        let celebHierarchyTemp = output.data.result;
        setCelebHeirarchy(celebHierarchyTemp);
    }

    const Columns = [
        { dataField: 'Celeb', text: 'Celeb', filter: textFilter() },
        { dataField: 'AM', text: 'AM', filter: textFilter() },
        { dataField: 'JuniorRM', text: 'JuniorRM', filter: textFilter() },
        { dataField: 'SeniorRM', text: 'SeniorRM', filter: textFilter() }
    ];

    return (
        <Page >
            <Row >
                <Col>
                    <Card className="mb-3">
                        <CardHeader>Account Manager-Celebrity Mapping</CardHeader>
                        <CardBody>
                            <BootstrapTable id="tblRMMapping" bootstrap4 keyField='index' classes="customTable"
                                data={Mapgrid} columns={Columns} filter={filterFactory()}
                                pagination={paginationFactory()} />

                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Page>
    );
};
export default ViewMapping;