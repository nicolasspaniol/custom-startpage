// Transforms an array of 'heights' into a proper curve passing through all these points
// Returns another array of length (p-1)*s - 1 where p is the number of points passed and s is the step
// The first and last elements of the returning array are the same as of the passed one
// The 'start' and 'end' parameters are only used to calculate the direction of the curve
export default function calculateSpline(points, step, start = undefined, end = undefined) {
  const len = points.length;

  let result = new Array((len - 1) * step + 1);
  
  // Pre calculate the first part of the spline function for each step value
  const stepValues = new Array(step - 1);
  for (let i = 1; i < step; i++) {
    const t = i / step;
    const t2 = t**2;
    const t3 = t**3;

    stepValues[i - 1] = [
      (2*t2 - t3 - t)/2,
      (3*t3 - 5*t2 + 2)/2,
      (4*t2 - 3*t3 + t)/2,
      (t3 - t2)/2
    ];
  }

  // If start or end are not specified, make the ends straight
  start = start ?? points[0] - (points[1] - points[0]);
  end = end ?? points[len - 1] - (points[len - 2] - points[len - 1]);

  // Calculate the actual spline points
  for (let i = 0; i < len - 1; i++) {
    result[i * step] = points[i];
    for (let t = 0; t < stepValues.length; t++) {
      // 4x1 matrix cointaing the 4 given points around the target
      const pMat = [
        points?.[i - 1] ?? start,
        points[i],
        points[i + 1],
        points?.[i + 2] ?? end
      ];

      // 1x4 matrix containing the pre calculated values for the step
      const stepMat = stepValues[t];

      // Multiply both matrices and push to the final array
      result[i * step + t + 1] = pMat.reduce((p, c, i) => p + c * stepMat[i], 0);
    }
  }
  result[result.length - 1] = points[len - 1];

  return result;
}