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

import { WeathertankRenderer } from './renderer';
import { WeathertankSolver } from './solver';
import { WeathertankParams } from './sim-params';
import { PaperplaneGlider } from './glider';


export class Weathertank {
    private canvas: any;
    private gl: any;

    private renderer: WeathertankRenderer;
    private solver: WeathertankSolver;

    public simParams: WeathertankParams;
    public glider: PaperplaneGlider;

    private readCoords: Float32Array;
    private readBasefluid: Float32Array;
    private readSolutes: Float32Array;
    private solverToCanvasPixelScale: number[];

    private groundData: Uint8Array;

    private isRunning: boolean;

    // Solver's grid position on canvas
    private marginTopSolver: number;
    private marginBottomSolver: number;
    private aspectSolver: number;
    private hMarginSolver: number;

    private baseSrc: number;
    private baseDst: number;
    private solutesSrc: number;
    private solutesDst: number;

    private useLinear: boolean;

    private solverResolution: number;

    private backgroundImageURLs: string[];
    private backgroundImage: any;


    constructor() {
        this.readCoords = new Float32Array(2);
        this.readBasefluid = new Float32Array(4);
        this.readSolutes = new Float32Array(4);
        this.solverToCanvasPixelScale = [1.0, 1.0];

        this.renderer = new WeathertankRenderer();
        this.solver = new WeathertankSolver();
        this.simParams = new WeathertankParams();
        this.glider = new PaperplaneGlider();

        this.groundData = new Uint8Array(16 * 4);
        this.isRunning = true;

        this.baseSrc = 0;
        this.baseDst = 1;
        this.solutesSrc = 0;
        this.solutesDst = 1;

        this.useLinear = true;

        this.solverResolution = 256.0;

        this.backgroundImageURLs = [
            '/images/004.png',
        ];

        this.backgroundImage = new Image();
    }


    private createShader(type, source) {
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        var success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);

        if (success) {
            return shader;
        }

