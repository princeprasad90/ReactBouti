import React, { useState, useEffect } from "react"
import { MixedCheckbox } from "@reach/checkbox";
import PropTypes from 'utils/propTypes';
import { Collapse } from 'reactstrap';
import "@reach/checkbox/styles.css";
import * as common from '../../network/index';

export function RoleTree({ passData, userCode }) {

    const [tree, settree] = useState([]);
    const [roles, setroles] = useState([]);
    const fontSize = {fontSize:'0.9rem'};
    useEffect(() => {
        let init = async () => {
            let output = await common.apiCall2('GET', `Menu/GetRolesList`, {});
            let { data } = output;
            let { result, statusCode } = data;
            if (statusCode === 200) {
                result.forEach(obj => {
                    obj.checked = false;
                    obj.isOpen = false;
                    obj.children.forEach(child => {
                        child.checked = false;
                    })
                })
                settree(result);
            }
        }
        init();
    }, []);

    useEffect(() => {
        passData(tree);
    }, [tree]);

    useEffect(() => {
        if (userCode !== null && userCode !== '' && userCode !== undefined)
            getRolesByUserCode();
        else {
            setroles([]);
        }
    }, [userCode]);

    useEffect(() => {
        let temp = [...tree];
        temp.forEach(obj => {
            obj.children.forEach(child => {
                let exists = roles.includes(child.roleCode);
                child.checked = exists;
            });
            let checkedTrue = obj.children.some(c => c.checked === true);
            let checkedFalse = obj.children.some(c => c.checked === false);
            if (checkedTrue && checkedFalse) {
                obj.checked = "mixed";
            }
            else if (checkedTrue && checkedFalse === false) {
                obj.checked = true;
            }
            else obj.checked = false;
        });
        settree(temp);
    }, [roles]);

    const handleChkChange = async (e) => {
        let id = e.target.id;
        let value = e.target.value;
        const node = { app: 1, role: 2 };
        let temp = [...tree];
        let selectedNode = 0;
        let app, role;
        if (id.includes('A')) {
            selectedNode = node.app;
            app = temp.find(a => String(a.appCode) === value);
        }
        else {
            selectedNode = node.role;
            temp.every(obj => {
                role = obj.children.find(c => String(c.roleCode) === value);
                if (role !== null && role !== undefined) {
                    app = obj;
                    return false;
                }
                return true;
            });
        }
        if (selectedNode === node.app) {
            app.checked = !app.checked;
            app.children.forEach(c => c.checked = app.checked);
        }
        else {
            role.checked = !role.checked;
            let checkedTrue = app.children.some(c => c.checked === true);
            let checkedFalse = app.children.some(c => c.checked === false);
            if (checkedTrue && checkedFalse) {
                app.checked = "mixed";
            }
            else if (checkedTrue && checkedFalse === false) {
                app.checked = true;
            }
            else app.checked = false;
        }
        settree(temp);
    };

    const getRolesByUserCode = async () => {
        let output = await common.apiCall2('GET', `Menu/GetRolesByUserCode?userCode=${userCode}`, {});
        let { data } = output;
        let { result, statusCode } = data;
        if (statusCode === 200) {
            let temp = result.map(r => r.roleCode);
            setroles(temp);
        }
    }

    const toggle = (e) => {
        let id = e.target.id;
        let temp = [...tree];
        let app = temp.find(a => String(a.appCode) === id);
        app.isOpen = !app.isOpen;
        settree(temp);
    }
    return (
        <div>

            {tree && tree.map((obj, index) => {
                return (
                    <div key={index}>
                        <MixedCheckbox style={{ width: '15px', height: '15px' }} className='mr-1' checked={obj.checked} id={`${obj.appCode}A`} value={`${obj.appCode}`} onChange={e => handleChkChange(e)} />
                        <a style={{ cursor: 'pointer' }} id={`${obj.appCode}`} onClick={toggle} >{obj.appName}</a>

                        {obj.children && obj.children.map(child => {
                            return (
                                <Collapse isOpen={obj.isOpen} key={child.roleCode} className="px-3">
                                    <input type="checkbox" style={{ width: '15px', height: '15px' }} className='mr-1'
                                        checked={child.checked} id={`${child.roleCode}C`} value={`${child.roleCode}`}
                                        onChange={e => handleChkChange(e)}
                                    ></input><span style={fontSize}>{child.roleName}</span>
                                </Collapse>
                            );
                        })}
                    </div>);
            })}
        </div>
    );
}
RoleTree.propTypes = {
    passData: PropTypes.func.isRequired,
};