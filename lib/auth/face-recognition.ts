'use client';

let modelsLoaded = false;

export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  const faceapi   = await import('face-api.js');
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

export async function getFaceDescriptor(video: HTMLVideoElement): Promise<number[] | null> {
  const faceapi   = await import('face-api.js');
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? Array.from(detection.descriptor) : null;
}

export async function drawFaceDetection(
  video:  HTMLVideoElement,
  canvas: HTMLCanvasElement
): Promise<boolean> {
  const faceapi   = await import('face-api.js');
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();
  if (!detection) return false;
  const size    = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, size);
  const resized = faceapi.resizeResults(detection, size);
  const ctx     = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, [resized]);
    faceapi.draw.drawFaceLandmarks(canvas, [resized]);
  }
  return true;
}
