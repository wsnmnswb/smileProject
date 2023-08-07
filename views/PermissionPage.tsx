import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {ImageRequireSource, Linking} from 'react-native';

import {StyleSheet, View, Text, Image, StatusBar} from 'react-native';
import {Camera, CameraPermissionStatus} from 'react-native-vision-camera';
import {CONTENT_SPACING, SAFE_AREA_PADDING} from '../assets/Constants';
import type {Routes} from './Routes';

type Props = NativeStackScreenProps<Routes, 'PermissionsPage'>;
const BANNER_IMAGE = require('../assets/img/teeth.jpg') as ImageRequireSource;

const PermissionsPage = ({navigation}: Props): React.ReactElement => {
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState<CameraPermissionStatus>('not-determined');

  const requestCameraPermission = useCallback(async () => {
    console.log('Requesting camera permission...');
    const permission = await Camera.requestCameraPermission();
    console.log(`Camera permission status: ${permission}`);

    if (permission === 'denied') await Linking.openSettings();
    setCameraPermissionStatus(permission);
  }, []);

  useEffect(() => {
    if (cameraPermissionStatus === 'authorized')
      navigation.replace('CameraPage');
  }, [cameraPermissionStatus, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Image source={BANNER_IMAGE} style={styles.banner} />
      <Text style={styles.welcome}>Welcome to{'\n'}Project Smile.</Text>
      <View style={styles.permissionsContainer}>
        {cameraPermissionStatus !== 'authorized' && (
          <Text style={styles.permissionText}>
            Project Smile needs{' '}
            <Text style={styles.bold}>Camera permission</Text>.
            <Text> Please </Text>
            <Text style={styles.hyperlink} onPress={requestCameraPermission}>
              Grant.
            </Text>
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    ...SAFE_AREA_PADDING,
  },
  banner: {
    position: 'absolute',
    opacity: 0.7,
    bottom: 0,
    left: 0,
  },
  welcome: {
    fontSize: 38,
    color: 'black',
    fontWeight: 'bold',
    maxWidth: '80%',
  },
  permissionsContainer: {
    marginTop: CONTENT_SPACING * 2,
  },
  permissionText: {
    color: 'black',
    fontSize: 17,
  },
  hyperlink: {
    color: '#007aff',
    fontWeight: 'bold',
  },
  bold: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default PermissionsPage;
