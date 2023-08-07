import React from 'react';

import {Face} from '../plugins/ScanFaces';
import {AnimatedFaceContour} from './FaceContour';

type FrameInfo = {
  face: Face;
};

const FaceFrame = ({face}: FrameInfo) => {
  return face ? (
    <>
      <AnimatedFaceContour points={face.contours.FACE} />
      <AnimatedFaceContour points={face.contours.LEFT_EYE} />
      ;
      <AnimatedFaceContour points={face.contours.RIGHT_EYE} />;
      {face.contours.UPPER_LIP_BOTTOM && face.contours.LOWER_LIP_TOP ? (
        <AnimatedFaceContour
          points={face.contours.UPPER_LIP_BOTTOM.concat(
            face.contours.LOWER_LIP_TOP,
          )}
        />
      ) : null}
      ;
    </>
  ) : null;
};

export default FaceFrame;
