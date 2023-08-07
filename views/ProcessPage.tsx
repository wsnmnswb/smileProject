import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  NativeSyntheticEvent,
  ImageLoadEventData,
  Image,
  StyleSheet,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Routes} from './Routes';
import {Point} from '../plugins/ScanFaces';
import {SAFE_AREA_PADDING, SCREEN_WIDTH} from '../assets/Constants';
import {PressableOpacity} from 'react-native-pressable-opacity';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {FaceContour} from '../components/FaceContour';
import {Svg} from 'react-native-svg';
import {BezierSlider} from '../components/BezierSlider';

const PHOTO_SCALE = 1 / 1.2;

type Props = NativeStackScreenProps<Routes, 'MediaPage'>;

export function ProcessPage({navigation, route}: Props): React.ReactElement {
  const {path, type, frameWidth, frameHeight, points} = route.params;
  const [hasMediaLoaded, setHasMediaLoaded] = useState<Boolean>(false);
  const [isColorPressed, setIsColorPressed] = useState<Boolean>(true);
  const [isReplacePressed, setIsReplacePressed] = useState<Boolean>(false);
  const [colorLevel, setColorLevel] = useState<number>(0);

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

  const source = useMemo(() => ({uri: `file://${path}`}), [path]);
  const screenStyle = useMemo(
    () => ({opacity: hasMediaLoaded ? 1 : 0}),
    [hasMediaLoaded],
  );

  const fitPoints = useMemo<Point[]>(() => {
    return points.map(point => {
      return {
        x: (point.x - frameWidth / 2) * PHOTO_SCALE + frameWidth / 2,
        y:
          point.y * PHOTO_SCALE -
          ((SAFE_AREA_PADDING.paddingTop / 2) * SCREEN_WIDTH) /
            frameWidth /
            PHOTO_SCALE,
      };
    });
  }, [points, frameWidth]);

  const callback = useCallback(color => {
    setColorLevel(color);
  }, []);

  // useEffect(() => {
  //   console.log(colorLevel);
  // }, [colorLevel]);

  const onColorPress = useCallback(() => {
    setIsColorPressed(true);
    setIsReplacePressed(false);
  }, []);
  const onReplacePress = useCallback(() => {
    setIsColorPressed(false);
    setIsReplacePressed(true);
  }, []);

  return (
    <View style={[styles.container, screenStyle]}>
      {type === 'photo' && (
        <Image
          source={source}
          style={{
            position: 'absolute',
            top: SAFE_AREA_PADDING.paddingTop / 2,
            width: SCREEN_WIDTH * PHOTO_SCALE,
            height: ((SCREEN_WIDTH * 16) / 9) * PHOTO_SCALE,
          }}
          resizeMode="cover"
          onLoadEnd={onMediaLoadEnd}
          onLoad={onMediaLoad}
        />
      )}

      {isColorPressed ? (
        <BezierSlider callback={callback} />
      ) : (
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${frameWidth} ${frameHeight}`}>
          <FaceContour
            points={fitPoints}
            fill="white"
            opacity="0.1"
            strokeWidth="1"
            stroke="white"
          />
        </Svg>
      )}

      <View style={styles.buttonContainer}>
        <PressableOpacity
          style={styles.closeButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <IonIcon name="close" size={35} color="white" style={styles.icon} />
        </PressableOpacity>

        <PressableOpacity
          style={[
            styles.contrastButton,
            // eslint-disable-next-line react-native/no-inline-styles
            {backgroundColor: isColorPressed ? 'white' : 'black'},
          ]}
          onPress={onColorPress}>
          <IonIcon
            name="eyedrop-outline"
            size={35}
            color={isColorPressed ? 'black' : 'white'}
            style={styles.icon}
          />
        </PressableOpacity>

        <PressableOpacity
          style={[
            styles.autoReplaceButton,
            // eslint-disable-next-line react-native/no-inline-styles
            {backgroundColor: isReplacePressed ? 'white' : 'black'},
          ]}
          onPress={onReplacePress}>
          <IonIcon
            name="color-wand-outline"
            size={35}
            color={isReplacePressed ? 'black' : 'white'}
            style={styles.icon}
          />
        </PressableOpacity>

        <PressableOpacity style={styles.confirmButton}>
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
  confirmButton: {
    width: 40,
    height: 40,
  },
  contrastButton: {
    borderRadius: 10,
    width: 40,
    height: 40,
  },
  autoReplaceButton: {
    borderRadius: 10,
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
