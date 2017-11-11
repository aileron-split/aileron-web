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

import { WeathertankSolver } from './solver';

// FLUID RENDERER
export class WeathertankRenderer {
    gl: any;
    solver: WeathertankSolver;    
    simParams: any;
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
    textureRatioUniformLocation: any;

    // Display uniforms
    backgroundImageTintUniformLocation: any;
    backgroundImageBrightnessUniformLocation: any;

    backgroundTintColorUniformLocation: any;
    backgroundTintOpacityUniformLocation: any;

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
    u_groundLocation: any;

    constructor(solver: WeathertankSolver) {
        this.solver = solver;
        
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
        this.textureRatioUniformLocation = null;

        // Display uniforms
        this.backgroundImageTintUniformLocation = null;
        this.backgroundImageBrightnessUniformLocation = null;

        this.backgroundTintColorUniformLocation = null;
        this.backgroundTintOpacityUniformLocation = null;

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
        this.u_groundLocation = null;
    }


    private createProgram(vertexShader: string, fragmentShader: string): any {
        var program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        var success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (success) {
            return program;
        }

       console.log(this.gl.getProgramInfoLog(program));
       this.gl.deleteProgram(program);
    }

    private setupTexture(): any {
        // Create a texture.
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        return texture;
    }

    public initProgram(gl: any, simParams: any, siteParams: any) {
        this.gl = gl;
        this.simParams = simParams;
        this.program = this.createProgram(this.vertexShader, this.fragmentShader);

        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        var positions = [
         -1, -1,
         -1,  1,
          1, -1,
         -1,  1,
          1,  1,
          1, -1,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);


        // Solver texture coordinates
        this.texCoordAttributeLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
        this.texCoordBuffer = this.gl.createBuffer();

        // Background texture coordinates
        this.bgTexCoordAttributeLocation = this.gl.getAttribLocation(this.program, 'a_bgTexCoord');
        this.bgTexCoordBuffer = this.gl.createBuffer();

        // Uniform variables locations   
        this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.textureRatioUniformLocation = this.gl.getUniformLocation(this.program, 'u_textureRatio');

        // Display uniforms
        this.backgroundImageTintUniformLocation = this.gl.getUniformLocation(this.program, 'u_backgroundImageTint');
        this.backgroundImageBrightnessUniformLocation = this.gl.getUniformLocation(this.program, 'u_backgroundImageBrightness');

        this.backgroundTintColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_backgroundTintColor');
        this.backgroundTintOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_backgroundTintOpacity');

        this.pressureColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_pressureColor');
        this.pressureOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_pressureOpacity');
        this.pressureCutoffUniformLocation = this.gl.getUniformLocation(this.program, 'u_pressureCutoff');
        this.pressureIORUniformLocation = this.gl.getUniformLocation(this.program, 'u_pressureIOR');
        this.updraftColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_updraftColor');
        this.updraftOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_updraftOpacity');
        this.updraftCutoffUniformLocation = this.gl.getUniformLocation(this.program, 'u_updraftCutoff');
        this.updraftIORUniformLocation = this.gl.getUniformLocation(this.program, 'u_updraftIOR');
        this.cloudColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_cloudColor');
        this.cloudOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_cloudOpacity');
        this.cloudCutoffUniformLocation = this.gl.getUniformLocation(this.program, 'u_cloudCutoff');
        this.cloudIORUniformLocation = this.gl.getUniformLocation(this.program, 'u_cloudIOR');
        this.rainColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_rainColor');
        this.rainOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_rainOpacity');
        this.rainCutoffUniformLocation = this.gl.getUniformLocation(this.program, 'u_rainCutoff');
        this.rainIORUniformLocation = this.gl.getUniformLocation(this.program, 'u_rainIOR');
        this.humidityColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_humidityColor');
        this.humidityOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_humidityOpacity');
        this.humidityCutoffUniformLocation = this.gl.getUniformLocation(this.program, 'u_humidityCutoff');
        this.humidityIORUniformLocation = this.gl.getUniformLocation(this.program, 'u_humidityIOR');
        this.temperatureColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_temperatureColor');
        this.temperatureOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_temperatureOpacity');
        this.temperatureCutoffUniformLocation = this.gl.getUniformLocation(this.program, 'u_temperatureCutoff');
        this.temperatureIORUniformLocation = this.gl.getUniformLocation(this.program, 'u_temperatureIOR');
        this.humidityTemperatureColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_humidityTemperatureColor');
        this.humidityTemperatureOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_humidityTemperatureOpacity');
        this.humidityTemperatureCutoffUniformLocation = this.gl.getUniformLocation(this.program, 'u_humidityTemperatureCutoff');
        this.humidityTemperatureIORUniformLocation = this.gl.getUniformLocation(this.program, 'u_humidityTemperatureIOR');
        this.relativeTemperatureColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_relativeTemperatureColor');
        this.relativeTemperatureOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_relativeTemperatureOpacity');
        this.relativeTemperatureCutoffUniformLocation = this.gl.getUniformLocation(this.program, 'u_relativeTemperatureCutoff');
        this.relativeTemperatureIORUniformLocation = this.gl.getUniformLocation(this.program, 'u_relativeTemperatureIOR');
        this.updraftTemperatureColorUniformLocation = this.gl.getUniformLocation(this.program, 'u_updraftTemperatureColor');
        this.updraftTemperatureOpacityUniformLocation = this.gl.getUniformLocation(this.program, 'u_updraftTemperatureOpacity');
        this.updraftTemperatureCutoffUniformLocation = this.gl.getUniformLocation(this.program, 'u_updraftTemperatureCutoff');
        this.updraftTemperatureIORUniformLocation = this.gl.getUniformLocation(this.program, 'u_updraftTemperatureIOR');

        // Stability uniforms
        this.globalStabilityUniformLocation = this.gl.getUniformLocation(this.program, 'u_globalStability');
        this.inversionAltitudeUniformLocation = this.gl.getUniformLocation(this.program, 'u_inversionAltitude');
        this.inversionTemperatureUniformLocation = this.gl.getUniformLocation(this.program, 'u_inversionTemperature');
        this.groundInversionDepthUniformLocation = this.gl.getUniformLocation(this.program, 'u_groundInversionDepth');
        this.groundInversionTemperatureUniformLocation = this.gl.getUniformLocation(this.program, 'u_groundInversionTemperature');

        // Samplers locations.
        this.u_basefluidLocation = this.gl.getUniformLocation(this.program, 'u_basefluid');
        this.u_solutesLocation = this.gl.getUniformLocation(this.program, 'u_solutes');
        this.u_backgroundLocation = this.gl.getUniformLocation(this.program, 'u_background');
        this.u_groundLocation = this.gl.getUniformLocation(this.program, 'u_ground');


        // Setup background image texture and first time initialize
        if (this.backgroundImageTexture)
            this.gl.deleteTexture(this.backgroundImageTexture);
        this.backgroundImageTexture = this.setupTexture();
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);

        // Upload the backgroundImage into the texture.
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, siteParams.backgroundImage);


        // Make transfer texture and framebuffer (uses linear interpolation)
        if (this.transferBasefluidTexture)
            this.gl.deleteTexture(this.transferBasefluidTexture);
        this.transferBasefluidTexture = this.setupTexture();
        if (siteParams.useLinear)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, this.simParams.resolution, this.simParams.resolution, 0, this.gl.RGBA, this.gl.FLOAT, null);

        if (this.transferBasefluidFramebuffer)
            this.gl.deleteFramebuffer(this.transferBasefluidFramebuffer);
        this.transferBasefluidFramebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.transferBasefluidFramebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.transferBasefluidTexture, 0);

        if (this.transferSolutesTexture)
         this.gl.deleteTexture(this.transferSolutesTexture);
        this.transferSolutesTexture = this.setupTexture();
        if (siteParams.useLinear)
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, this.simParams.resolution, this.simParams.resolution, 0, this.gl.RGBA, this.gl.FLOAT, null);

        if (this.transferSolutesFramebuffer)
            this.gl.deleteFramebuffer(this.transferSolutesFramebuffer);
        this.transferSolutesFramebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.transferSolutesFramebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.transferSolutesTexture, 0);

    }

}