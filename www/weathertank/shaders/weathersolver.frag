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
 
uniform sampler2D u_basefluid; 	// [v.x, v.y, p, div]
uniform sampler2D u_solutes;	// [temperature, rain, humidity, mist]
uniform sampler2D u_ground;		// [temperature, rain, humidity, mist]

uniform int u_calcFunction;
uniform float u_resolution;
uniform float u_diffusion;

float linearScale = u_resolution / 256.0;

float diffusion = u_diffusion * linearScale;
 
varying vec2 v_texCoord;

// compute 1 pixel in texture coordinates.
vec2 onePixel;

// BUOYANCY
uniform float u_buoyancyFactor;
uniform float u_rainFallingFactor;

float buoyancyFactor = u_buoyancyFactor * linearScale;
float rainFallingFactor = u_rainFallingFactor * linearScale;

// STABILITY
uniform float u_globalWind;
uniform float u_globalStability;

uniform float u_inversionAltitude;
uniform float u_inversionTemperature;
uniform float u_groundInversionDepth;
uniform float u_groundInversionTemperature;

const float globalWindFactor = 0.1;
const float upperWindFactor = 0.8;
const float groundFrictionFactor = 0.98;

uniform float u_heatDisipationRate;
float globalWind = u_globalWind * linearScale;


// DIFFUSION
uniform float u_initialHumidity;

uniform float u_temperatureDiffusion;
uniform float u_humidityDiffusion;
uniform float u_condensationFactor;
uniform float u_mistDiffusion;
uniform float u_mistToRainFactor;
uniform float u_rainFallDiffusion;
uniform float u_rainEvaporation;

float temperatureDiffusion = u_temperatureDiffusion * linearScale;
float humidityDiffusion = u_humidityDiffusion * linearScale;
float mistDiffusion = u_mistDiffusion * linearScale;
float rainFallDiffusion = u_rainFallDiffusion * linearScale;

uniform float u_condensationLevel;
uniform float u_latentHeat;

vec4 get_bounded_basefluid(vec2 coord) {
	vec4 X = texture2D(u_basefluid, coord);

	float correctedWind = (1.0 - globalWindFactor) * X.x + globalWindFactor * globalWind;
	if (coord.x < 0.0) return vec4(correctedWind, X.y, X.p, X.q);
	if (coord.x > 1.0) return vec4(correctedWind, X.y, X.p, X.q);
	if (coord.y < 0.0) return vec4(X.x * groundFrictionFactor, 0.0, X.p, X.q);
	if (coord.y > 1.0) return vec4(X.x, upperWindFactor * X.y, X.p, X.q);

	return X;
}

vec4 get_bounded_solutes(vec2 coord) {
	vec4 X = texture2D(u_solutes, coord);

	if (coord.y < onePixel.y * max(linearScale, 1.0)) {
		// GROUND interaction
		vec4 ground = texture2D(u_ground, coord) * 2.0;
		vec4 groundDelta = ground - X;
		groundDelta.b *= X.r; // Water exchange with ground proporional to temperature

		// Rain that fell to ground
		X.r -= u_latentHeat * X.g;
		X.g = 0.0; 
		
		return X + 0.02 * groundDelta * min(linearScale, 1.0);
	}
	if (coord.y > 1.0) return vec4(u_inversionTemperature, X.g, X.b, X.a); // Top of inversion layer is hot

	return X;
}

vec4 diffuse_base(vec2 coord) {
	return (texture2D(u_basefluid, coord) + diffusion * (
			get_bounded_basefluid(coord - onePixel * vec2(1.0, 0.0)) +
			get_bounded_basefluid(coord - onePixel * vec2(0.0, 1.0)) +
			get_bounded_basefluid(coord - onePixel * vec2(-1.0, 0.0)) +
			get_bounded_basefluid(coord - onePixel * vec2(0.0, -1.0))
			)) / (1.0 + diffusion * 4.0);
}

vec4 diffuse_solutes(vec2 coord) {
	vec4 solutes = texture2D(u_solutes, coord);
	vec4 solutes_u0 = get_bounded_solutes(coord - onePixel * vec2(-1.0, 0.0));
	vec4 solutes_u1 = get_bounded_solutes(coord - onePixel * vec2(1.0, 0.0));
	vec4 solutes_v0 = get_bounded_solutes(coord - onePixel * vec2(0.0, -1.0));
	vec4 solutes_v1 = get_bounded_solutes(coord - onePixel * vec2(0.0, 1.0));

	return vec4(
		(solutes.r + temperatureDiffusion * (solutes_u0.r + solutes_u1.r + solutes_v0.r + solutes_v1.r)) / (1.0 + temperatureDiffusion * 4.0),
		(solutes.g +
			diffusion * (solutes_u0.g + solutes_u1.g + solutes_v0.g + solutes_v1.g) +
			rainFallDiffusion * solutes_v0.g * (1.0 + solutes_v0.g)) /
		(1.0 + diffusion * 4.0 + rainFallDiffusion * (1.0 + solutes_v0.g)),
		(solutes.b + humidityDiffusion * (solutes_u0.b + solutes_u1.b + solutes_v0.b + solutes_v1.b)) / (1.0 + humidityDiffusion * 4.0),
		(solutes.a + mistDiffusion * (solutes_u0.a + solutes_u1.a + solutes_v0.a + solutes_v1.a)) /
		(1.0 + mistDiffusion * 4.0)
	);
}

