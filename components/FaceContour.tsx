import React from 'react';
import {Point} from '../plugins/ScanFaces';
import {Path} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type ContourInfo = {
  points: Point[];
  match: Boolean;
};

function serialize(curve: Point[]): string {
  'worklet';
  if (curve.length <= 2) {
    return '';
  }
  let serializedPath = '';
  serializedPath += `M${curve[0].x} ${curve[0].y} `;
  for (let i = 1; i < curve.length; ++i) {
    serializedPath += `L${curve[i].x} ${curve[i].y} `;
  }
  return serializedPath;
}

export const AnimatedFaceContour = ({points, match}: ContourInfo) => {
  const curve = useSharedValue<Point[]>(points);

  const animatedPathProps = useAnimatedProps(() => {
    curve.value = points;
    return {
      d: serialize(curve.value),
    };
  });

  return points ? (
    <AnimatedPath
      animatedProps={animatedPathProps}
      opacity="0.2"
      strokeWidth="3"
      fill={match ? 'green' : 'red'}
      stroke={match ? 'green' : 'red'}
    />
  ) : null;
};

type Props = {
  points: Point[];
  fill: string;
  opacity: string;
  stroke: string;
  strokeWidth: string;
};

export const FaceContour = ({
  points,
  fill,
  opacity,
  stroke,
  strokeWidth,
}: Props) => {
  return points ? (
    <Path
      d={serialize(points.concat(points[0]))}
      fill={fill}
      opacity={opacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  ) : null;
};
