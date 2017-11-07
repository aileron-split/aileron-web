/************************************************************************

   Paperplane simulation is based on

   WeatherTank - WebGL boundary layer weather simulation.

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

// FLUID RENDERER
export class WeathertankRenderer {
    program: any;
    vertexShader: any;
    fragmentShader: any;

    positionAttributeLocation: any;
    positionBuffer: any;
    texCoordAttributeLocation: any;
    texCoordBuffer: any;
    bgTexCoordAttributeLocation: any;
    bgTexCoordBuffer: any;

    resolutionUniformLocation: any;

    // Display uniforms
    backgroundImageTintUniformLocation: any;
    backgroundImageBrightnessUniformLocation: any;

    pressureColorUniformLocation: any;
    pressureOpacityUniformLocation: any;
    pressureCutoffUniformLocation: any;
    pressureIORUniformLocation: any;
    updraftColorUniformLocation: any;
    updraftOpacityUniformLocation: any;
    updraftCutoffUniformLocation: any;
    updraftIORUniformLocation: any;
    cloudColorUniformLocation: any;
    cloudOpacityUniformLocation: any;
    cloudCutoffUniformLocation: any;
    cloudIORUniformLocation: any;
    rainColorUniformLocation: any;
    rainOpacityUniformLocation: any;
    rainCutoffUniformLocation: any;
    rainIORUniformLocation: any;
    humidityColorUniformLocation: any;
    humidityOpacityUniformLocation: any;
    humidityCutoffUniformLocation: any;
    humidityIORUniformLocation: any;
    temperatureColorUniformLocation: any;
    temperatureOpacityUniformLocation: any;
    temperatureCutoffUniformLocation: any;
    temperatureIORUniformLocation: any;
    humidityTemperatureColorUniformLocation: any;
    humidityTemperatureOpacityUniformLocation: any;
    humidityTemperatureCutoffUniformLocation: any;
    humidityTemperatureIORUniformLocation: any;
    relativeTemperatureColorUniformLocation: any;
    relativeTemperatureOpacityUniformLocation: any;
    relativeTemperatureCutoffUniformLocation: any;
    relativeTemperatureIORUniformLocation: any;
    updraftTemperatureColorUniformLocation: any;
    updraftTemperatureOpacityUniformLocation: any;
    updraftTemperatureCutoffUniformLocation: any;
    updraftTemperatureIORUniformLocation: any;

    // Stability uniforms
    globalStabilityUniformLocation: any;
    inversionAltitudeUniformLocation: any;
    inversionTemperatureUniformLocation: any;
    groundInversionDepthUniformLocation: any;
    groundInversionTemperatureUniformLocation: any;

    // TEXTURES
    backgroundImageTexture: any;

    // Transfer textures and framebuffers
    transferBasefluidTexture: any;
    transferBasefluidFramebuffer: any;
    transferSolutesTexture: any;
    transferSolutesFramebuffer: any;

    u_basefluidLocation: any;
    u_solutesLocation: any;
    u_backgroundLocation: any;

    constructor() {
        this.program = null;
        this.vertexShader = null;
        this.fragmentShader = null;

        this.positionAttributeLocation = null;
        this.positionBuffer = null;
        this.texCoordAttributeLocation = null;
        this.texCoordBuffer = null;
        this.bgTexCoordAttributeLocation = null;
        this.bgTexCoordBuffer = null;

        this.resolutionUniformLocation = null;

        // Display uniforms
        this.backgroundImageTintUniformLocation = null;
        this.backgroundImageBrightnessUniformLocation = null;

        this.pressureColorUniformLocation = null;
        this.pressureOpacityUniformLocation = null;
        this.pressureCutoffUniformLocation = null;
        this.pressureIORUniformLocation = null;
        this.updraftColorUniformLocation = null;
        this.updraftOpacityUniformLocation = null;
        this.updraftCutoffUniformLocation = null;
        this.updraftIORUniformLocation = null;
        this.cloudColorUniformLocation = null;
        this.cloudOpacityUniformLocation = null;
        this.cloudCutoffUniformLocation = null;
        this.cloudIORUniformLocation = null;
        this.rainColorUniformLocation = null;
        this.rainOpacityUniformLocation = null;
        this.rainCutoffUniformLocation = null;
        this.rainIORUniformLocation = null;
        this.humidityColorUniformLocation = null;
        this.humidityOpacityUniformLocation = null;
        this.humidityCutoffUniformLocation = null;
        this.humidityIORUniformLocation = null;
        this.temperatureColorUniformLocation = null;
        this.temperatureOpacityUniformLocation = null;
        this.temperatureCutoffUniformLocation = null;
        this.temperatureIORUniformLocation = null;
        this.humidityTemperatureColorUniformLocation = null;
        this.humidityTemperatureOpacityUniformLocation = null;
        this.humidityTemperatureCutoffUniformLocation = null;
        this.humidityTemperatureIORUniformLocation = null;
        this.relativeTemperatureColorUniformLocation = null;
        this.relativeTemperatureOpacityUniformLocation = null;
        this.relativeTemperatureCutoffUniformLocation = null;
        this.relativeTemperatureIORUniformLocation = null;
        this.updraftTemperatureColorUniformLocation = null;
        this.updraftTemperatureOpacityUniformLocation = null;
        this.updraftTemperatureCutoffUniformLocation = null;
        this.updraftTemperatureIORUniformLocation = null;

        // Stability uniforms
        this.globalStabilityUniformLocation = null;
        this.inversionAltitudeUniformLocation = null;
        this.inversionTemperatureUniformLocation = null;
        this.groundInversionDepthUniformLocation = null;
        this.groundInversionTemperatureUniformLocation = null;

        // TEXTURES
        this.backgroundImageTexture = null;

        // Transfer textures and framebuffers
        this.transferBasefluidTexture = null;
        this.transferBasefluidFramebuffer = null;
        this.transferSolutesTexture = null;
        this.transferSolutesFramebuffer = null;

        this.u_basefluidLocation = null;
        this.u_solutesLocation = null;
        this.u_backgroundLocation = null;
    }
}