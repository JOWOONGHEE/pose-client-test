let video;
let poseNet;
let pose;
let skeleton;

let squatCount = 0; // 스쿼트 카운트 변수
let squatThreshold = 0.4; // 스쿼트 동작 인식 임계값

// 이전 스쿼트 동작 상태와 위치
let prevSquatState = false;
let currentSquatState = false;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;

    // 스쿼트 동작 체크
    let leftKnee = pose.leftKnee;
    let rightKnee = pose.rightKnee;
    let leftHip = pose.leftHip;
    let rightHip = pose.rightHip;

    if (
      leftKnee.confidence > squatThreshold &&
      rightKnee.confidence > squatThreshold &&
      leftHip.confidence > squatThreshold &&
      rightHip.confidence > squatThreshold &&
      leftKnee.y > leftHip.y &&
      rightKnee.y > rightHip.y &&
      leftHip.y > rightHip.y
    ) {
      currentSquatState = true;
      // 이전 스쿼트 동작 상태가 false인 경우에만 카운트 증가
      if (!prevSquatState) {
        squatCount++;
        console.log('Squat count:', squatCount);
        // 스쿼트 카운트를 HTML에 표시
        let countElement = document.getElementById('count');
        countElement.textContent = 'Squat Count: ' + squatCount;
      }
    } else {
      currentSquatState = false;
    }

    prevSquatState = currentSquatState;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  image(video, 0, 0);

  if (pose) {
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);

    fill(255, 0, 0);
    ellipse(pose.nose.x, pose.nose.y, d);
    fill(0, 0, 255);
    ellipse(pose.rightWrist.x, pose.rightWrist.y, 32);
    ellipse(pose.leftWrist.x, pose.leftWrist.y, 32);

    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0, 255, 0);
      ellipse(x, y, 16, 16);
    }

    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(255);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }

    // 스쿼트 상태 표시
    let statusElement = document.getElementById('status');
    if (currentSquatState && !prevSquatState) {
      statusElement.textContent = 'Status: Down';
    } else if (!currentSquatState && prevSquatState) {
      statusElement.textContent = 'Status: Up';
    } else {
      statusElement.textContent = 'Status: -';
    }
  }
}
