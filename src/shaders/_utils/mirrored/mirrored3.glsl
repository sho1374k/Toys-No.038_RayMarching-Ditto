vec3 mirrored(vec3 v) {
    vec3 m = mod(v, 2.0);
    return mix(m, 2.0 - m, step(1.0, m));
}