/************************************************************************

   Copyright (C) 2017, Davor Bokun <bokundavor@gmail.com>

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.

*************************************************************************/

precision mediump float;
 
// DISPLAY options uniforms
uniform vec3 u_backgroundImageTint;
uniform float u_backgroundImageBrightness;

uniform vec3 u_updraftColor;
uniform float u_updraftOpacity;
uniform float u_updraftCutoff;
uniform float u_updraftIOR;
uniform vec3 u_pressureColor;
uniform float u_pressureOpacity;
uniform float u_pressureCutoff;
uniform float u_pressureIOR;
uniform vec3 u_cloudColor;
uniform float u_cloudOpacity;
uniform float u_cloudCutoff;
uniform float u_cloudIOR;
uniform vec3 u_rainColor;
uniform float u_rainOpacity;
uniform float u_rainCutoff;
uniform float u_rainIOR;
uniform vec3 u_humidityColor;
uniform float u_humidityOpacity;
uniform float u_humidityCutoff;
uniform float u_humidityIOR;
uniform vec3 u_temperatureColor;
uniform float u_temperatureOpacity;
uniform float u_temperatureCutoff;
uniform float u_temperatureIOR;
uniform vec3 u_humidityTemperatureColor;
uniform float u_humidityTemperatureOpacity;
uniform float u_humidityTemperatureCutoff;
uniform float u_humidityTemperatureIOR;
uniform vec3 u_relativeTemperatureColor;
uniform float u_relativeTemperatureOpacity;
uniform float u_relativeTemperatureCutoff;
uniform float u_relativeTemperatureIOR;
uniform vec3 u_updraftTemperatureColor;
uniform float u_updraftTemperatureOpacity;
uniform float u_updraftTemperatureCutoff;
uniform float u_updraftTemperatureIOR;

// STABILITY
uniform float u_globalStability;
uniform float u_inversionAltitude;
uniform float u_inversionTemperature;
uniform float u_grounInversionDepth;
uniform float u_groundInversionTemperature;


// our texture
uniform sampler2D u_basefluid; 	// [v.x, v.y, p, div]
uniform sampler2D u_solutes;	// [temperature, rain, humidity, mist]
uniform sampler2D u_background;

uniform vec2 u_resolution;

vec2 linearUnScale = 256.0 / u_resolution;
 
// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
varying vec2 v_bgTexCoord;

float ambient_temperature(float altitude) {
	if (altitude > u_inversionAltitude) {
		float belowInversionTemperature = u_groundInversionTemperature + u_globalStability * (u_inversionAltitude - u_grounInversionDepth);
		float inversionRate = (u_inversionTemperature - belowInversionTemperature) / (1.0 - u_inversionAltitude);

		return belowInversionTemperature + inversionRate * (altitude - u_inversionAltitude);
	}
	if (altitude < u_grounInversionDepth) {
		float grounInversionRate = u_groundInversionTemperature / u_grounInversionDepth;
		return altitude * grounInversionRate;
	}
	return u_groundInversionTemperature + u_globalStability * (altitude - u_grounInversionDepth);
}

float valueCutoff(float value, float opacity, float cutoff) {
	return clamp(max((value * opacity - cutoff) / (1.0 - cutoff), 0.0), 0.0, 1.0);
}

