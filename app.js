'use strict';

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';

function main() {
  // create WebGLRenderer
  const canvas = document.querySelector('#canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas
  });

  // create camera
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  // create scene
  const scene = new THREE.Scene();

  // 큐브 메쉬 생성에 필요한 box geometry를 만들어놓음
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  // 생성한 큐브 메쉬를 담아놓을 배열. animate 함수에서 큐브를 회전시킬 때 사용할거임
  const cubes = [];

  // 큐브 메쉬의 베이직-머티리얼에 입혀줄 캔버스 텍스처와, 그 캔버스 텍스처를 만드는 데 필요한 캔버스를 만듦.
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 256;
  ctx.canvas.height = 256; // 2DContext 안에는 캔버스가 내장되어 있음.
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 256*256 사이즈의 흰색 배경 캔버스를 만듦.
  const texture = new THREE.CanvasTexture(ctx.canvas); // 위에서 만든 2DCanvas를 넘겨줘서 캔버스 텍스처를 생성함.

  // 위에서 만든 캔버스 텍스처를 입혀준 베이직-머티리얼을 생성한 뒤 그걸로 큐브 메쉬를 만듦.
  const material = new THREE.MeshBasicMaterial({
    map: texture
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube); // 씬에 추가
  cubes.push(cube); // cubes 배열에도 추가

  // resize renderer
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  // 전달받은 최솟값과 최댓값 사이의 랜덤한 정수값을 리턴해주는 함수
  function randomInt(min, max) {
    if (max === undefined) {
      // 만약 min값만, 즉 하나의 인수만 전달받아서 호출되면, 최댓값을 전달받은 인수로 두고, 최솟값은 0으로 둠.
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min | 0; // min ~ max까지의 랜덤값을 계산한 뒤, 비트연산자로 소수점을 제거한 정수값을 리턴해 줌.
  }

  // 랜덤한 컬러값, 반지름, x, y 좌표값을 리턴받아서 매 프레임마다 2D 캔버스에 원을 그려주는 함수
  function drawRandomDot() {
    /**
     * 1. randomInt(0x1000000)은 0 ~ 0x1000000 사이의 랜덤한 정수값을 리턴해주겠지?
     * 근데 왜 0x1000000일까? 해당 16진수를 10진수로 변환해보면, 0xFFFFFF보다 0x1000000이 1만큼 더 크다.
     * Math.random()은 0 이상 '1 미만'의 숫자를 랜덤으로 리턴해주기 때문에, 0xFFFFFF를 전달해주면 0xFFFFFF는 리턴받을 수 없다는 뜻이 됨.
     * 그래서 이거보다 1만큼 더 큰 0x1000000을 전달해줘서 0xFFFFFF 까지는 리턴받을 수 있도록 하는것임.
     * 참고로, 16진수는 컬러코드로 표현할때만 6자리로 표현하는 것이지, 반드시 16진수를 6자리로만 써야한다는 법은 없음. 왜 6자리냐면, 2자리씩 각각 r, g, b값을 표현하기 위해서 그런 것.
     * 
     * 2. toString(16) 
     * 1번에서는 16진수를 리턴받는 게 아니라, 비트연산자로 소수점을 제거한 10진수 정수값을 리턴받기 때문에, 
     * fillStyle에 넣어줄 16진수 컬러코드로 바꾸려면, toString(16) 메서드를 이용해서 16진수값의 문자열을 리턴받으면 됨.
     * 
     * 3. String.padStart(6, '0')
     * padStart(목표길이, padString)는 현재 문자열의 길이를 주어진 목표길이로 맞추기 위해서, 
     * 주어진 padString을 현재 문자열의 시작지점(좌측)부터 채워준 문자열을 리턴해 줌.
     * 그니까, 2번까지 리턴받은 16진수 문자열이 'FFFFFF' 이런식으로 6자리를 꽉 채운 값이 나올수도 있지만,
     * 'F' 이렇게만 달랑 나오면, fillStyle이 '#F' 이런 형태의 컬러코드를 이해하지 못함. 
     * 그래서 이거를 '#00000F' 이렇게 '0'으로 6자리를 채워준 문자열로 리턴해준다는 것. 
     */
    ctx.fillStyle = `#${randomInt(0x1000000).toString(16).padStart(6, '0')}`;
    ctx.beginPath();

    const x = randomInt(256);
    const y = randomInt(256); // 원의 x, y좌표값을 캔버스의 0 ~ width, height 사이의 랜덤한 정수값으로 지정해 줌.
    const radius = randomInt(10, 64); // 원의 반지름을 10 ~ 64 사이의 랜덤한 정수값으로 지정해 줌.
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // animate
  function animate(t) {
    t *= 0.001; // 밀리초 단위 타임스탬프값을 초 단위로 변환함.

    // 렌더러가 리사이징되면 변경된 사이즈에 맞게 카메라 비율(aspect)도 업데이트 해줌.
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    drawRandomDot(); // 캔버스 텍스처로 지정한 2DCanvas에 매 프레임마다 원을 그려주는 애니메이션을 만드는 함수를 렌더링 루프에서 매 프레임마다 호출함.
    // 캔버스 텍스처는 기본적으로 대부분의 Texture 클래스와 유사하나, needsUpdate의 기본값 자체가 true로 지정되어 있다는 점이 다름.
    // 해당 속성값이 true로 지정되어 있어야만 변경된 2D 캔버스 데이터가 로드되기 때문임.
    // needsUpdate가 false더라도 렌더링은 되는 다른 텍스처들과는 달리, 캔버스 텍스처는 needsUpdate가 false면 애초에 캔버스에 그려진 픽셀 데이터가 캔버스 텍스처에 넘어가지 않아서 아무것도 그려지지 않을거라는 뜻.
    texture.needsUpdate = true;

    // cubes 안에 들어있는 큐브 메쉬들을 각각의 다른 속도로 매 프레임마다 회전시켜 줌
    cubes.forEach((cube, index) => {
      const speed = 0.2 + index * 0.1;
      const rotate = t * speed;
      cube.rotation.x = rotate;
      cube.rotation.y = rotate;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(animate); // 내부에서 반복 호출
  }

  requestAnimationFrame(animate);
}

main();