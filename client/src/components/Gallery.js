import React from 'react';
import { Container, Row } from 'reactstrap';
import ImgCard from './ImgCard.js';


const Gallery = ({ dirName, fileNames }) => {

  const Cards = fileNames.map(fileName => (
    <ImgCard key={fileName} dirName={dirName} fileName={fileName} />
  ));


  let Message = null;
  if (fileNames.length === 0) {
    Message = <div className="message">No Images</div>
  }

  return (
    <Container fluid>
      {Message}
      <Row>
        {Cards}
      </Row>
    </Container>
  );
}

export default Gallery;