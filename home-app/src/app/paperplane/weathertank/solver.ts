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
    gl: any;
    simParams: any;
    program: any;
    vertexShader: any;
    fragmentShader: any;

    private baseSrc: number;
    private baseDst: number;
    private solutesSrc: number;
    private solutesDst: number;

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

    public groundData: Uint8Array;

    constructor() {
        this.program = null;
        this.vertexShader = null;
        this.fragmentShader = null;

        this.baseSrc = 0;
        this.baseDst = 1;
        this.solutesSrc = 0;
        this.solutesDst = 1;

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
        
        this.groundData = new Uint8Array(16 * 4);
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
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        return texture;
    }

    public initProgram(gl: any, simParams: any) {
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

        this.texCoordAttributeLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        var texCoord = [
         0, 0,
         0, 1,
         1, 0,
         0, 1,
         1, 1,
         1, 0,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoord), this.gl.STATIC_DRAW);

        this.calcFunctionUniformLocation = this.gl.getUniformLocation(this.program, 'u_calcFunction');
        this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.diffusionUniformLocation = this.gl.getUniformLocation(this.program, 'u_diffusion');

        // Buoyancy
        this.buoyancyFactorUniformLocation = this.gl.getUniformLocation(this.program, 'u_buoyancyFactor');
        this.rainFallingFactorUniformLocation = this.gl.getUniformLocation(this.program, 'u_rainFallingFactor');

        // Stability uniforms
        this.globalWindUniformLocation = this.gl.getUniformLocation(this.program, 'u_globalWind');
        this.globalStabilityUniformLocation = this.gl.getUniformLocation(this.program, 'u_globalStability');
        this.inversionAltitudeUniformLocation = this.gl.getUniformLocation(this.program, 'u_inversionAltitude');
        this.inversionTemperatureUniformLocation = this.gl.getUniformLocation(this.program, 'u_inversionTemperature');
        this.groundInversionDepthUniformLocation = this.gl.getUniformLocation(this.program, 'u_groundInversionDepth');
        this.groundInversionTemperatureUniformLocation = this.gl.getUniformLocation(this.program, 'u_groundInversionTemperature');
        this.heatDisipationRateUniformLocation = this.gl.getUniformLocation(this.program, 'u_heatDisipationRate');

        // Atmosphere uniforms
        this.temperatureDiffusionUniformLocation = this.gl.getUniformLocation(this.program, 'u_temperatureDiffusion');
        this.humidityDiffusionUniformLocation = this.gl.getUniformLocation(this.program, 'u_humidityDiffusion');
        this.condensationFactorUniformLocation = this.gl.getUniformLocation(this.program, 'u_condensationFactor');
        this.mistDiffusionUniformLocation = this.gl.getUniformLocation(this.program, 'u_mistDiffusion');
        this.mistToRainFactorUniformLocation = this.gl.getUniformLocation(this.program, 'u_mistToRainFactor');
        this.rainFallDiffusionUniformLocation = this.gl.getUniformLocation(this.program, 'u_rainFallDiffusion');
        this.rainEvaporationUniformLocation = this.gl.getUniformLocation(this.program, 'u_rainEvaporation');
        this.initialHumidityUniformLocation = this.gl.getUniformLocation(this.program, 'u_initialHumidity');
        this.condensationLevelUniformLocation = this.gl.getUniformLocation(this.program, 'u_condensationLevel');
        this.latentHeatUniformLocation = this.gl.getUniformLocation(this.program, 'u_latentHeat');

        // Samplers locations.
        this.u_basefluidLocation = this.gl.getUniformLocation(this.program, 'u_basefluid');
        this.u_solutesLocation = this.gl.getUniformLocation(this.program, 'u_solutes');
        this.u_groundLocation = this.gl.getUniformLocation(this.program, 'u_ground');


        if (this.groundTexture) {
         this.gl.deleteTexture(this.groundTexture);
        }
        this.groundTexture = this.setupTexture();
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.groundDataToTexture();

        var res = simParams.resolution;

        const level = 0;
        const internalFormat = this.gl.RGBA32F;
        const border = 0;
        const format = this.gl.RGBA;
        const type = this.gl.FLOAT;
        const data = null;

        // Base fluid textures
        for (var ii = 0; ii < 2; ++ii) {
         var basefluidTexture = this.setupTexture();
         if (ii < this.basefluidTextures.length) {
            this.gl.deleteTexture(this.basefluidTextures[ii]);
            this.basefluidTextures[ii] = basefluidTexture;
         }
         else
            this.basefluidTextures.push(basefluidTexture);

         // make the texture of the right size
         this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, res, res, border, format, type, data);

         // create a framebuffer
         var basefluidFramebuffer = this.gl.createFramebuffer();
         if (ii < this.basefluidFramebuffers.length) {
            this.gl.deleteFramebuffer(this.basefluidFramebuffers[ii]);
            this.basefluidFramebuffers[ii] = basefluidFramebuffer;
         }
         else
            this.basefluidFramebuffers.push(basefluidFramebuffer);

         // Attach a texture to it
         this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, basefluidFramebuffer);
         this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, basefluidTexture, 0);
        }

        // Solutes textures
        for (var ii = 0; ii < 2; ++ii) {
         var solutesTexture = this.setupTexture();
         if (ii < this.solutesTextures.length) {
            this.gl.deleteTexture(this.solutesTextures[ii]);
            this.solutesTextures[ii] = solutesTexture;
         }
         else
            this.solutesTextures.push(solutesTexture);

         // make the texture of the right size
         this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, res, res, border, format, type, data);

         // create a framebuffer
         var solutesFramebuffer = this.gl.createFramebuffer();
         if (ii < this.solutesFramebuffers.length) {
            this.gl.deleteFramebuffer(this.solutesFramebuffers[ii]);
            this.solutesFramebuffers[ii] = solutesFramebuffer;
         }
         else
            this.solutesFramebuffers.push(solutesFramebuffer);

         // Attach a texture to it
         this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, solutesFramebuffer);
         this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, solutesTexture, 0);
        }


        this.solutesSrc = 0;
        this.solutesDst = 1;
        this.baseSrc = 0;
        this.baseDst = 1;
    }


    public initializeAtmosphere() {
        this.doCalcFunction(this.solutesFramebuffers[this.solutesDst], 11); this.swapSolutes(); // 1 - Initialize ATMOSPHERE
    }

    public groundDataToTexture() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.groundTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 16, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.groundData);
    }


    private setFramebuffer(fbo) {
        let width: any;
        let height: any;

        if (fbo == null) {
            width = this.gl.canvas.width;
            height = this.gl.canvas.height;
        } else {
            width = this.simParams.resolution;
            height = this.simParams.resolution;
        }

        // make this the framebuffer we are rendering to.
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);

        // Tell webgl the viewport setting needed for framebuffer.
        this.gl.viewport(0, 0, parseFloat(width), parseFloat(height));
    }


    private swapSolutes() { this.solutesSrc = (this.solutesSrc == 0) ? 1 : 0; this.solutesDst = (this.solutesDst == 0) ? 1 : 0; }
    private swapBase() { this.baseSrc = (this.baseSrc == 0) ? 1 : 0; this.baseDst = (this.baseDst == 0) ? 1 : 0; }

    public doCalcFunction(framebuffer, calcFunction) {
        /*
        0 - COPY
        1 - DISPLAY
        2 - DIFFUSE
        3 - ADVECT
        4 - PROJECT div
        5 - PROJECT pressure
        6 - PROJECT velocity
        ...
        */

        // Tell it to use our solver program (pair of shaders)
        this.gl.useProgram(this.program);

        // set which texture units to render with.
        this.gl.uniform1i(this.u_basefluidLocation, 0);  // texture unit 0
        this.gl.uniform1i(this.u_solutesLocation, 1);  // texture unit 1
        this.gl.uniform1i(this.u_groundLocation, 2);  // texture unit 2

        // bind the input basefluidTexture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.basefluidTextures[this.baseSrc]);

        // bind the input solutesTexture
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.solutesTextures[this.solutesSrc]);

        this.gl.activeTexture(this.gl.TEXTURE2);
        this.groundDataToTexture();

        // set the framebuffer (null for rendering to canvas)
        this.setFramebuffer(framebuffer);

        // Tell the shader the resolution of the framebuffer.
        this.gl.uniform1f(this.resolutionUniformLocation, this.simParams.resolution);

        /*      if (framebuffer==null) {
         // Clear the canvas
         this.gl.clearColor(
            this.simParams.backgroundColor[0] / 256.0, 
            this.simParams.backgroundColor[1] / 256.0, 
            this.simParams.backgroundColor[2] / 256.0, 
            this.simParams.backgroundColor[3]);
         this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
        */
        // VERTEX
        // Turn on the attribute
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(this.positionAttributeLocation, size, type, normalize, stride, offset)

        // TEXTURE COORDINATE
        // Turn on the attribute
        this.gl.enableVertexAttribArray(this.texCoordAttributeLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);

        // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(this.texCoordAttributeLocation, size, type, normalize, stride, offset)


        this.gl.uniform1i(this.calcFunctionUniformLocation, calcFunction);
        this.gl.uniform1f(this.diffusionUniformLocation, this.simParams.diffusion);

        // Buoyancy
        this.gl.uniform1f(this.buoyancyFactorUniformLocation, this.simParams.buoyancyFactor);
        this.gl.uniform1f(this.rainFallingFactorUniformLocation, this.simParams.rainFallingFactor);

        // Stability uniforms
        this.gl.uniform1f(this.globalWindUniformLocation, this.simParams.globalWind);
        this.gl.uniform1f(this.globalStabilityUniformLocation, this.simParams.globalStability);
        this.gl.uniform1f(this.inversionAltitudeUniformLocation, this.simParams.inversionAltitude);
        this.gl.uniform1f(this.inversionTemperatureUniformLocation, this.simParams.inversionTemperature);
        this.gl.uniform1f(this.groundInversionDepthUniformLocation, this.simParams.groundInversionDepth);
        this.gl.uniform1f(this.groundInversionTemperatureUniformLocation, this.simParams.groundInversionTemperature);
        this.gl.uniform1f(this.heatDisipationRateUniformLocation, this.simParams.heatDisipationRate);

        // Atmosphere uniforms
        this.gl.uniform1f(this.temperatureDiffusionUniformLocation, this.simParams.temperatureDiffusion);
        this.gl.uniform1f(this.humidityDiffusionUniformLocation, this.simParams.humidityDiffusion);
        this.gl.uniform1f(this.condensationFactorUniformLocation, this.simParams.condensationFactor);
        this.gl.uniform1f(this.mistDiffusionUniformLocation, this.simParams.mistDiffusion);
        this.gl.uniform1f(this.mistToRainFactorUniformLocation, this.simParams.mistToRainFactor);
        this.gl.uniform1f(this.rainFallDiffusionUniformLocation, this.simParams.rainFallDiffusion);
        this.gl.uniform1f(this.rainEvaporationUniformLocation, this.simParams.rainEvaporation);
        this.gl.uniform1f(this.initialHumidityUniformLocation, this.simParams.initialHumidity);
        this.gl.uniform1f(this.condensationLevelUniformLocation, this.simParams.condensationLevel);
        this.gl.uniform1f(this.latentHeatUniformLocation, this.simParams.latentHeat);

        // draw
        var primitiveType = this.gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        this.gl.drawArrays(primitiveType, offset, count);
    }

    private project(srcIndex?:number) {
        this.doCalcFunction(this.basefluidFramebuffers[this.baseDst], 4); this.swapBase();
        for (var i=1; i<this.simParams.pressureSolveSteps; i+=1) {
            this.doCalcFunction(this.basefluidFramebuffers[this.baseDst], 5); this.swapBase();
        }
        this.doCalcFunction(this.basefluidFramebuffers[this.baseDst], 6); this.swapBase();
    }

    public stepSimulation() {
        this.doCalcFunction(this.basefluidFramebuffers[this.baseDst], 9); this.swapBase(); // 9 - add forces
        this.doCalcFunction(this.solutesFramebuffers[this.solutesDst], 10); this.swapSolutes(); // 10 - atmospherics
        this.doCalcFunction(this.basefluidFramebuffers[this.baseDst], 2); this.swapBase(); // 2 - diffuse
        this.doCalcFunction(this.solutesFramebuffers[this.solutesDst], 7); this.swapSolutes(); // 7 - diffuse solutes
        this.project();
        this.doCalcFunction(this.basefluidFramebuffers[this.baseDst], 3); this.swapBase(); // 3 - advect
        this.doCalcFunction(this.solutesFramebuffers[this.solutesDst], 8); this.swapSolutes(); // 8 - advect solutes
        this.project();
    }

}