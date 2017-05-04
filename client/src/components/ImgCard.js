import React from 'react';
import { Col, Card, CardText } from 'reactstrap';
import ImageZoom from 'react-medium-image-zoom';
import LazyLoad from 'react-lazyload';

const ImgCard = ({ dirName, fileName }) => {
  
  const path = `/api/img/${dirName}/${fileName}`;

  // format caption
  // HH-MM-ss_frame.jpg -> HH:MM:ss Fframe
  const base = fileName.split('.')[0].split('_');
  const time = base[0].replace(/-/g, ':');
  let frame = '';
  if (base[1] !== undefined) {
    frame = `F${parseInt(base[1], 10) + 1}`
  }
  const caption = `${time} ${frame}`;

  return (
    <Col xl="2" md="3" sm="4" xs="6">
      <Card className="text-center">
        <LazyLoad offset={500} height={"100%"} once>
          <ImageZoom
            image={{
              src: path,
              alt: caption,
              className: 'img-fluid card-img-top'
            }}
          />
        </LazyLoad>
        <CardText>{caption}</CardText>
      </Card>
    </Col>
  );
}

export default ImgCard;