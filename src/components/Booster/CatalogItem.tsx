import React,{useState,useEffect} from 'react'
import { Col, Row, Button, Label,  UncontrolledPopover, PopoverBody } from 'reactstrap';
import {  Card } from 'react-bootstrap';
export function Catalogitem({item,handleChkBox }) {
 
    return (      
        <Card className="col-sm-4 border-0 mb-4 " >
        <Card.Body className="bg-light border">
          <input type="checkbox" style={{ width: '15px', height: '15px' }}
             className="m-1 mr-2" id ={`c${item.itemNo}`} name= {item.batchId}
             value={item.id} checked= {item.checked}
            onChange = {handleChkBox}></input>
          <Label>{item.itemNo}</Label>
          <Row>
            <Col sm={5}>
              <Button color="link" className="p-0 m-0"  id={`b${item.id}`} type="button" >
                <img src={item.itemURL}
                  style={{ 'width': '100%', 'height': '100%' }} />
              </Button>
            </Col>
            <Col sm={7}>
              <div className="small">Type: {item.type} </div>
              <div className="small">Gender: {item.gender}</div>
              <div className="small">Category: {item.category}</div>
              <div className="small">Brand: {item.brand}</div>
              <div className="small">Dept: {item.department}</div>
              <div className="small">BatchIds: {item.batchIds}</div>
            </Col>
          </Row>
          <div>
            <strong>{item.itemDesc}</strong>
          </div>
          <Row>
            <Col>
              <small className="text-muted">Soh: {item.soh}  </small>
            </Col>
            <Col>
              <small className="text-muted">Pr: {item.price} KWD </small>
            </Col>
            <Col>
              <small className="text-muted">Sp. Pr: {item.sPrice} KWD</small>
            </Col>
          </Row><div>
   
   <UncontrolledPopover  className="border border-primary " 
     placement="bottom"
     target={`b${item.id}`}
     trigger="click"
   >
      <PopoverBody>
       <img src={item.itemURL}
         style={{ 'width': '250px', 'height': '250px' }} />
     </PopoverBody>
   </UncontrolledPopover>
  
 </div>
        </Card.Body>
       </Card>
      
    )
}
