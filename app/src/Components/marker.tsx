import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Geo } from 'react-bootstrap-icons';

interface MarkerProps {
  lat: number,
  lng: number,
  name: string
}

function Marker(props: MarkerProps) {
  return (
    <OverlayTrigger overlay={<Tooltip id={`marker-${props.name}-tooltip`}>{props.name}</Tooltip>}>
      <div className='marker'><div className='marker-icon'><Geo /></div></div>
    </OverlayTrigger>
  );
}

export default Marker;