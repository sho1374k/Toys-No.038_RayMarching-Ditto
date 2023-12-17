vec4 mirrored(vec4 v) {
    vec4 m = mod(v, 2.0);
    return mix(m, 2.0 - m, step(1.0, m));
}