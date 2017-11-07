attribute vec3 a_position;
attribute vec3 a_normal;

uniform vec3 u_location;
uniform vec3 u_direction;

uniform mat4 u_modelTranslationMat;
uniform mat4 u_modelRotationMat;
uniform mat4 u_perspectiveMat;

varying vec3 v_normal;


void main() {
	vec4 position = u_perspectiveMat * u_modelTranslationMat * u_modelRotationMat * vec4(a_position, 1.0);
	position /= position.w;

	position.xyz *= 0.023;
	position.xyz += 2.0 * u_location - vec3(1.0);

	gl_Position = position;

	//gl_Position = position;

	v_normal = normalize((u_modelRotationMat * vec4(a_normal, 1.0)).xyz);

	// TODO
}