vec4 advect_base(vec2 coord, vec2 v) {
	vec2 srcCoord00 = coord + onePixel * (-v - vec2(0.5));
	vec2 srcCoord01 = srcCoord00 + onePixel * vec2(0.0, 1.0);
	vec2 srcCoord10 = srcCoord00 + onePixel * vec2(1.0, 0.0);
	vec2 srcCoord11 = srcCoord00 + onePixel * vec2(1.0, 1.0);

	vec4 X00 = get_bounded_basefluid(srcCoord00);
	vec4 X01 = get_bounded_basefluid(srcCoord01);
	vec4 X10 = get_bounded_basefluid(srcCoord10);
	vec4 X11 = get_bounded_basefluid(srcCoord11);

	vec2 S1 = ceil(v) - v;
	vec2 S0 = vec2(1.0, 1.0) - S1;

	return S0.x * (S0.y * X00 + S1.y * X01) + S1.x * (S0.y * X10 + S1.y * X11);
}

vec4 advect_solutes(vec2 coord, vec2 v) {
	vec2 srcCoord00 = coord + onePixel * (-v - vec2(0.5));
	vec2 srcCoord01 = srcCoord00 + onePixel * vec2(0.0, 1.0);
	vec2 srcCoord10 = srcCoord00 + onePixel * vec2(1.0, 0.0);
	vec2 srcCoord11 = srcCoord00 + onePixel * vec2(1.0, 1.0);

	vec4 X00 = get_bounded_solutes(srcCoord00);
	vec4 X01 = get_bounded_solutes(srcCoord01);
	vec4 X10 = get_bounded_solutes(srcCoord10);
	vec4 X11 = get_bounded_solutes(srcCoord11);

	vec2 S1 = ceil(v) - v;
	vec2 S0 = vec2(1.0, 1.0) - S1;

	return S0.x * (S0.y * X00 + S1.y * X01) + S1.x * (S0.y * X10 + S1.y * X11);
}

float project_div(vec2 coord) {
	float h = 1.0 / u_resolution;
	float u0 = get_bounded_basefluid(coord - onePixel * vec2(-1.0, 0.0)).x;
	float u1 = get_bounded_basefluid(coord - onePixel * vec2(1.0, 0.0)).x;
	float v0 = get_bounded_basefluid(coord - onePixel * vec2(0.0, -1.0)).y;
	float v1 = get_bounded_basefluid(coord - onePixel * vec2(0.0, 1.0)).y;
	return -0.5 * h * (u1 - u0 + v1 - v0);
}
 
float project_p(vec2 coord) {
	float div = texture2D(u_basefluid, coord).q;
	float p0 = get_bounded_basefluid(coord - onePixel * vec2(1.0, 0.0)).p;
	float p1 = get_bounded_basefluid(coord - onePixel * vec2(0.0, 1.0)).p;
	float p2 = get_bounded_basefluid(coord - onePixel * vec2(-1.0, 0.0)).p;
	float p3 = get_bounded_basefluid(coord - onePixel * vec2(0.0, -1.0)).p;
	return (div + p0 + p1 + p2 + p3) / 4.0;
}
 
vec2 project_v(vec2 coord, vec2 v) {
	float h = 1.0 / u_resolution;
	float px0 = get_bounded_basefluid(coord - onePixel * vec2(-1.0, 0.0)).p;
	float px1 = get_bounded_basefluid(coord - onePixel * vec2(1.0, 0.0)).p;
	float py0 = get_bounded_basefluid(coord - onePixel * vec2(0.0, -1.0)).p;
	float py1 = get_bounded_basefluid(coord - onePixel * vec2(0.0, 1.0)).p;
	return v - 0.5 * vec2(px1 - px0, py1 - py0) / h;
}

float ambient_temperature(float altitude) {
	if (altitude > u_inversionAltitude) {
		float belowInversionTemperature = u_groundInversionTemperature + u_globalStability * (u_inversionAltitude - u_groundInversionDepth);
		float inversionRate = (u_inversionTemperature - belowInversionTemperature) / (1.0 - u_inversionAltitude);

		return belowInversionTemperature + inversionRate * (altitude - u_inversionAltitude);
	}
	if (altitude < u_groundInversionDepth) {
		float grounInversionRate = u_groundInversionTemperature / u_groundInversionDepth;
		return altitude * grounInversionRate;
	}
	return u_groundInversionTemperature + u_globalStability * (altitude - u_groundInversionDepth);
}

