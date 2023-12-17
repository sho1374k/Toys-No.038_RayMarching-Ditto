export const BREAK_POINT = 768;

export const TYPE = {
  t: "uniform1i",
  i: "uniform1i",
  iv: "uniform1iv",
  f: "uniform1f",
  v1: "uniform1fv",
  v2: "uniform2fv",
  v3: "uniform3fv",
  v4: "uniform4fv",
  m2: "uniformMatrix2fv",
  m3: "uniformMatrix3fv",
  m4: "uniformMatrix4fv",
};

export const Params = {
  isMatchMediaWidth: window.matchMedia("(max-width: 768px)").matches,
  isMatchMediaHover: window.matchMedia("(hover: hover)").matches,
  w: window.innerWidth,
  h: window.innerHeight,
  beforeWidth: window.innerWidth,
  longer: 0,
  shorter: 0,
  aspect: 0,
};

export const UpdateParams = () => {
  Params.isMatchMediaWidth = window.matchMedia("(max-width: 768px)").matches;
  Params.isMatchMediaHover = window.matchMedia("(hover: hover)").matches;
  Params.w = window.innerWidth;
  Params.h = window.innerHeight;
  Params.aspect = Params.w / Params.h;
  Params.longer = Params.w > Params.h ? Params.w : Params.h;
  Params.shorter = Params.w < Params.h ? Params.w : Params.h;
};
