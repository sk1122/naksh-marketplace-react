import React, { Component, Fragment } from 'react';
import { Col, Row } from 'react-bootstrap';

import AboutCard from '../../components/about/AboutCard';
import connectNear from '../../assets/svgs/connect-near-gradient.svg';
import classes from './about.module.css';

export default function NearProtocol() {
    return (
        <Row>
            <Col lg={5}>
                <div style={{fontFamily:'Athelas-Bold', fontSize:42}}>Why NEAR?</div>
                <div style={{fontSize:16, letterSpacing:0.5}}>At Naksh, we believe in not only talking the talk but also walking the walk. Our effort in creating a conscious marketplace led to the decision of working with the NEAR ecosystem.</div>
                <div 
                    style={{    
                        background: "white",
                        width: "215px",
                        height: "50px",
                        borderRadius: "4px",
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "center",
                        marginTop:50
                    }}
                >
                    <img src={connectNear} alt="near"/>
                </div>
            </Col>
            <Col lg={7}>

            </Col>
        </Row>
    )
}
