import React, {useMemo} from 'react';
import Svg, {Path, Circle} from 'react-native-svg';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {StyleSheet, ViewProps} from 'react-native';
import {Point} from '../plugins/ScanFaces';
import {PHOTO_MARGIN_TOP, SCREEN_WIDTH} from '../assets/Constants';

interface CurveInfo {
  points: Point[];
  controlPoints: Point[];
}

function closedCatmullRomGenerator(
  points: Point[],
  alpha: number,
  tension: number,
): CurveInfo {
  'worklet';
  const dist = (p0: Point, p1: Point): number => {
    return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
  };

  const ps = points.slice();

  for (let i = ps.length - 1; i > 0; i--) {
    if (dist(ps[i], ps[i - 1]) < 1) {
      ps.splice(i, 1);
    }
  }
  if (dist(ps[0], ps[ps.length - 1]) < 1) {
    ps.splice(ps.length - 1, 1);
  }

  const numPoints = ps.length;
  if (numPoints < 2) {
    return {points: [], controlPoints: []};
  }

  ps.push(ps[0]);
  ps.push(ps[1]);
  ps.splice(0, 0, ps[numPoints - 1]);
  let curvePoints: Point[] = [];

  for (let i = 1; i < ps.length - 2; i++) {
    const p0 = ps[i - 1];
    const p1 = ps[i];
    const p2 = ps[i + 1];
    const p3 = ps[i + 2];

    const t0 = 0;
    const t1 = t0 + Math.pow(dist(p0, p1), alpha);
    const t2 = t1 + Math.pow(dist(p1, p2), alpha);
    const t3 = t2 + Math.pow(dist(p2, p3), alpha);

    const m1x =
      (1 - tension) *
      (t2 - t1) *
      ((p0.x - p1.x) / (t0 - t1) -
        (p0.x - p2.x) / (t0 - t2) +
        (p1.x - p2.x) / (t1 - t2));
    const m1y =
      (1 - tension) *
      (t2 - t1) *
      ((p0.y - p1.y) / (t0 - t1) -
        (p0.y - p2.y) / (t0 - t2) +
        (p1.y - p2.y) / (t1 - t2));
    const m2x =
      (1 - tension) *
      (t2 - t1) *
      ((p1.x - p2.x) / (t1 - t2) -
        (p1.x - p3.x) / (t1 - t3) +
        (p2.x - p3.x) / (t2 - t3));
    const m2y =
      (1 - tension) *
      (t2 - t1) *
      ((p1.y - p2.y) / (t1 - t2) -
        (p1.y - p3.y) / (t1 - t3) +
        (p2.y - p3.y) / (t2 - t3));

    const ax = 2 * p1.x - 2 * p2.x + m1x + m2x;
    const ay = 2 * p1.y - 2 * p2.y + m1y + m2y;
    const bx = -3 * p1.x + 3 * p2.x - 2 * m1x - m2x;
    const by = -3 * p1.y + 3 * p2.y - 2 * m1y - m2y;
    const cx = m1x;
    const cy = m1y;
    const dx = p1.x;
    const dy = p1.y;

    const amount = Math.max(10, Math.ceil(dist(p0, p1) / 10));

    for (let j = 1; j <= amount; j++) {
      const t = j / amount;
      const px = ax * t * t * t + bx * t * t + cx * t + dx;
      const py = ay * t * t * t + by * t * t + cy * t + dy;
      curvePoints.push({x: px, y: py});
    }
  }

  const controlPoints: Point[] = [];

  for (let i = 0; i < points.length; i++) {
    controlPoints.push({
      x: points[i].x,
      y: points[i].y,
    });
  }

  return {
    points: curvePoints,
    controlPoints: controlPoints,
  };
}

function serialize(curve: CurveInfo): string {
  'worklet';
  if (curve.points.length <= 2) {
    return '';
  }
  let serializedPath = '';
  serializedPath += 'M' + curve.points[0].x + ' ' + curve.points[0].y + ' ';
  for (let i = 1; i < curve.points.length; ++i) {
    serializedPath += 'L' + curve.points[i].x + ' ' + curve.points[i].y + ' ';
  }
  return serializedPath;
}

const processScale = (
  position: number,
  size: number,
  scale: number,
): number => {
  'worklet';
  return (position - size / 2) * scale + size / 2;
};

