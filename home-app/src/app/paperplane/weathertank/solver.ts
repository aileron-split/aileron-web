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

// CFD SOLVER
export class WeathertankSolver {
    program: any;
    vertexShader: any;
    fragmentShader: any;

    positionAttributeLocation: any;
    positionBuffer: any;
    texCoordAttributeLocation: any;
    texCoordBuffer: any;

    calcFunctionUniformLocation: any;
    resolutionUniformLocation: any;
    diffusionUniformLocation: any;

    // Buoyancy
    buoyancyFactorUniformLocation: any;
    rainFallingFactorUniformLocation: any;

    // Stability uniforms
    globalWindUniformLocation: any;
    globalStabilityUniformLocation: any;
    inversionAltitudeUniformLocation: any;
    inversionTemperatureUniformLocation: any;
    groundInversionDepthUniformLocation: any;
    groundInversionTemperatureUniformLocation: any;
    heatDisipationRateUniformLocation: any;

    // Atmosphere uniforms
    temperatureDiffusionUniformLocation: any;
    humidityDiffusionUniformLocation: any;
    condensationFactorUniformLocation: any;
    mistToRainFactorUniformLocation: any;
    rainFallDiffusionUniformLocation: any;
    mistDiffusionUniformLocation: any;
    rainEvaporationUniformLocation: any;

    initialHumidityUniformLocation: any;
    condensationLevelUniformLocation: any;
    latentHeatUniformLocation: any;

    // TEXTURES and FRAMEBUFFERS
    groundTexture: any;
    basefluidTextures: any[];
    basefluidFramebuffers: any[];
    solutesTextures: any[];
    solutesFramebuffers: any[];

    u_basefluidLocation: any;
    u_solutesLocation: any;
    u_groundLocation: any;

    constructor() {
        this.program = null;
        this.vertexShader = null;
        this.fragmentShader = null;

        this.positionAttributeLocation = null;
        this.positionBuffer = null;
        this.texCoordAttributeLocation = null;
        this.texCoordBuffer = null;

        this.calcFunctionUniformLocation = null;
        this.resolutionUniformLocation = null;
        this.diffusionUniformLocation = null;

        // Buoyancy
        this.buoyancyFactorUniformLocation = null;
        this.rainFallingFactorUniformLocation = null;

        // Stability uniforms
        this.globalWindUniformLocation = null;
        this.globalStabilityUniformLocation = null;
        this.inversionAltitudeUniformLocation = null;
        this.inversionTemperatureUniformLocation = null;
        this.groundInversionDepthUniformLocation = null;
        this.groundInversionTemperatureUniformLocation = null;
        this.heatDisipationRateUniformLocation = null;

        // Atmosphere uniforms
        this.temperatureDiffusionUniformLocation = null;
        this.humidityDiffusionUniformLocation = null;
        this.condensationFactorUniformLocation = null;
        this.mistToRainFactorUniformLocation = null;
        this.rainFallDiffusionUniformLocation = null;
        this.mistDiffusionUniformLocation = null;
        this.rainEvaporationUniformLocation = null;

        this.initialHumidityUniformLocation = null;
        this.condensationLevelUniformLocation = null;
        this.latentHeatUniformLocation = null;

        // TEXTURES and FRAMEBUFFERS
        this.groundTexture = null;
        this.basefluidTextures = [];
        this.basefluidFramebuffers = [];
        this.solutesTextures = [];
        this.solutesFramebuffers = [];

        this.u_basefluidLocation = null;
        this.u_solutesLocation = null;
        this.u_groundLocation = null;
    }
}