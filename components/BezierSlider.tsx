import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {clamp, ReText, serialize} from 'react-native-redash';
import Svg, {Path, PathProps} from 'react-native-svg';

import {
  DOT_SIZE,
  SLIDER_WIDTH,
  PADDING_HORIZONTAL,
  SAFE_AREA_PADDING,
} from '../assets/Constants';
import {createCurve} from '../utils/getControlPointByDirection';

export enum DIRECTIONS {
  STANDING = 0,
  LEFT = 1,
  RIGHT = 2,
}

interface BezierSliderProps {
  callback: (color: number) => void;
}

// @ts-ignore
const AnimatedPath = Animated.createAnimatedComponent<PathProps, any>(Path);

export const BezierSlider: React.FC<BezierSliderProps> = ({
  callback,
}: BezierSliderProps) => {
  const translateX = useSharedValue<number>(DOT_SIZE / 2);
  const translateY = useSharedValue<number>(0);

  const value = useDerivedValue(() => {
    const numericValue = interpolate(
      translateX.value,
      [0 + DOT_SIZE / 2, SLIDER_WIDTH - DOT_SIZE / 2 - PADDING_HORIZONTAL],
      [0, 100],
    );
    return numericValue.toFixed(0);
  });

  const animatedProps = useAnimatedProps(() => {
    const {curve} = createCurve(translateX, translateY);
    return {
      d: serialize(curve),
    };
  });

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {offsetX: number}
  >({
    onActive: ({translationX}, context) => {
      translateX.value = clamp(
        translationX + context.offsetX,
        0 + DOT_SIZE / 2,
        SLIDER_WIDTH - DOT_SIZE / 2 - PADDING_HORIZONTAL,
      );
      runOnJS(callback)(parseInt(value.value, 10));
    },
    onEnd: (_event, _) => {
      translateY.value = withSpring(0, {
        damping: 10,
        mass: 1,
        stiffness: 180,
        velocity: 15,
      });
    },

    onStart: (_event, context) => {
      translateY.value = withSpring(-15, {
        damping: 10,
        mass: 1,
        stiffness: 180,
        velocity: 15,
      });
      context.offsetX = translateX.value;
    },
  });

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}, {translateY: translateY.value}],
  }));

  const animatedPrice = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={styles.container}>
        <Animated.View style={[styles.valueContainer, animatedPrice]}>
          <ReText style={styles.value} text={value} />
        </Animated.View>
        <View style={{...StyleSheet.absoluteFillObject}}>
          <Svg
            width={SLIDER_WIDTH}
            height={40}
            viewBox={`0 0 ${SLIDER_WIDTH} 40`}>
            <AnimatedPath
              animatedProps={animatedProps}
              stroke="white"
              strokeWidth="2"
            />
          </Svg>
        </View>
        <Animated.View style={[styles.dot, animatedDotStyle]} />
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: PADDING_HORIZONTAL,
    bottom: SAFE_AREA_PADDING.paddingBottom + 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    borderRadius: 10,
    height: DOT_SIZE,
    top: 40,
    width: DOT_SIZE,
  },
  value: {
    position: 'absolute',
    color: 'white',
    fontFamily: 'Ridley Grotesk',
    fontSize: 15,
  },
  valueContainer: {
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 10,
    elevation: 5,
    height: 30,
    left: -40,
    position: 'absolute',
    width: 50,
  },
});
