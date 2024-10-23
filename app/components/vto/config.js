// const DEFAULT_SIZE = { width: 1280, height: 720 };
const DEFAULT_SIZE = { width: 400, height: 500 };

export const config = {
  /**Adjust this to match the video input resolution. */
  videoSize: DEFAULT_SIZE,

  /**Linear Interpolation (lerp) amount.
   * Value between 0 and 1. Defaults to 0.5.
  */
  lerp: {
    value: 0.9,
    min: 0.1,
    max: 1,
    step: 0.05
  },

  /**Spherical Linear Interpolation (slerp) amount.
   * Value between 0 and 1. Defaults to 0.5.
  */
  slerp: {
    value: 0.4,
    min: 0.1,
    max: 1,
    step: 0.05
  },

  /**Field of View (FOV) for three js camera.
   * Value between 10 and 75. Defaults to 55.
  */
  fov: {
    value: 55,
    min: 10,
    max: 75,
    step: 5
  },
};
