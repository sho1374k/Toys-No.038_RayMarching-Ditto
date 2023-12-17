precision mediump float;
varying vec2 vUv;
uniform float uProgress1;
uniform float uProgress2;
uniform float uProgress3;
uniform float uAspect1;
uniform float uAspect2;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;

const float PI  = 3.141592653589793;
vec3 COLOR_BASE = vec3(0.9216, 0.8392, 1.0);
vec3 COLOR_BODY = vec3(0.890, 0.749, 0.898);
vec3 COLOR_EDGE = vec3(0.3451, 0.2863, 0.298);
vec3 COLOR_SHADOW = vec3(0.7294, 0.5765, 0.7373);

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

float smin(float a, float b, float k){
  float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
  return mix( b, a, h ) - k*h*(1.0-h);
}

float sphereSDF(vec3 p, float r){
  return length(p)-r;
}

float ellipsoidSDF(vec3 p, vec3 r){
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}

float verticalCapsuleSDF( vec3 p, float h, float r )
{
  p.y -= clamp( p.y, 0.0, h );
  return length( p ) - r;
}

float planeSDF(vec3 p, vec3 n, float h){
  return dot(p,n) + h;
}

float createBody(vec3 p){
  vec3 p1 = p, p2, p3, p4, p5, p6, p7, p8, p9;
  float body1 = sphereSDF(
    vec3(
      p1.x + 0.6,
      p1.y + 0.55,
      p1.z
    ), 0.3
  );
  float body2 = sphereSDF(
    vec3(
      p1.x + 0.1,
      p1.y + 0.525,
      p1.z
    ), 0.3
  );
  float body3 = sphereSDF(
    vec3(
      p1.x - 0.1,
      p1.y + 0.4,
      p1.z
    ), 0.3
  );
  float body4 = sphereSDF(
    vec3(
      p1.x - 0.5,
      p1.y + 0.6,
      p1.z
    ), 0.3
  );

  // hand left
  float time1 = sin(uTime * 20.0);
  p2 = rotate(p, vec3(0.0, 0.0, 1.0), PI * (0.3 + time1 * 0.01));
  p2 = vec3(
    p2.x + 0.2,
    p2.y - 0.75,
    p2.z
  );
  p2 = rotate(p2,vec3(0.0, 0.0, 1.0), PI * (time1 * 0.1));
  float body5 = ellipsoidSDF(
    p2, vec3(
      0.2, 
      0.3, 
      0.2
    )
  );

  float body6 = sphereSDF(
    vec3(
      p1.x + 0.3,
      p1.y + 0.2,
      p1.z
    ), 0.3
  );

  float body7 = sphereSDF(
    vec3(
      p1.x + 0.3,
      p1.y + 0.2,
      p1.z
    ), 0.3
  );

  // hand right
  p3 = rotate(p, vec3(0.0, 0.0, 1.0), PI * (-0.3));
  float body8 = ellipsoidSDF(
    vec3(
      p3.x - 0.35,
      p3.y - 1.0 + 0.45,
      p3.z
    ), vec3(
      0.2, 
      0.3, 
      0.2
    )
  );

  p4 = rotate(p, vec3(0.0, 0.0, 1.0), PI * -0.2);
  float body9 = ellipsoidSDF(
    vec3(
      p4.x + 0.45,
      p4.y - 0.25 + 0.05,
      p4.z - .25
    ), vec3(
      0.2, 
      0.3, 
      0.2
    )
  );

  p5 = rotate(p, vec3(0.0, 0.0, 1.0), PI * -0.25);
  float body10 = ellipsoidSDF(
    vec3(
      p5.x - 0.0,
      p5.y - 1.0 + 0.6 + 0.1,
      p5.z - .25 + 0.1
    ), vec3(
      0.2, 
      0.3, 
      0.2
    )
  );

  float dist = smin(body1, body2, 0.4);
  dist = smin(dist, body3, 0.4);
  dist = smin(dist, body4, 0.4);
  dist = smin(dist, body5, 0.4);
  dist = smin(dist, body6, 0.4);
  dist = smin(dist, body7, 0.4);
  dist = smin(dist, body8, 0.4);
  dist = smin(dist, body9, 0.25);
  dist = smin(dist, body10, 0.4);

  return dist;
}

float createEye(vec3 p){
  vec3 p1 = p, p2, p3;
  float left = sphereSDF(
    vec3(
      p1.x + 0.15,
      p1.y - 0.22,
      p1.z - 0.5
    ), 0.03
  );

  float right = sphereSDF(
    vec3(
      p1.x - 0.225,
      p1.y - 0.175,
      p1.z - 0.5
    ), 0.03
  );

  float dist = left;
  dist = min(dist, right);
  return dist;
}

