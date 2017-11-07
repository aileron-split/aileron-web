attribute vec2 a_position;
attribute vec2 a_texCoord;
attribute vec2 a_bgTexCoord;
 
varying vec2 v_texCoord;
varying vec2 v_bgTexCoord;
 
void main() {
	gl_Position = vec4(a_position, 0, 1);

	v_texCoord = a_texCoord;
	v_bgTexCoord = a_bgTexCoord;
}