const inverseScale = (
  position: number,
  size: number,
  scale: number,
): number => {
  'worklet';
  return (position - size / 2) / scale + size / 2;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props extends ViewProps {
  callback: (points: Point[]) => void;
  points: Point[];
  tension: number;
  alpha: number;
  frameWidth: number;
  frameHeight: number;
  scale: number;
}

function InteractiveCurve({
  callback,
  points,
  tension,
  alpha,
  frameWidth,
  frameHeight,
  scale,
}: Props): React.ReactElement {
  const controlPoints = useSharedValue<Point[]>(
    points.map(point => {
      return {
        x: processScale(point.x, frameWidth, scale),
        y: processScale(point.y, frameHeight, scale),
      };
    }),
  );

  const initCurve = useMemo(() => {
    const curveRAW = closedCatmullRomGenerator(
      controlPoints.value,
      tension,
      alpha,
    );
    const curve = {
      points: curveRAW.points.map(point => {
        return {
          x: processScale(point.x, frameWidth, scale),
          y: processScale(point.y, frameHeight, scale),
        };
      }),
      controlPoints: curveRAW.controlPoints.map(point => {
        return {
          x: processScale(point.x, frameWidth, scale),
          y: processScale(point.y, frameHeight, scale),
        };
      }),
    };
    return curve;
  }, [controlPoints.value, tension, alpha, frameWidth, frameHeight, scale]);

  const curve = useSharedValue<CurveInfo>(initCurve);

  const dragIndex = useSharedValue(-1);

  const circlePoints = useSharedValue<Point[]>(initCurve.points);

  const panGestureEvent =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: event => {
        if (curve.value != null) {
          const pCurrent = {
            x: (event.x + SCREEN_WIDTH / 2) * (frameWidth / SCREEN_WIDTH),
            y: (event.y - PHOTO_MARGIN_TOP) * (frameWidth / SCREEN_WIDTH),
          };
          let minDist = 10000;
          let minIndex = -1;
          for (let i = 0; i < curve.value.controlPoints.length; ++i) {
            const dist = Math.sqrt(
              Math.pow(pCurrent.x - curve.value.controlPoints[i].x, 2) +
                Math.pow(pCurrent.y - curve.value.controlPoints[i].y, 2),
            );
            if (dist < minDist) {
              minIndex = i;
              minDist = dist;
            }
          }
          if (minDist < 50) {
            dragIndex.value = minIndex;
          } else {
            dragIndex.value = -1;
          }
        }
      },
      onActive: event => {
        runOnJS(callback)(
          controlPoints.value.map(point => {
            return {
              x: inverseScale(point.x, frameWidth, scale),
              y: inverseScale(point.y, frameHeight, scale),
            };
          }),
        );
        if (dragIndex.value >= 0) {
          const gestureX =
            (event.x + SCREEN_WIDTH / 2) * (frameWidth / SCREEN_WIDTH);
          const gestureY =
            (event.y - PHOTO_MARGIN_TOP) * (frameWidth / SCREEN_WIDTH);
          controlPoints.value[dragIndex.value] = {x: gestureX, y: gestureY};
        }
      },
    });

  const animatedPathProps = useAnimatedProps(() => {
    curve.value = closedCatmullRomGenerator(
      controlPoints.value,
      tension,
      alpha,
    );
    return {
      d: serialize(curve.value),
    };
  });

  const animatedCirclesProps = [];

  for (let i = 0; i < controlPoints.value.length; ++i) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const animatedCircleProps = useAnimatedProps(() => {
      circlePoints.value = controlPoints.value;
      return {
        cx: circlePoints.value[i].x,
        cy: circlePoints.value[i].y,
      };
    });
    animatedCirclesProps.push(animatedCircleProps);
  }

  return (
    <PanGestureHandler onGestureEvent={panGestureEvent}>
      <Animated.View style={styles.container}>
        <Svg style={styles.svg} viewBox={`0 0 ${frameWidth} ${frameHeight}`}>
          <AnimatedPath
            animatedProps={animatedPathProps}
            fill="red"
            opacity="0.2"
            stroke="red"
            strokeWidth="3"
          />
          {controlPoints.value.map((point, index) => {
            return (
              <AnimatedCircle
                animatedProps={animatedCirclesProps[index]}
                key={point.x * point.x + point.y}
                r="8"
                stroke="#EB5757"
                strokeWidth="2.5"
                fill="#EB5757"
                opacity="0.6"
              />
            );
          })}
        </Svg>
      </Animated.View>
    </PanGestureHandler>
  );
}

export default InteractiveCurve;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
});