void main() {
	// compute 1 pixel in texture coordinates.
	vec2 onePixel = vec2(1.0, 1.0) / u_resolution;
	vec2 onePixel_x = vec2(1.0, 0.0) * onePixel;
	vec2 onePixel_y = vec2(0.0, 1.0) * onePixel;
	vec2 deltaScale = vec2(1.0, 1.0) / onePixel;

	// DISPLAY
	vec4 base = texture2D(u_basefluid, v_texCoord);
	vec4 baseL = 0.5 * texture2D(u_basefluid, v_texCoord - onePixel_x);
	vec4 baseR = 0.5 * texture2D(u_basefluid, v_texCoord + onePixel_x);
	vec4 baseU = 0.5 * texture2D(u_basefluid, v_texCoord + onePixel_y);
	vec4 baseD = 0.5 * texture2D(u_basefluid, v_texCoord - onePixel_y);
	vec4 solutes = texture2D(u_solutes, v_texCoord);
	vec4 solutesL = 0.5 * texture2D(u_solutes, v_texCoord - onePixel_x);
	vec4 solutesR = 0.5 * texture2D(u_solutes, v_texCoord + onePixel_x);
	vec4 solutesU = 0.5 * texture2D(u_solutes, v_texCoord + onePixel_y);
	vec4 solutesD = 0.5 * texture2D(u_solutes, v_texCoord - onePixel_y);

	float ambientTemp = ambient_temperature(v_texCoord.y);
	float dambientTemp_dy = (ambient_temperature(v_texCoord.y + onePixel.y) - ambient_temperature(v_texCoord.y - onePixel.y)) * deltaScale.y;

	vec2 bgRefraction;

	float updraft = valueCutoff(base.y * linearUnScale.y, u_updraftOpacity, u_updraftCutoff);
	bgRefraction += vec2(baseR.y - baseL.y, baseU.y - baseD.y) * linearUnScale.y * deltaScale * u_updraftIOR;

	float pressure = valueCutoff(base.p, u_pressureOpacity, u_pressureCutoff);
	bgRefraction += vec2(baseR.p - baseL.p, baseU.p - baseD.p) * deltaScale * u_pressureIOR;

	float cloud = valueCutoff(solutes.a, u_cloudOpacity, u_cloudCutoff);
	bgRefraction += vec2(solutesR.a - solutesL.a, solutesU.a - solutesD.a) * deltaScale * u_cloudIOR;

	float rain = valueCutoff(solutes.g, u_rainOpacity, u_rainCutoff);
	bgRefraction += vec2(solutesR.g - solutesL.g, solutesU.g - solutesD.g) * deltaScale * u_rainIOR;

	float humidity = valueCutoff(solutes.b, u_humidityOpacity, u_humidityCutoff);
	bgRefraction += vec2(solutesR.b - solutesL.b, solutesU.b - solutesD.b) * deltaScale * u_humidityIOR;

	float temperature = valueCutoff(solutes.r, u_temperatureOpacity, u_temperatureCutoff);
	bgRefraction += vec2(solutesR.r - solutesL.r, solutesU.r - solutesD.r) * deltaScale * u_temperatureIOR;

	float humidityTemperature = valueCutoff(solutes.r * solutes.b, u_humidityTemperatureOpacity, u_humidityTemperatureCutoff);
	bgRefraction += vec2(solutesR.r * solutesR.b - solutesL.r * solutesL.b, solutesU.r * solutesU.b - solutesD.r * solutesD.b) * deltaScale * u_humidityTemperatureIOR;

	float relativeTemperature = valueCutoff(solutes.r - ambientTemp, u_relativeTemperatureOpacity, u_relativeTemperatureCutoff);
	bgRefraction += vec2(solutesR.r - solutesL.r, solutesU.r - solutesD.r - dambientTemp_dy) * u_relativeTemperatureIOR;

	float updraftTemperature = valueCutoff(solutes.r * base.y * linearUnScale.y, u_updraftTemperatureOpacity, u_updraftTemperatureCutoff);
	bgRefraction += vec2(solutesR.r * baseR.y - solutesL.r * baseL.y, solutesU.r * baseU.y - solutesD.r * baseD.y) * deltaScale * u_updraftTemperatureIOR;

	vec4 color;
	float sum = pressure + updraft + cloud + rain + humidity + temperature + humidityTemperature + relativeTemperature + updraftTemperature;
	if (sum > 0.0 && v_texCoord.y > 0.0 && v_texCoord.y < 1.0) {
		color.rgb = (
			u_pressureColor * pressure +
			u_updraftColor * updraft +
			u_cloudColor * cloud +
			u_rainColor * rain +
			u_humidityColor * humidity +
			u_temperatureColor * temperature +
			u_humidityTemperatureColor * humidityTemperature +
			u_relativeTemperatureColor * relativeTemperature +
			u_updraftTemperatureColor * updraftTemperature
			) / sum;
		color.a = clamp(sum, 0.0, 1.0);
	}
	if (v_texCoord.y < 0.0 || v_texCoord.y > 1.0) {
		bgRefraction = vec2(0.0);
	}

	// Background
	vec4 background = texture2D(u_background, v_bgTexCoord + bgRefraction);
	background.rgb *= u_backgroundImageTint;
	background.rgb += vec3(u_backgroundImageBrightness);
	background = clamp(background, vec4(0.0), vec4(1.0));

	gl_FragColor = (1.0 - color.a) * background + color.a * color;
}