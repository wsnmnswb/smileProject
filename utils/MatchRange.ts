import {Point} from '../plugins/ScanFaces';

export const matchRange = (
  pointsToMatch: Point[],
  points: Point[],
  threshold: number,
): Boolean => {
  'worklet';
  const xMinToMatch = Math.min(
    ...pointsToMatch.map(point => {
      return point.x;
    }),
  );
  const xMaxToMatch = Math.max(
    ...pointsToMatch.map(point => {
      return point.x;
    }),
  );
  const yMinToMatch = Math.min(
    ...pointsToMatch.map(point => {
      return point.y;
    }),
  );
  const yMaxToMatch = Math.max(
    ...pointsToMatch.map(point => {
      return point.y;
    }),
  );
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
  // console.log('test');
  // console.log(xMaxToMatch, ' ', xMax);
  // console.log(xMinToMatch, ' ', xMin);
  // console.log(yMaxToMatch, ' ', yMax);
  // console.log(yMinToMatch, ' ', yMin);
  const inRegion =
    Math.abs(xMaxToMatch - xMax) < threshold &&
    Math.abs(yMaxToMatch - yMax) < threshold &&
    Math.abs(xMinToMatch - xMin) < threshold &&
    Math.abs(yMinToMatch - yMin) < threshold;
  // console.log(inRegion);
  return inRegion;
};
