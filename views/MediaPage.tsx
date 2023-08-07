import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {
  SAFE_AREA_PADDING,
  STATUSBAR_HEIGHT,
  SCREEN_WIDTH,
  PHOTO_MARGIN_TOP,
} from '../assets/Constants';
import {PressableOpacity} from 'react-native-pressable-opacity';
import IonIcon from 'react-native-vector-icons/Ionicons';
import type {NativeSyntheticEvent} from 'react-native';
import type {ImageLoadEventData} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {Routes} from './Routes';
import InteractiveCurve from '../components/InteractiveCurve';
import {Point} from '../plugins/ScanFaces';

const PHOTO_SCALE = 2.7;

type Props = NativeStackScreenProps<Routes, 'MediaPage'>;

export function MediaPage({navigation, route}: Props): React.ReactElement {
  const {path, type, frameWidth, frameHeight, points} = route.params;
  const [hasMediaLoaded, setHasMediaLoaded] = useState(false);
  const [curveKey, setCurveKey] = React.useState(0);

  const onMediaLoad = useCallback(
    (event: NativeSyntheticEvent<ImageLoadEventData>) => {
      console.log(
        `Image loaded. Size: ${event.nativeEvent.source.width}x${event.nativeEvent.source.height}`,
      );
    },
    [],
  );
  const onMediaLoadEnd = useCallback(() => {
    console.log('media has loaded.');
    setHasMediaLoaded(true);
  }, []);

  const centerOffset = useMemo(() => {
    const xMin = Math.min(
      ...points.map(point => {
        return point.x;
      }),
    );
    const xMax = Math.max(
      ...points.map(point => {
        return point.x;
      }),
    );
    const yMin = Math.min(
      ...points.map(point => {
        return point.y;
      }),
    );
    const yMax = Math.max(
      ...points.map(point => {
        return point.y;
      }),
    );

    const centerX = (xMax + xMin) / 2 - frameWidth / 2;
    const centerY = (yMax + yMin) / 2 - frameHeight / 2;
    const offsetX =
      -((PHOTO_SCALE - 1) / 2) * SCREEN_WIDTH -
      ((centerX * SCREEN_WIDTH) / frameWidth) * PHOTO_SCALE;
    const offsetY =
      -((PHOTO_SCALE - 1) / 2) * ((SCREEN_WIDTH * 16) / 9) +
      (PHOTO_MARGIN_TOP - STATUSBAR_HEIGHT) -
      ((centerY * SCREEN_WIDTH) / frameWidth) * PHOTO_SCALE;
    return {
      frameOffsetX: centerX,
      frameOffsetY: centerY,
      screenOffsetX: offsetX,
      screenOffsetY: offsetY,
    };
  }, [points, frameWidth, frameHeight]);

  const [region, setRegion] = useState<Point[]>(
    points.map(point => {
      return {
        x: point.x - centerOffset.frameOffsetX,
        y: point.y - centerOffset.frameOffsetY,
      };
    }),
  );

  const onResetPressed = useCallback(() => {
    setCurveKey(key => key + 1);
  }, []);

  const onConfirmPressed = useCallback(() => {
    navigation.navigate('ProcessPage', {
      path: path,
      type: type,
      frameWidth: frameWidth,
      frameHeight: frameHeight,
      points: region.map(point => {
        return {
          x: point.x + centerOffset.frameOffsetX,
          y: point.y + centerOffset.frameOffsetY,
        };
      }),
    });
  }, [navigation, centerOffset, path, type, frameWidth, frameHeight, region]);

  const source = useMemo(() => ({uri: `file://${path}`}), [path]);

  const screenStyle = useMemo(
    () => ({opacity: hasMediaLoaded ? 1 : 0}),
    [hasMediaLoaded],
  );

  return (
    <View style={[styles.container, screenStyle]}>
      {type === 'photo' && (
        <Image
          source={source}
          style={{
            position: 'absolute',
            left: centerOffset.screenOffsetX,
            top: centerOffset.screenOffsetY,
            width: SCREEN_WIDTH * PHOTO_SCALE,
            height: ((SCREEN_WIDTH * 16) / 9) * PHOTO_SCALE,
          }}
          resizeMode="cover"
          onLoadEnd={onMediaLoadEnd}
          onLoad={onMediaLoad}
        />
      )}

      <InteractiveCurve
        callback={updatePoints => {
          setRegion(updatePoints);
        }}
        key={curveKey}
        points={points.map(point => {
          return {
            x: point.x - centerOffset.frameOffsetX,
            y: point.y - centerOffset.frameOffsetY,
          };
        })}
        frameHeight={frameHeight}
        frameWidth={frameWidth}
        alpha={0.5}
        tension={0}
        scale={PHOTO_SCALE}
      />

      <View style={styles.buttonContainer}>
        <PressableOpacity
          style={styles.closeButton}
          onPress={navigation.goBack}>
          <IonIcon name="close" size={35} color="white" style={styles.icon} />
        </PressableOpacity>

        <PressableOpacity style={styles.resetButton} onPress={onResetPressed}>
          <IonIcon
            name="refresh-outline"
            size={35}
            color="white"
            style={styles.icon}
          />
        </PressableOpacity>

        <PressableOpacity
          style={styles.confirmButton}
          onPress={onConfirmPressed}>
          <IonIcon
            name="checkmark-outline"
            size={35}
            color="white"
            style={styles.icon}
          />
        </PressableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100 %',
    bottom: SAFE_AREA_PADDING.paddingBottom,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  closeButton: {
    width: 40,
    height: 40,
  },
  resetButton: {
    width: 40,
    height: 40,
  },
  confirmButton: {
    width: 40,
    height: 40,
  },
  saveButton: {
    width: 40,
    height: 40,
  },
  icon: {
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 1,
  },
});
