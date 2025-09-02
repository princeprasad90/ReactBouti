import React, { useEffect, useState } from 'react';
import Page from 'components/Page';
import { Card, CardBody, CardHeader, Col,  Row} from 'reactstrap';
import { RoleTree } from 'components/Helper/RoleTree';
import * as common from '../../network/index';
import Select from 'react-select';
import { toast } from 'react-toastify';
const Role = () => {
    const [ptree, setptree] = useState([]);
    const [users, setusers] = useState([]);
    const [selectedUser, setselectedUser] = useState();
    const getChildTree = (ctree) => {
        setptree(ctree);
    }
    const getUsersList = async (notifyReqObj) => {
        try {
            let output = await common.apiCall2('GET', `Menu/GetUsersList`, {});
            let { data } = output;
            let { result, statusCode } = data;
            if (statusCode === 200) {
                setusers(result);
            }
        } catch (e) {
            console.log("err", e)
        }

    }

    const handleSave = async ()=>{
     let temp = [...ptree];
     let selectedRoles =[];
     temp.forEach(obj=>{
        obj.children.forEach(child=>{
           if(child.checked) selectedRoles.push(child.roleCode);
        });
     });
     if(!selectedUser){
         toast.error("Select User");
     }
     else
     {
        let reqObj = { userCode:Number(selectedUser), rolesCSV:selectedRoles.join(','),insertedBy:0};
        let response = await common.apiCall2('POST',`Menu/SaveUserRoles`, reqObj)
        toast.success(response.data.message);
     }


    }
    const handleSelectChnage = (val,act)=>{
      if(act.action==='select-option')
      setselectedUser(val.value);
      else if(act.action==="clear")
      setselectedUser('');
    }

    useEffect(() => {
        let res = getUsersList();

    }, [])
    return (
        <Page >
            <Row>
                <Col>
                    <Card className="mb-3  mt-2">
                        <CardHeader>User Role Map</CardHeader>
                        <CardBody>
                            <Row>
                                <Col sm={4}>
                                    <Select name="user" placeholder='Select User' onChange={handleSelectChnage}
                                        isClearable={true} options={users} />
                                </Col>

                            </Row>
                            <Row>
                                <Col>
                                    <Card body>
                                        <RoleTree passData={getChildTree} userCode={selectedUser} />
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={2}>
                                    <a href="#" onClick={handleSave} color="primary" className="caret btn-sm mr-10">Save
                                    </a>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Page>
    );
};

export default Role;