import * as React from 'react';
import {runOnJS, useSharedValue} from 'react-native-reanimated';
import {Dimensions, Platform, StyleSheet, View} from 'react-native';
import {
  useCameraDevices,
  useFrameProcessor,
  PhotoFile,
} from 'react-native-vision-camera';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Camera} from 'react-native-vision-camera';
import {scanFaces, Face, Point} from '../plugins/ScanFaces';
import {TEETH_CONTOUR_TEMPLATE} from '../assets/FaceTemplate';
import {AnimatedFaceContour, FaceContour} from '../components/FaceContour';
import {Svg, Text as SVGText} from 'react-native-svg';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {matchRange} from '../utils/MatchRange';
import {Routes} from './Routes';
import {useIsFocused} from '@react-navigation/native';
import {useIsForeground} from '../hooks/useIsForeground';
import {CaptureButton} from '../components/CaptureButton';

const screenWidth = Dimensions.get('screen').width;
type Props = NativeStackNavigationProp<Routes, 'CameraPage'>;

// @ts-ignore
export function CameraPage({navigation}: Props): React.ReactElement | null {
  const mounted = useSharedValue(true);
  const isPressingButton = useSharedValue(false);
  const camera = useRef<Camera>(null);

  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [faces, setFaces] = useState<Face[]>();
  const [teethContour, setTeethContour] = useState<Point[]>([]);
  const [frameWidth, setFrameWidth] = useState(720);
  const [frameHeight, setFrameHeight] = useState(1280);
  const [isSmile, setSmile] = useState<Boolean>(false);
  const [isFacingCamera, setFacingCamera] = useState<Boolean>(false);
  const [isTeethInRegion, setTeethInRegion] = useState<Boolean>(false);

  const devices = useCameraDevices();
  const device = devices.front;

  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocussed && isForeground;

  useEffect(() => {
    mounted.value = true;
    return () => {
      mounted.value = false;
    };
  });

  const flip = useMemo(() => {
    return Platform.OS === 'android';
  }, []);

  const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  }, []);

  const setIsPressingButton = useCallback(
    (_isPressingButton: boolean) => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton],
  );

  const teeth_contour_template = useMemo(() => {
    return flip
      ? TEETH_CONTOUR_TEMPLATE.map((point: {x: number; y: number}) => {
          return {
            x: ((1080 - point.x) * frameWidth) / 1080,
            y: (point.y * frameWidth) / 1080,
          };
        })
      : TEETH_CONTOUR_TEMPLATE;
  }, [flip, frameWidth]);

  const updateFrameSize = (width: number, height: number) => {
    if (mounted.value) {
      setFrameWidth(width);
      setFrameHeight(height);
    }
  };

  const onMediaCaptured = useCallback(
    (media: PhotoFile, type: 'photo') => {
      navigation.navigate('MediaPage', {
        path: media.path,
        type: type,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        points: teethContour,
      });
    },
    [navigation, frameWidth, frameHeight, teethContour],
  );

  useEffect(() => {
    setTeethInRegion(matchRange(teethContour, teeth_contour_template, 30));
  }, [teethContour, teeth_contour_template]);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    if (frame.width < frame.height) {
      runOnJS(updateFrameSize)(frame.width, frame.height);
    } else {
      runOnJS(updateFrameSize)(frame.height, frame.width);
    }
    const scannedFaces = scanFaces(frame);
    runOnJS(setFaces)(scannedFaces);
    if (scannedFaces?.length) {
      runOnJS(setSmile)(scannedFaces[0].smilingProbability > 0.9);
      runOnJS(setFacingCamera)(
        scannedFaces[0].pitchAngle < 10 &&
          scannedFaces[0].pitchAngle > -10 &&
          scannedFaces[0].rollAngle < 10 &&
          scannedFaces[0].rollAngle > -10 &&
          scannedFaces[0].yawAngle < 10 &&
          scannedFaces[0].yawAngle > -10,
      );
      runOnJS(setTeethContour)(
        flip
          ? scannedFaces[0].contours.UPPER_LIP_BOTTOM.concat(
              scannedFaces[0].contours.LOWER_LIP_TOP,
            ).map(point => {
              return {
                x: frameWidth - point.x,
                y: point.y,
              };
            })
          : scannedFaces[0].contours.UPPER_LIP_TOP.concat(
              scannedFaces[0].contours.LOWER_LIP_TOP,
            ).map(point => {
              return {
                x: point.x,
                y: point.y,
              };
            }),
      );
    } else {
      runOnJS(setSmile)(false);
      runOnJS(setFacingCamera)(false);
      runOnJS(setTeethContour)([]);
    }
  }, []);

  return device != null ? (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={{
          position: 'absolute',
          width: screenWidth,
          height: (screenWidth * frameHeight) / frameWidth,
        }}
        device={device}
        isActive={isActive}
        onInitialized={onInitialized}
        photo={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={20}
      />
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${frameWidth} ${frameHeight}`}>
        {/*{isSmile ? null : (*/}
        {/*  <SVGText*/}
        {/*    fill="purple"*/}
        {/*    stroke="purple"*/}
        {/*    fontSize="30"*/}
        {/*    fontWeight="bold"*/}
        {/*    x="50"*/}
        {/*    y="50">*/}
        {/*    未检测到全部牙齿，请张嘴微笑*/}
        {/*  </SVGText>*/}
        {/*)}*/}
        {isFacingCamera ? null : (
          <SVGText
            fill="white"
            stroke="white"
            fontSize="30"
            opacity="0.1"
            textAnchor="middle"
            x={frameWidth / 2}
            y="70">
            未正对屏幕，请直面相机
          </SVGText>
        )}
        {isTeethInRegion ? null : (
          <SVGText
            fill="white"
            stroke="white"
            fontSize="30"
            opacity="0.1"
            textAnchor="middle"
            x={frameWidth / 2}
            y="150">
            请将牙齿区域对准白色模板
          </SVGText>
        )}
        {faces?.length ? (
          <AnimatedFaceContour points={teethContour} match={isTeethInRegion} />
        ) : null}
        {isActive ? (
          <FaceContour
            points={teeth_contour_template}
            fill="white"
            opacity="0.2"
            strokeWidth="3"
            stroke="white"
          />
        ) : null}
      </Svg>
      {isTeethInRegion && isFacingCamera && isActive ? (
        <CaptureButton
          camera={camera}
          onMediaCaptured={onMediaCaptured}
          enabled={isCameraInitialized && isActive}
          setIsPressingButton={setIsPressingButton}
        />
      ) : null}
    </View>
  ) : null;
}

export default CameraPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
});