vec4 add_sources() {
	vec4 base = texture2D(u_basefluid, v_texCoord);
	vec4 solutes = texture2D(u_solutes, v_texCoord);

	// BUOYANCY
	float ambientTemp = ambient_temperature(v_texCoord.y);
	base.y += buoyancyFactor * (solutes.r - ambientTemp);

	// RAINFALL
	base.y -= rainFallingFactor * solutes.g;

	return base; 
}

vec4 init_atmosphere() {
	float ambientTemp = ambient_temperature(v_texCoord.y);
	float equi_hum = -v_texCoord.y + (u_condensationLevel - u_groundInversionTemperature) + ambientTemp;
	float humidity = max(min(u_initialHumidity, equi_hum), 0.0);	

	return vec4(ambientTemp, 0.0, humidity, 0.0);
}
 
vec4 atmospherics() {
	//vec4 base = texture2D(u_basefluid, v_texCoord);
	vec4 solutes = texture2D(u_solutes, v_texCoord);

	float altitude = v_texCoord.y;

	// CONDENSATION
	float condensationRate = u_condensationFactor * (altitude - (u_condensationLevel - u_groundInversionTemperature) - solutes.r + solutes.b);
	if (condensationRate > 0.0) {
		// condensation
		float waterTransfer = condensationRate * solutes.b;
		solutes.a += waterTransfer;
		solutes.b -= waterTransfer;
		solutes.r += u_latentHeat * waterTransfer;
	} else {
		// evaporation
		float waterTransfer = -condensationRate * solutes.a;
		solutes.a -= waterTransfer;
		solutes.b += waterTransfer;
		solutes.r -= u_latentHeat * waterTransfer;
	}

	// HEAT disipation
	float ambientTemp = ambient_temperature(v_texCoord.y);
	solutes.r += u_heatDisipationRate * (ambientTemp - solutes.r);

	// RAIN forming
	float dropletsFormed = clamp(u_mistToRainFactor * solutes.a, 0.0, solutes.a);
	solutes.a -= dropletsFormed;
	solutes.g += dropletsFormed;

	// RAIN evaporating
	float dropletsEvaporated = clamp(u_rainEvaporation * (1.0 - solutes.a - solutes.b) * (-condensationRate), 0.0, solutes.g);
	solutes.g -= dropletsEvaporated;
	solutes.b += dropletsEvaporated;
	solutes.r -= u_latentHeat * dropletsEvaporated;

	return solutes;
}

void main() {
	// compute 1 pixel in texture coordinates.
	onePixel = vec2(1.0, 1.0) / u_resolution;

 	if (u_calcFunction == 0) {

		// COPY basefluid
		gl_FragColor = texture2D(u_basefluid, v_texCoord);
 	} else if (u_calcFunction == 1) {

 		// COPY solutes
		gl_FragColor = texture2D(u_solutes, v_texCoord);
 	} else if (u_calcFunction == 2) {

 		// DIFFUSE
		gl_FragColor = diffuse_base(v_texCoord);
 	} else if (u_calcFunction == 3) {

 		// ADVECT
		vec2 v = texture2D(u_basefluid, v_texCoord).xy; // in pixels per simulation step
 		gl_FragColor = advect_base(v_texCoord, v);
 	} else if (u_calcFunction == 4) {

 		// PROJECT div
 		vec4 res = texture2D(u_basefluid, v_texCoord);
 		res.q = project_div(v_texCoord);
 		gl_FragColor = res;
 	} else if (u_calcFunction == 5) {

 		// PROJECT pressure
 		vec4 res = texture2D(u_basefluid, v_texCoord);
 		res.p = project_p(v_texCoord);
 		gl_FragColor = res;
 	} else if (u_calcFunction == 6) {

 		// PROJECT velocity
 		vec4 res = texture2D(u_basefluid, v_texCoord);
 		res.xy = project_v(v_texCoord, res.xy);
 		gl_FragColor = res;
 	} else if (u_calcFunction == 7) {

 		// DIFFUSE solutes
		gl_FragColor = diffuse_solutes(v_texCoord);
 	} else if (u_calcFunction == 8) {

 		// ADVECT solutes
		vec2 v = texture2D(u_basefluid, v_texCoord).xy; // in pixels per simulation step
 		gl_FragColor = advect_solutes(v_texCoord, v);
 	} else if (u_calcFunction == 9) {

 		// ADD SOURCES
 		gl_FragColor = add_sources();
 	} else if (u_calcFunction == 10) {

 		// ATMOSPHERICS
 		gl_FragColor = atmospherics();
 	} else if (u_calcFunction == 11) {

 		// Initialize ATMOSPHERE
 		gl_FragColor = init_atmosphere();
 	}
}