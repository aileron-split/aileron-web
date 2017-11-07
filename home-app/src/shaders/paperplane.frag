precision mediump float;
 
// DISPLAY options uniforms
uniform vec3 u_backgroundImageTint;
uniform float u_backgroundImageBrightness;

uniform vec3 u_cloudColor;
uniform float u_cloudOpacity;
uniform float u_cloudCutoff;
uniform float u_cloudIOR;
uniform vec3 u_rainColor;
uniform float u_rainOpacity;
uniform float u_rainCutoff;
uniform float u_rainIOR;

uniform vec4 u_solutes;
uniform float u_wetness;

varying vec3 v_normal;


float valueCutoff(float value, float opacity, float cutoff) {
	return clamp(max((value * opacity - cutoff) / (1.0 - cutoff), 0.0), 0.0, 1.0);
}

void main() {
	// TODO
	float wet = 0.4 * clamp(u_wetness, 0.0, 1.0);
	float cover = valueCutoff(u_solutes.a, 1.5 * u_cloudOpacity, u_cloudCutoff) * 0.97;

	vec3 normal = v_normal;
	if (normal.z < 0.0) normal = -normal;

	gl_FragColor = vec4(
		((1.0 - wet) * vec3(1.0) + wet * u_rainColor) * (0.2 * dot(normal, normalize(vec3(-1.0, 1.0, -0.5))) + 0.8)
		, 1.0 - cover);
}