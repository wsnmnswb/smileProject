import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {Routes} from './views/Routes';
import {Camera, CameraPermissionStatus} from 'react-native-vision-camera';
import PermissionsPage from './views/PermissionPage';
import CameraPage from './views/CameraPage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {MediaPage} from './views/MediaPage';
import {ProcessPage} from './views/ProcessPage';

const Stack = createNativeStackNavigator<Routes>();

function App(): React.ReactElement | null {
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermissionStatus>();

  useEffect(() => {
    Camera.getCameraPermissionStatus().then(setCameraPermission);
  }, []);

  console.log(`Re-rendering Navigator. Camera: ${cameraPermission}`);

  if (cameraPermission == null) {
    // still loading
    return null;
  }

  const showPermissionsPage = cameraPermission !== 'authorized';
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationTypeForReplace: 'push',
          }}
          initialRouteName={
            showPermissionsPage ? 'PermissionsPage' : 'CameraPage'
          }>
          <Stack.Screen name="PermissionsPage" component={PermissionsPage} />
          <Stack.Screen name="CameraPage" component={CameraPage} />
          <Stack.Screen
            name="MediaPage"
            component={MediaPage}
            options={{
              animation: 'none',
              presentation: 'transparentModal',
            }}
          />
          <Stack.Screen
            name="ProcessPage"
            component={ProcessPage}
            options={{
              animation: 'none',
              presentation: 'transparentModal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