        console.log(this.gl.getShaderInfoLog(shader));
        console.log(source);
        this.gl.deleteShader(shader);
    }

    private createProgram(vertexShader, fragmentShader) {
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

    private groundDataToTexture() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.solver.groundTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 16, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.groundData);
    }

    private setupTexture() {
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

    public load(canvas: any) {
        this.canvas = canvas;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl = this.canvas.getContext('webgl2', { premultipliedAlpha: false }); // ('experimental-webgl');

        var ext = this.gl.getExtension('EXT_color_buffer_float');
        if (!ext) {
            console.log('need EXT_color_buffer_float');
            return;
        }
        ext = this.gl.getExtension('OES_texture_float_linear');
        if (!ext) {
            console.log('No OES_texture_float_linear extension available, falling back to NEAREST');
            this.useLinear = false;
        }

        var tank = this;
        this.canvas.onmousemove = function(e) {
            // console.log(e.clientX / canvas.width + ' ' + e.clientY / canvas.height);
            tank.readCoords[0] = e.clientX / tank.canvas.width;
            tank.readCoords[1] = 1.0 - e.clientY / tank.canvas.height;

            if (!tank.isRunning) {
               tank.updateReaderGUI();
            }
        }

        // Solver's grid position on canvas
        this.marginTopSolver = 0.1;
        this.marginBottomSolver = 0.1;
        this.aspectSolver = 1.25;
        this.hMarginSolver = 0.5 * (this.canvas.width * (this.marginTopSolver + 1.0 + this.marginBottomSolver) / (this.canvas.height * this.aspectSolver) - 1.0);


        // sync loading, init when all is loaded
        var tank = this;
        var checkpoints = [];

        function sync(i) {
            checkpoints[i - 1] = true;
            if (checkpoints.every(function(i){return i;})) {
                tank.initPrograms();
            }
        }


        // Loading new background image and pushing it into the background texture
        function loadBackgroundImage() {
            if (this.renderer.backgroundImageTexture) {
                this.backgroundImage.onload = function () {
                    // Upload the backgroundImage into the texture.
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.backgroundImageTexture);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.backgroundImage);
                    this.setupBackgroundCoords();
                    this.updateCanvas();
                }
                this.backgroundImage.src = this.backgroundImageURLs[this.simParams.backgroundImage];
            }
        }

        // Load and compile solver shaders
        var xhrVertSolver:any = new XMLHttpRequest();
        var checkIndexVertSolver = checkpoints.push(false);
        xhrVertSolver.open('GET', 'shaders/weathersolver.vert', true);
        xhrVertSolver.onload = function(e) {
            if (this.status == 200) {
                tank.solver.vertexShader = tank.createShader(tank.gl.VERTEX_SHADER, xhrVertSolver.response);
                sync(checkIndexVertSolver);
            }
        };
        xhrVertSolver.send(null);

        var xhrFragSolver:any = new XMLHttpRequest();
        var checkIndexFragSolver = checkpoints.push(false);
        xhrFragSolver.open('GET', 'shaders/weathersolver.frag', true);
        xhrFragSolver.onload = function(e) {
            if (this.status == 200) {
                tank.solver.fragmentShader = tank.createShader(tank.gl.FRAGMENT_SHADER, xhrFragSolver.response);
                sync(checkIndexFragSolver);
            }
        };
        xhrFragSolver.send(null);

        // Load and compile renderer shaders
        var xhrVertRenderer:any = new XMLHttpRequest();
        var checkIndexVertRenderer = checkpoints.push(false);
        xhrVertRenderer.open('GET', 'shaders/weatherrenderer.vert', true);
        xhrVertRenderer.onload = function(e) {
            if (this.status == 200) {
                tank.renderer.vertexShader = tank.createShader(tank.gl.VERTEX_SHADER, xhrVertRenderer.response);
                sync(checkIndexVertRenderer);
            }
        };
        xhrVertRenderer.send(null);

        var xhrFragRenderer:any = new XMLHttpRequest();
        var checkIndexFragRenderer = checkpoints.push(false);
        xhrFragRenderer.open('GET', 'shaders/weatherrenderer.frag', true);
        xhrFragRenderer.onload = function(e) {
            if (this.status == 200) {
                tank.renderer.fragmentShader = tank.createShader(tank.gl.FRAGMENT_SHADER, xhrFragRenderer.response);
                sync(checkIndexFragRenderer);
            }
        };
        xhrFragRenderer.send(null);

        // Load and compile paper plane shaders
        var xhrVertPaperplane:any = new XMLHttpRequest(),
            checkIndexVertPaperplane = checkpoints.push(false);
        xhrVertPaperplane.open('GET', 'shaders/paperplane.vert', true);
        xhrVertPaperplane.onload = function(e) {
            if (this.status == 200) {
                tank.glider.vertexShader = tank.createShader(tank.gl.VERTEX_SHADER, xhrVertPaperplane.response);
                sync(checkIndexVertPaperplane);
            }
        };
        xhrVertPaperplane.send(null);

        var xhrFragPaperplane: any = new XMLHttpRequest(),
            checkIndexFragPaperplane = checkpoints.push(false);
        xhrFragPaperplane.open('GET', 'shaders/paperplane.frag', true);
        xhrFragPaperplane.onload = function(e) {
            if (this.status == 200) {
                tank.glider.fragmentShader = tank.createShader(tank.gl.FRAGMENT_SHADER, xhrFragPaperplane.response);
                sync(checkIndexFragPaperplane);
            }
        };
        xhrFragPaperplane.send(null);

        {
            var xhrPresets:any = new XMLHttpRequest();
            var checkIndexPresets = checkpoints.push(false);
            xhrPresets.open('GET', 'presets.json', true);
            xhrPresets.onload = function(e) {
                if (this.status == 200) {

                    // Start loading of default background texture
                    var checkIndexImage = checkpoints.push(false);
                    tank.backgroundImage.onload = function () {
                       sync(checkIndexImage);
                    }
                    tank.backgroundImage.src = tank.backgroundImageURLs[tank.simParams.backgroundImage];

                    sync(checkIndexPresets);
                }
            };
            xhrPresets.send(null);
        }
    }