float createMouth(vec3 p){
  vec3 p1 = p, p2, p3;
  float k = 0.656 - 0.226;
  float c = cos(k*p.x);
  float s = sin(k*p.x);
  mat2  m = mat2(c,-s,s,c);
  vec3  q = vec3(m*p.xy,p.z);

  p1 = rotate(q, vec3(0.0, 0.0, 1.0), PI * (1.5 - 0.041));
  float base = verticalCapsuleSDF(
    vec3(
      p1.x + 0.05,
      p1.y + 0.3,
      p1.z - 0.5
    ), 0.6, 0.02
  );

  float dist = base;
  return dist;
}

vec2 sceneSDF(vec3 p){
  float dist, id = 0.0;
  vec3 p1=p,p2=p,p3=p;

  vec2 pointer = uPointer * 2.0;
  pointer.x *= uAspect1;

  p1 = rotate(
    p1,
    vec3(1.0, 1.0, 1.0),
    mix(0.0,PI * 2.0,uProgress1)
  );


  float sphere = sphereSDF(p, 0.8);
  float body = mix(createBody(p1), sphere, uProgress1);
  float eye = createEye(p1);
  float mouth = createMouth(p1);
  float pointerSphere = sphereSDF(
    p - vec3(pointer, -0.1 + 0.2 * uProgress1),
    0.3
  );

  dist = body;
  dist = min(dist, eye);
  dist = min(dist, mouth);
  dist = smin(dist, pointerSphere, 0.3);

  if(abs(dist - body) < 0.001) {
    id = 0.0;
  } else if(abs(dist - eye) < 0.001) {
    id = 1.0;
  } else if(abs(dist - mouth) < 0.001) {
    id = 1.0;
  } else if(abs(dist - sphere) < 0.001) {
    id = 2.0;
  } else if(abs(dist - pointerSphere) < 0.001) {
    id = 0.0;
  }
  return vec2(dist, id);
}

vec3 calcNormal(vec3 p){
  float eps = 0.0001;
  vec2 h = vec2(eps,0.0);
  return normalize(vec3(
    sceneSDF(p+h.xyy).x - sceneSDF(p-h.xyy).x, 
    sceneSDF(p+h.yxy).x - sceneSDF(p-h.yxy).x, 
    sceneSDF(p+h.yyx).x - sceneSDF(p-h.yyx).x
  ));
}

void main() {
  vec2 uv = vUv * 2.0 - vec2(1.0);
  uv.x *= uAspect1;

  vec3 rayPos, ligthPos = vec3(-2.0, 3.5, 1.5),
  cameraPos = vec3(0.0, 0.0, 2.0),
  cameraDir = vec3(0.0, 0.0, -1.0),
  cameraUp = vec3(0.0, 1.0, 0.0),
  cameraSide = cross(cameraDir, cameraUp);

  float targetDepth = 1.0;
  vec3 ray = normalize((cameraSide * uv.x) + (cameraUp * uv.y) + (cameraDir * targetDepth));

  ray = normalize(ray);

  float rayStep = 0.0, rayStepMax = 5.0, id = 0.0;
  for(int i = 0; i < 128; i++) {
    rayPos = ray * rayStep + cameraPos;
    float rayHit = sceneSDF(rayPos).x;
    id = sceneSDF(rayPos).y;
    if(rayHit < 0.0001 || rayStep > rayStepMax) break;
    rayStep+=rayHit;
  }

  vec3 color = COLOR_BASE, edgeColor = COLOR_EDGE;
  if(rayStep < rayStepMax) {
    vec3 normal = calcNormal(rayPos);
    float diff  = dot(ligthPos, normal);

    float edge = 2.0;
    if(id == 0.0) {
      edge = 1.0;
      color = COLOR_BODY + vec3(diff) * 0.025;

      vec3 color1 = COLOR_BODY + vec3(diff) * 0.025;
      vec3 color2 = vec3(1.0) + vec3(diff) * 1.0;
      color2 = vec3(
        step(color2.r, 0.5),
        step(color2.g, 0.5),
        step(color2.b, 0.5)
      );
      color = color2 + color1;
      if(color.r > 1.0 && color.g > 1.0 && color.b > 1.0) color = COLOR_SHADOW;
    } else if(id == 1.0) {
      edge = 1.0;
      edgeColor = COLOR_EDGE;
      color = edgeColor;
    } else if(id == 2.0) {
      edge = 1.0;
      color = COLOR_BODY;
    } else if(id == 3.0) {
      edge = 1.0;
      color = COLOR_BODY + vec3(diff) * 0.025;
    }

    float fresnel = pow(1.0 + dot(ray, normal), edge);
    float invertFresnel = 1.0 - fresnel;

    float stepFresnel = 1.0 - step(fresnel, 0.6);
    float stepInvertFresnel = 1.0 - step(invertFresnel, 0.4);

    vec3 outline = edgeColor * stepFresnel;
    vec3 base = color * stepInvertFresnel;
    color = base + outline;
  }

  vec4 dist = mix(vec4(COLOR_BASE, 1.0), vec4(color, 1.0), uProgress2);

  gl_FragColor = dist;
}