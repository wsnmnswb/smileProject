import React from 'react';
import {Point} from '../plugins/ScanFaces';
import {FaceContour} from './FaceContour';

type FrameInfo = {
  faceContour: Point[];
  mouthContour: Point[];
};

const FaceFrameTemplate = ({faceContour, mouthContour}: FrameInfo) => {
  return (
    <>
      <FaceContour points={faceContour} />
      <FaceContour points={mouthContour} />
    </>
  );
};

export default FaceFrameTemplate;