/*
    // Controls
    this.runSimulation = function() {
     if (!this.isRunning) {      
        console.log('START');

        this.isRunning = true; // reset stop signal
        requestAnimationFrame(stepSimulation);
     }
    };
    this.stopSimulation = function() {
     if (this.isRunning) {
        this.isRunning = false;
        console.log('STOP');
     } else {
        console.log('RESET');
        this.initPrograms();
     }
    };
    this.stepSimulation =  function() {
     if (!this.isRunning) {
        stepSimulation();
        console.log('STEP');
     }
    };
*/        


    private initPrograms(skipStep?:boolean) {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.initSolverProgram();
        this.initRendererProgram();
        this.glider.initPaperplaneProgram(this.gl, this.canvas, this.simParams, this.marginBottomSolver - 0.015);
        this.updateCanvas();

        this.solutesSrc = 0;
        this.solutesDst = 1;
        this.baseSrc = 0;
        this.baseDst = 1;
        this.doCalcFunction(this.solver.solutesFramebuffers[this.solutesDst], 11); this.swapSolutes(); // 1 - Initialize ATMOSPHERE

        this.doRender(); // RENDER

        if (!skipStep)
            this.stepSimulation();
    }

    private initSolverProgram() {
        this.solver.program = this.createProgram(this.solver.vertexShader, this.solver.fragmentShader);

        this.solver.positionAttributeLocation = this.gl.getAttribLocation(this.solver.program, 'a_position');
        this.solver.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.solver.positionBuffer);
        var positions = [
         -1, -1,
         -1,  1,
          1, -1,
         -1,  1,
          1,  1,
          1, -1,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        this.solver.texCoordAttributeLocation = this.gl.getAttribLocation(this.solver.program, 'a_texCoord');
        this.solver.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.solver.texCoordBuffer);
        var texCoord = [
         0, 0,
         0, 1,
         1, 0,
         0, 1,
         1, 1,
         1, 0,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoord), this.gl.STATIC_DRAW);

        this.solver.calcFunctionUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_calcFunction');
        this.solver.resolutionUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_resolution');
        this.solver.diffusionUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_diffusion');

        // Buoyancy
        this.solver.buoyancyFactorUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_buoyancyFactor');
        this.solver.rainFallingFactorUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_rainFallingFactor');

        // Stability uniforms
        this.solver.globalWindUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_globalWind');
        this.solver.globalStabilityUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_globalStability');
        this.solver.inversionAltitudeUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_inversionAltitude');
        this.solver.inversionTemperatureUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_inversionTemperature');
        this.solver.groundInversionDepthUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_groundInversionDepth');
        this.solver.groundInversionTemperatureUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_groundInversionTemperature');
        this.solver.heatDisipationRateUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_heatDisipationRate');

        // Atmosphere uniforms
        this.solver.temperatureDiffusionUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_temperatureDiffusion');
        this.solver.humidityDiffusionUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_humidityDiffusion');
        this.solver.condensationFactorUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_condensationFactor');
        this.solver.mistDiffusionUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_mistDiffusion');
        this.solver.mistToRainFactorUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_mistToRainFactor');
        this.solver.rainFallDiffusionUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_rainFallDiffusion');
        this.solver.rainEvaporationUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_rainEvaporation');
        this.solver.initialHumidityUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_initialHumidity');
        this.solver.condensationLevelUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_condensationLevel');
        this.solver.latentHeatUniformLocation = this.gl.getUniformLocation(this.solver.program, 'u_latentHeat');

        // Samplers locations.
        this.solver.u_basefluidLocation = this.gl.getUniformLocation(this.solver.program, 'u_basefluid');
        this.solver.u_solutesLocation = this.gl.getUniformLocation(this.solver.program, 'u_solutes');
        this.solver.u_groundLocation = this.gl.getUniformLocation(this.solver.program, 'u_ground');


        if (this.solver.groundTexture) {
         this.gl.deleteTexture(this.solver.groundTexture);
        }
        this.solver.groundTexture = this.setupTexture();
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.groundDataToTexture();

        var res = this.simParams.resolution;

        const level = 0;
        const internalFormat = this.gl.RGBA32F;
        const border = 0;
        const format = this.gl.RGBA;
        const type = this.gl.FLOAT;
        const data = null;

        // Base fluid textures
        for (var ii = 0; ii < 2; ++ii) {
         var basefluidTexture = this.setupTexture();
         if (ii < this.solver.basefluidTextures.length) {
            this.gl.deleteTexture(this.solver.basefluidTextures[ii]);
            this.solver.basefluidTextures[ii] = basefluidTexture;
         }
         else
            this.solver.basefluidTextures.push(basefluidTexture);

         // make the texture of the right size
         this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, res, res, border, format, type, data);

         // create a framebuffer
         var basefluidFramebuffer = this.gl.createFramebuffer();
         if (ii < this.solver.basefluidFramebuffers.length) {
            this.gl.deleteFramebuffer(this.solver.basefluidFramebuffers[ii]);
            this.solver.basefluidFramebuffers[ii] = basefluidFramebuffer;
         }
         else
            this.solver.basefluidFramebuffers.push(basefluidFramebuffer);

         // Attach a texture to it
         this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, basefluidFramebuffer);
         this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, basefluidTexture, 0);
        }

        // Solutes textures
        for (var ii = 0; ii < 2; ++ii) {
         var solutesTexture = this.setupTexture();
         if (ii < this.solver.solutesTextures.length) {
            this.gl.deleteTexture(this.solver.solutesTextures[ii]);
            this.solver.solutesTextures[ii] = solutesTexture;
         }
         else
            this.solver.solutesTextures.push(solutesTexture);

         // make the texture of the right size
         this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, res, res, border, format, type, data);

         // create a framebuffer
         var solutesFramebuffer = this.gl.createFramebuffer();
         if (ii < this.solver.solutesFramebuffers.length) {
            this.gl.deleteFramebuffer(this.solver.solutesFramebuffers[ii]);
            this.solver.solutesFramebuffers[ii] = solutesFramebuffer;
         }
         else
            this.solver.solutesFramebuffers.push(solutesFramebuffer);

         // Attach a texture to it
         this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, solutesFramebuffer);
         this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, solutesTexture, 0);
        }
    }

    private setupBackgroundCoords() {
        var vMarginBackground = 0.5 * (this.canvas.height / this.backgroundImage.height - 1.0);
        var hMarginBackground = 0.5 * (this.canvas.width / this.backgroundImage.width - 1.0);
        var bgTexCoord = [
            -hMarginBackground, 1.0 + vMarginBackground,
            -hMarginBackground, -vMarginBackground,
            1.0 + hMarginBackground, 1.0 + vMarginBackground,
            -hMarginBackground, -vMarginBackground,
            1.0 + hMarginBackground, -vMarginBackground,
            1.0 + hMarginBackground, 1.0 + vMarginBackground,
        ];

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.renderer.bgTexCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bgTexCoord), this.gl.STATIC_DRAW);
    }

    private setupSolverGridReadCoords() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.renderer.texCoordBuffer);
        var texCoord = [
            -this.hMarginSolver, -this.marginBottomSolver,
            -this.hMarginSolver, 1.0 + this.marginTopSolver,
            1.0 + this.hMarginSolver, -this.marginBottomSolver,
            -this.hMarginSolver, 1.0 + this.marginTopSolver,
            1.0 + this.hMarginSolver, 1.0 + this.marginTopSolver,
            1.0 + this.hMarginSolver, -this.marginBottomSolver,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoord), this.gl.STATIC_DRAW);

        this.solverToCanvasPixelScale[0] = this.canvas.width / (this.simParams.resolution * (1.0 + 2.0 * this.hMarginSolver));
        this.solverToCanvasPixelScale[1] = this.canvas.height / (this.simParams.resolution * (1.0 + this.marginTopSolver + this.marginBottomSolver));
    }

    private getSolverToCanvasRatio() {
        return [(1.0 + 2.0 * this.hMarginSolver), (1.0 + this.marginBottomSolver + this.marginTopSolver)];
    }

    private getPointOnSolverGrid(canvasPoint) {
        var x = canvasPoint[0] * (1.0 + 2.0 * this.hMarginSolver) - this.hMarginSolver;
        var y = canvasPoint[1] * (1.0 + this.marginBottomSolver + this.marginTopSolver) - this.marginBottomSolver;
        x -= Math.floor(x); // Wrap around x-axis
        y = Math.min(Math.max(y, 0.0), 1.0); // Clamp y-axis
        return [x * this.solverResolution, y * this.solverResolution];
    }


    private initRendererProgram() {
        this.renderer.program = this.createProgram(this.renderer.vertexShader, this.renderer.fragmentShader);

        this.renderer.positionAttributeLocation = this.gl.getAttribLocation(this.renderer.program, 'a_position');
        this.renderer.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.renderer.positionBuffer);
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
        this.renderer.texCoordAttributeLocation = this.gl.getAttribLocation(this.renderer.program, 'a_texCoord');
        this.renderer.texCoordBuffer = this.gl.createBuffer();
        this.setupSolverGridReadCoords();

        // Background texture coordinates
        this.renderer.bgTexCoordAttributeLocation = this.gl.getAttribLocation(this.renderer.program, 'a_bgTexCoord');
        this.renderer.bgTexCoordBuffer = this.gl.createBuffer();
        this.setupBackgroundCoords();

        // Uniform variables locations   
        this.renderer.resolutionUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_resolution');

        // Display uniforms
        this.renderer.backgroundImageTintUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_backgroundImageTint');
        this.renderer.backgroundImageBrightnessUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_backgroundImageBrightness');

        this.renderer.pressureColorUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_pressureColor');
        this.renderer.pressureOpacityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_pressureOpacity');
        this.renderer.pressureCutoffUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_pressureCutoff');
        this.renderer.pressureIORUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_pressureIOR');
        this.renderer.updraftColorUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_updraftColor');
        this.renderer.updraftOpacityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_updraftOpacity');
        this.renderer.updraftCutoffUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_updraftCutoff');
        this.renderer.updraftIORUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_updraftIOR');
        this.renderer.cloudColorUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_cloudColor');
        this.renderer.cloudOpacityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_cloudOpacity');
        this.renderer.cloudCutoffUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_cloudCutoff');
        this.renderer.cloudIORUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_cloudIOR');
        this.renderer.rainColorUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_rainColor');
        this.renderer.rainOpacityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_rainOpacity');
        this.renderer.rainCutoffUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_rainCutoff');
        this.renderer.rainIORUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_rainIOR');
        this.renderer.humidityColorUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_humidityColor');
        this.renderer.humidityOpacityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_humidityOpacity');
        this.renderer.humidityCutoffUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_humidityCutoff');
        this.renderer.humidityIORUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_humidityIOR');
        this.renderer.temperatureColorUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_temperatureColor');
        this.renderer.temperatureOpacityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_temperatureOpacity');
        this.renderer.temperatureCutoffUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_temperatureCutoff');
        this.renderer.temperatureIORUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_temperatureIOR');
        this.renderer.humidityTemperatureColorUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_humidityTemperatureColor');
        this.renderer.humidityTemperatureOpacityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_humidityTemperatureOpacity');
        this.renderer.humidityTemperatureCutoffUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_humidityTemperatureCutoff');
        this.renderer.humidityTemperatureIORUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_humidityTemperatureIOR');
        this.renderer.relativeTemperatureColorUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_relativeTemperatureColor');
        this.renderer.relativeTemperatureOpacityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_relativeTemperatureOpacity');
        this.renderer.relativeTemperatureCutoffUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_relativeTemperatureCutoff');
        this.renderer.relativeTemperatureIORUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_relativeTemperatureIOR');
        this.renderer.updraftTemperatureColorUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_updraftTemperatureColor');
        this.renderer.updraftTemperatureOpacityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_updraftTemperatureOpacity');
        this.renderer.updraftTemperatureCutoffUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_updraftTemperatureCutoff');
        this.renderer.updraftTemperatureIORUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_updraftTemperatureIOR');

        // Stability uniforms
        this.renderer.globalStabilityUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_globalStability');
        this.renderer.inversionAltitudeUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_inversionAltitude');
        this.renderer.inversionTemperatureUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_inversionTemperature');
        this.renderer.groundInversionDepthUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_groundInversionDepth');
        this.renderer.groundInversionTemperatureUniformLocation = this.gl.getUniformLocation(this.renderer.program, 'u_groundInversionTemperature');

        // Samplers locations.
        this.renderer.u_basefluidLocation = this.gl.getUniformLocation(this.renderer.program, 'u_basefluid');
        this.renderer.u_solutesLocation = this.gl.getUniformLocation(this.renderer.program, 'u_solutes');
        this.renderer.u_backgroundLocation = this.gl.getUniformLocation(this.renderer.program, 'u_background');


        // Setup background image texture and first time initialize
        if (this.renderer.backgroundImageTexture)
         this.gl.deleteTexture(this.renderer.backgroundImageTexture);
        this.renderer.backgroundImageTexture = this.setupTexture();
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);

        // Upload the backgroundImage into the texture.
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.backgroundImage);


        // Make transfer texture and framebuffer (uses linear interpolation)
        if (this.renderer.transferBasefluidTexture)
         this.gl.deleteTexture(this.renderer.transferBasefluidTexture);
        this.renderer.transferBasefluidTexture = this.setupTexture();
        if (this.useLinear)
         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, this.simParams.resolution, this.simParams.resolution, 0, this.gl.RGBA, this.gl.FLOAT, null);

        if (this.renderer.transferBasefluidFramebuffer)
         this.gl.deleteFramebuffer(this.renderer.transferBasefluidFramebuffer);
        this.renderer.transferBasefluidFramebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.renderer.transferBasefluidFramebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.renderer.transferBasefluidTexture, 0);

        if (this.renderer.transferSolutesTexture)
         this.gl.deleteTexture(this.renderer.transferSolutesTexture);
        this.renderer.transferSolutesTexture = this.setupTexture();
        if (this.useLinear)
         this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, this.simParams.resolution, this.simParams.resolution, 0, this.gl.RGBA, this.gl.FLOAT, null);

        if (this.renderer.transferSolutesFramebuffer)
         this.gl.deleteFramebuffer(this.renderer.transferSolutesFramebuffer);
        this.renderer.transferSolutesFramebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.renderer.transferSolutesFramebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.renderer.transferSolutesTexture, 0);

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

    private doCalcFunction(framebuffer, calcFunction) {
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
        this.gl.useProgram(this.solver.program);

        // set which texture units to render with.
        this.gl.uniform1i(this.solver.u_basefluidLocation, 0);  // texture unit 0
        this.gl.uniform1i(this.solver.u_solutesLocation, 1);  // texture unit 1
        this.gl.uniform1i(this.solver.u_groundLocation, 2);  // texture unit 2

        // bind the input basefluidTexture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.solver.basefluidTextures[this.baseSrc]);

        // bind the input solutesTexture
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.solver.solutesTextures[this.solutesSrc]);

        this.gl.activeTexture(this.gl.TEXTURE2);
        this.groundDataToTexture();

        // set the framebuffer (null for rendering to canvas)
        this.setFramebuffer(framebuffer);

        // Tell the shader the resolution of the framebuffer.
        this.gl.uniform1f(this.solver.resolutionUniformLocation, this.simParams.resolution);

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
        this.gl.enableVertexAttribArray(this.solver.positionAttributeLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.solver.positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(this.solver.positionAttributeLocation, size, type, normalize, stride, offset)

        // TEXTURE COORDINATE
        // Turn on the attribute
        this.gl.enableVertexAttribArray(this.solver.texCoordAttributeLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.solver.texCoordBuffer);

        // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(this.solver.texCoordAttributeLocation, size, type, normalize, stride, offset)


        this.gl.uniform1i(this.solver.calcFunctionUniformLocation, calcFunction);
        this.gl.uniform1f(this.solver.diffusionUniformLocation, this.simParams.diffusion);

        // Buoyancy
        this.gl.uniform1f(this.solver.buoyancyFactorUniformLocation, this.simParams.buoyancyFactor);
        this.gl.uniform1f(this.solver.rainFallingFactorUniformLocation, this.simParams.rainFallingFactor);

        // Stability uniforms
        this.gl.uniform1f(this.solver.globalWindUniformLocation, this.simParams.globalWind);
        this.gl.uniform1f(this.solver.globalStabilityUniformLocation, this.simParams.globalStability);
        this.gl.uniform1f(this.solver.inversionAltitudeUniformLocation, this.simParams.inversionAltitude);
        this.gl.uniform1f(this.solver.inversionTemperatureUniformLocation, this.simParams.inversionTemperature);
        this.gl.uniform1f(this.solver.groundInversionDepthUniformLocation, this.simParams.groundInversionDepth);
        this.gl.uniform1f(this.solver.groundInversionTemperatureUniformLocation, this.simParams.groundInversionTemperature);
        this.gl.uniform1f(this.solver.heatDisipationRateUniformLocation, this.simParams.heatDisipationRate);

        // Atmosphere uniforms
        this.gl.uniform1f(this.solver.temperatureDiffusionUniformLocation, this.simParams.temperatureDiffusion);
        this.gl.uniform1f(this.solver.humidityDiffusionUniformLocation, this.simParams.humidityDiffusion);
        this.gl.uniform1f(this.solver.condensationFactorUniformLocation, this.simParams.condensationFactor);
        this.gl.uniform1f(this.solver.mistDiffusionUniformLocation, this.simParams.mistDiffusion);
        this.gl.uniform1f(this.solver.mistToRainFactorUniformLocation, this.simParams.mistToRainFactor);
        this.gl.uniform1f(this.solver.rainFallDiffusionUniformLocation, this.simParams.rainFallDiffusion);
        this.gl.uniform1f(this.solver.rainEvaporationUniformLocation, this.simParams.rainEvaporation);
        this.gl.uniform1f(this.solver.initialHumidityUniformLocation, this.simParams.initialHumidity);
        this.gl.uniform1f(this.solver.condensationLevelUniformLocation, this.simParams.condensationLevel);
        this.gl.uniform1f(this.solver.latentHeatUniformLocation, this.simParams.latentHeat);

        // draw
        var primitiveType = this.gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        this.gl.drawArrays(primitiveType, offset, count);
    }


    private correctLinearScale() {
        var ratio = this.getSolverToCanvasRatio(),
            factor = [256.0 / (this.solverResolution * ratio[0]), 256.0 / (this.solverResolution * ratio[1])];
        this.readBasefluid[0] *= factor[0];
        this.readBasefluid[1] *= factor[1];
        this.glider.basefluid[0] *= factor[0];
        this.glider.basefluid[1] *= factor[1];
   }

    private updateReaderGUI() {
        if (!this.isRunning && this.renderer.transferBasefluidFramebuffer && this.renderer.transferSolutesFramebuffer) {
            // If not running, maunaly read the data
            var sloverGridReadCoords = this.getPointOnSolverGrid(this.readCoords);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.renderer.transferBasefluidFramebuffer);
            this.gl.readPixels(sloverGridReadCoords[0] * this.solverResolution, sloverGridReadCoords[1] * this.solverResolution, 1, 1, this.gl.RGBA, this.gl.FLOAT, this.readBasefluid);
            this.correctLinearScale();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.renderer.transferSolutesFramebuffer);
            this.gl.readPixels(sloverGridReadCoords[0] * this.solverResolution, sloverGridReadCoords[1] * this.solverResolution, 1, 1, this.gl.RGBA, this.gl.FLOAT, this.readSolutes);
        }
    }

    private doRender() {
        var sloverGridReadCoords = this.getPointOnSolverGrid(this.readCoords),
            solverGridGliderCoords = this.getPointOnSolverGrid(this.glider.location);

        this.doCalcFunction(this.renderer.transferBasefluidFramebuffer, 0); // 0 - COPY basefluid
        this.gl.readPixels(sloverGridReadCoords[0], sloverGridReadCoords[1], 1, 1, this.gl.RGBA, this.gl.FLOAT, this.readBasefluid);
        this.gl.readPixels(solverGridGliderCoords[0], solverGridGliderCoords[1], 1, 1, this.gl.RGBA, this.gl.FLOAT, this.glider.basefluid);
        this.correctLinearScale();

        this.doCalcFunction(this.renderer.transferSolutesFramebuffer, 1); // 1 - COPY solutes
        this.gl.readPixels(sloverGridReadCoords[0], sloverGridReadCoords[1], 1, 1, this.gl.RGBA, this.gl.FLOAT, this.readSolutes);
        this.gl.readPixels(solverGridGliderCoords[0], solverGridGliderCoords[1], 1, 1, this.gl.RGBA, this.gl.FLOAT, this.glider.solutes);

        this.updateReaderGUI();

        // Tell it to use our renderer program (pair of shaders)
        this.gl.useProgram(this.renderer.program);

        // set which texture units to render with.
        this.gl.uniform1i(this.renderer.u_basefluidLocation, 0);  // texture unit 0
        this.gl.uniform1i(this.renderer.u_solutesLocation, 1);  // texture unit 1
        this.gl.uniform1i(this.renderer.u_backgroundLocation, 2);  // texture unit 1

        // bind the input basefluidTexture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.transferBasefluidTexture);

        // bind the input solutesTexture
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.transferSolutesTexture);

        // bind the input backgro
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.backgroundImageTexture);

        // set the framebuffer (null for rendering to canvas)
        this.setFramebuffer(null);

        // Tell the shader the resolution of the framebuffer.
        this.gl.uniform2f(this.renderer.resolutionUniformLocation, this.simParams.resolution, this.simParams.resolution);

        // VERTEX
        // Turn on the attribute
        this.gl.enableVertexAttribArray(this.renderer.positionAttributeLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.renderer.positionBuffer);
        this.gl.vertexAttribPointer(this.renderer.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0)

        // TEXTURE COORDINATE
        // Turn on the attribute
        this.gl.enableVertexAttribArray(this.renderer.texCoordAttributeLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.renderer.texCoordBuffer);
        this.gl.vertexAttribPointer(this.renderer.texCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0)

        // BACKGROUND TEXTURE COORDINATE
        // Turn on the attribute
        this.gl.enableVertexAttribArray(this.renderer.bgTexCoordAttributeLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.renderer.bgTexCoordBuffer);
        this.gl.vertexAttribPointer(this.renderer.bgTexCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0)

        // Display uniforms
        this.gl.uniform3f(this.renderer.backgroundImageTintUniformLocation, this.simParams.backgroundImageTint[0] / 256.0, this.simParams.backgroundImageTint[1] / 256.0, this.simParams.backgroundImageTint[2] / 256.0);
        this.gl.uniform1f(this.renderer.backgroundImageBrightnessUniformLocation, this.simParams.backgroundImageBrightness);

        this.gl.uniform3f(this.renderer.pressureColorUniformLocation, this.simParams.pressureColor[0] / 256.0, this.simParams.pressureColor[1] / 256.0, this.simParams.pressureColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.pressureOpacityUniformLocation, this.simParams.pressureOpacity);
        this.gl.uniform1f(this.renderer.pressureCutoffUniformLocation, this.simParams.pressureCutoff);
        this.gl.uniform1f(this.renderer.pressureIORUniformLocation, this.simParams.pressureIOR);
        this.gl.uniform3f(this.renderer.updraftColorUniformLocation, this.simParams.updraftColor[0] / 256.0, this.simParams.updraftColor[1] / 256.0, this.simParams.updraftColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.updraftOpacityUniformLocation, this.simParams.updraftOpacity);
        this.gl.uniform1f(this.renderer.updraftCutoffUniformLocation, this.simParams.updraftCutoff);
        this.gl.uniform1f(this.renderer.updraftIORUniformLocation, this.simParams.updraftIOR);
        this.gl.uniform3f(this.renderer.cloudColorUniformLocation, this.simParams.cloudColor[0] / 256.0, this.simParams.cloudColor[1] / 256.0, this.simParams.cloudColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.cloudOpacityUniformLocation, this.simParams.cloudOpacity);
        this.gl.uniform1f(this.renderer.cloudCutoffUniformLocation, this.simParams.cloudCutoff);
        this.gl.uniform1f(this.renderer.cloudIORUniformLocation, this.simParams.cloudIOR);
        this.gl.uniform3f(this.renderer.rainColorUniformLocation, this.simParams.rainColor[0] / 256.0, this.simParams.rainColor[1] / 256.0, this.simParams.rainColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.rainOpacityUniformLocation, this.simParams.rainOpacity);
        this.gl.uniform1f(this.renderer.rainCutoffUniformLocation, this.simParams.rainCutoff);
        this.gl.uniform1f(this.renderer.rainIORUniformLocation, this.simParams.rainIOR);
        this.gl.uniform3f(this.renderer.humidityColorUniformLocation, this.simParams.humidityColor[0] / 256.0, this.simParams.humidityColor[1] / 256.0, this.simParams.humidityColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.humidityOpacityUniformLocation, this.simParams.humidityOpacity);
        this.gl.uniform1f(this.renderer.humidityCutoffUniformLocation, this.simParams.humidityCutoff);
        this.gl.uniform1f(this.renderer.humidityIORUniformLocation, this.simParams.humidityIOR);
        this.gl.uniform3f(this.renderer.temperatureColorUniformLocation, this.simParams.temperatureColor[0] / 256.0, this.simParams.temperatureColor[1] / 256.0, this.simParams.temperatureColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.temperatureOpacityUniformLocation, this.simParams.temperatureOpacity);
        this.gl.uniform1f(this.renderer.temperatureCutoffUniformLocation, this.simParams.temperatureCutoff);
        this.gl.uniform1f(this.renderer.temperatureIORUniformLocation, this.simParams.temperatureIOR);
        this.gl.uniform3f(this.renderer.humidityTemperatureColorUniformLocation, this.simParams.humidityTemperatureColor[0] / 256.0, this.simParams.humidityTemperatureColor[1] / 256.0, this.simParams.humidityTemperatureColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.humidityTemperatureOpacityUniformLocation, this.simParams.humidityTemperatureOpacity);
        this.gl.uniform1f(this.renderer.humidityTemperatureCutoffUniformLocation, this.simParams.humidityTemperatureCutoff);
        this.gl.uniform1f(this.renderer.humidityTemperatureIORUniformLocation, this.simParams.humidityTemperatureIOR);
        this.gl.uniform3f(this.renderer.relativeTemperatureColorUniformLocation, this.simParams.relativeTemperatureColor[0] / 256.0, this.simParams.relativeTemperatureColor[1] / 256.0, this.simParams.relativeTemperatureColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.relativeTemperatureOpacityUniformLocation, this.simParams.relativeTemperatureOpacity);
        this.gl.uniform1f(this.renderer.relativeTemperatureCutoffUniformLocation, this.simParams.relativeTemperatureCutoff);
        this.gl.uniform1f(this.renderer.relativeTemperatureIORUniformLocation, this.simParams.relativeTemperatureIOR);
        this.gl.uniform3f(this.renderer.updraftTemperatureColorUniformLocation, this.simParams.updraftTemperatureColor[0] / 256.0, this.simParams.updraftTemperatureColor[1] / 256.0, this.simParams.updraftTemperatureColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.updraftTemperatureOpacityUniformLocation, this.simParams.updraftTemperatureOpacity);
        this.gl.uniform1f(this.renderer.updraftTemperatureCutoffUniformLocation, this.simParams.updraftTemperatureCutoff);
        this.gl.uniform1f(this.renderer.updraftTemperatureIORUniformLocation, this.simParams.updraftTemperatureIOR);

        // Stability uniforms
        this.gl.uniform1f(this.renderer.globalStabilityUniformLocation, this.simParams.globalStability);
        this.gl.uniform1f(this.renderer.inversionAltitudeUniformLocation, this.simParams.inversionAltitude);
        this.gl.uniform1f(this.renderer.inversionTemperatureUniformLocation, this.simParams.inversionTemperature);
        this.gl.uniform1f(this.renderer.groundInversionDepthUniformLocation, this.simParams.groundInversionDepth);
        this.gl.uniform1f(this.renderer.groundInversionTemperatureUniformLocation, this.simParams.groundInversionTemperature);

        // draw
        var primitiveType = this.gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        this.gl.drawArrays(primitiveType, offset, count);

        this.glider.doRender();
    }

    private updateCanvas() {
        if (this.simParams.displayOutline)
            this.canvas.style.border = '1px  solid red';
        else
            this.canvas.style.border = 'none';
        if (!this.isRunning) {
            this.doRender(); // RENDER
        }
    }


    private project(srcIndex?:number) {
        this.doCalcFunction(this.solver.basefluidFramebuffers[this.baseDst], 4); this.swapBase();
        for (var i=1; i<this.simParams.pressureSolveSteps; i+=1) {
         this.doCalcFunction(this.solver.basefluidFramebuffers[this.baseDst], 5); this.swapBase();
        }
        this.doCalcFunction(this.solver.basefluidFramebuffers[this.baseDst], 6); this.swapBase();
    }

    private setGroundData(x, temp, humidity) {
        this.groundData[x * 4 + 0] = temp;
        this.groundData[x * 4 + 2] = humidity;
    }

    private stepSimulation() {
        this.setGroundData(2, 70, 0);
        this.setGroundData(3, 70, 10);
        this.setGroundData(4, 170, 10);
        this.setGroundData(5, 70, 10);
        this.setGroundData(8, 170, 10);
        this.setGroundData(9, 70, 0);
        this.setGroundData(12, 0, 50);
        this.setGroundData(13, 0, 50);

        this.doCalcFunction(this.solver.basefluidFramebuffers[this.baseDst], 9); this.swapBase(); // 9 - add forces
        this.doCalcFunction(this.solver.solutesFramebuffers[this.solutesDst], 10); this.swapSolutes(); // 10 - atmospherics
        this.doCalcFunction(this.solver.basefluidFramebuffers[this.baseDst], 2); this.swapBase(); // 2 - diffuse
        this.doCalcFunction(this.solver.solutesFramebuffers[this.solutesDst], 7); this.swapSolutes(); // 7 - diffuse solutes
        this.project();
        this.doCalcFunction(this.solver.basefluidFramebuffers[this.baseDst], 3); this.swapBase(); // 3 - advect
        this.doCalcFunction(this.solver.solutesFramebuffers[this.solutesDst], 8); this.swapSolutes(); // 8 - advect solutes
        this.project();

        this.glider.stepSimulation(this.readCoords);

        this.doRender(); // RENDER

        if (this.isRunning)
            requestAnimationFrame(this.stepSimulation.bind(this));
    }


    public resolutionChanged(value) {
        if (value != this.solverResolution) {
            this.initPrograms(true);
            this.solverResolution = value;
        }
    }

}
