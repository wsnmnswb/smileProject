import {Point} from '../plugins/ScanFaces';

export type Routes = {
  PermissionsPage: undefined;
  CameraPage: undefined;
  MediaPage: {
    path: string;
    type: 'photo';
    frameWidth: number;
    frameHeight: number;
    points: Point[];
  };
  ProcessPage: {
    path: string;
    type: 'photo';
    frameWidth: number;
    frameHeight: number;
    points: Point[];
  };
};
