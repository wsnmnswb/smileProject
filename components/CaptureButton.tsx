import React, {useCallback, useMemo, useRef} from 'react';
import {Platform, StyleSheet, View, ViewProps} from 'react-native';
import {
  GestureHandlerRootView,
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import type {
  Camera,
  PhotoFile,
  TakePhotoOptions,
  TakeSnapshotOptions,
} from 'react-native-vision-camera';

import {CAPTURE_BUTTON_SIZE, SAFE_AREA_PADDING} from '../assets/Constants';
import Reanimated, {useSharedValue} from 'react-native-reanimated';

const BORDER_WIDTH = CAPTURE_BUTTON_SIZE * 0.1;

interface Props extends ViewProps {
  camera: React.RefObject<Camera>;
  onMediaCaptured: (media: PhotoFile, type: 'photo') => void;
  enabled: boolean;
  setIsPressingButton: (isPressingButton: boolean) => void;
}

export const _CaptureButton = ({
  camera,
  onMediaCaptured,
  enabled,
  setIsPressingButton,
}: Props) => {
  const takePhotoOptions = useMemo<TakePhotoOptions & TakeSnapshotOptions>(
    () => ({
      photoCodec: 'jpeg',
      qualityPrioritization: 'speed',
      quality: 90,
      skipMetadata: true,
    }),
    [],
  );
  const isPressingButton = useSharedValue(false);

  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');

      console.log('Taking photo...');

      if (Platform.OS === 'android') {
        const photo = await camera.current.takeSnapshot(takePhotoOptions);
        onMediaCaptured(photo, 'photo');
      } else {
        const photo = await camera.current.takePhoto(takePhotoOptions);
        onMediaCaptured(photo, 'photo');
      }
    } catch (e) {
      console.error('Failed to take photo!', e);
    }
  }, [camera, onMediaCaptured, takePhotoOptions]);

  const tapHandler = useRef<TapGestureHandler>();
  const onHandlerStateChanged = useCallback(
    async ({nativeEvent: event}: TapGestureHandlerStateChangeEvent) => {
      console.debug(`state: ${Object.keys(State)[event.state]}`);
      switch (event.state) {
        case State.BEGAN: {
          // enter "recording mode"
          isPressingButton.value = true;
          setIsPressingButton(true);
          return;
        }
        case State.END:
        case State.FAILED:
        case State.CANCELLED: {
          // exit "recording mode"
          try {
            await takePhoto();
          } finally {
            setTimeout(() => {
              isPressingButton.value = false;
              setIsPressingButton(false);
            }, 500);
          }
          return;
        }
        default:
          break;
      }
    },
    [isPressingButton, setIsPressingButton, takePhoto],
  );

  return (
    <TapGestureHandler
      enabled={enabled}
      ref={tapHandler}
      onHandlerStateChange={onHandlerStateChanged}>
      <Reanimated.View style={styles.flex}>
        <View style={styles.button} />
      </Reanimated.View>
    </TapGestureHandler>
  );
};

export const CaptureButton = React.memo(_CaptureButton);

const styles = StyleSheet.create({
  flex: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
  button: {
    width: CAPTURE_BUTTON_SIZE,
    height: CAPTURE_BUTTON_SIZE,
    borderRadius: CAPTURE_BUTTON_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: 'white',
  },
});
