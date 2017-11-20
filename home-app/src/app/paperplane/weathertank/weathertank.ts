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

import { PaperplaneSitePrefs } from './paperplane-site-prefs';


export class Weathertank {
    private canvas: any;
    private gl: any;

    private renderer: WeathertankRenderer;
    private solver: WeathertankSolver;

    private sitePrefs: PaperplaneSitePrefs;

    public simParams: WeathertankParams;
    public glider: PaperplaneGlider;

    private readCoords: Float32Array;
    private readBasefluid: Float32Array;
    private readSolutes: Float32Array;
    private solverToCanvasPixelScale: number[];

    public isRunning: boolean;
    private requestId: any;

    // Solver's grid position on canvas
    private marginTopSolver: number;
    private marginBottomSolver: number;
    private aspectSolver: number;
    private hMarginSolver: number;

    private useLinear: boolean;

    private solverResolution: number;

    private backgroundImage: any;

    public isLoaded: boolean;


    constructor() {
        this.readCoords = new Float32Array(2);
        this.readBasefluid = new Float32Array(4);
        this.readSolutes = new Float32Array(4);
        this.solverToCanvasPixelScale = [1.0, 1.0];

        this.solver = new WeathertankSolver();
        this.renderer = new WeathertankRenderer(this.solver);
        this.simParams = new WeathertankParams();
        this.glider = new PaperplaneGlider();

        this.isRunning = true;

        this.useLinear = true;

        this.solverResolution = 256.0;

        this.backgroundImage = new Image();

        this.isLoaded = false;
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


    // Controls
    public start() {
        if (!this.isRunning) {      
            this.isRunning = true; // reset stop signal
            requestAnimationFrame(this.stepSimulation.bind(this));
            // console.log('START');
        }
    }

    public pause() {
        if (this.isRunning) {
            this.isRunning = false;
            cancelAnimationFrame(this.requestId);
            // console.log('STOP');
        } else {
            this.initPrograms();
            // console.log('RESET');
        }
    }

    public step() {
        if (!this.isRunning) {
            this.stepSimulation();
            // console.log('STEP');
        }
    }

    public setPaperplaneTarget(canvasX: number, canvasY: number) {
        this.readCoords[0] = canvasX / this.sitePrefs.canvasBox.width;
        this.readCoords[1] = 1.0 - canvasY / this.sitePrefs.canvasBox.height;

        this.sitePrefs.targetPointer.top.css('left', canvasX);
        this.sitePrefs.targetPointer.bottom.css('left', canvasX);

        if (!this.isRunning) {
           this.updateReaderGUI();
        }

    }

    
    // Loading
    public load(canvas: any, sitePrefs: PaperplaneSitePrefs) {
        this.sitePrefs = sitePrefs;

        this.canvas = canvas;
        this.canvas.width = this.sitePrefs.canvasBox.width;
        this.canvas.height = this.sitePrefs.canvasBox.height;

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

        // Has all the capability, continue loading
        this.isLoaded = true;

        var tank = this;
        this.canvas.onmousemove = function(e) {
            tank.setPaperplaneTarget(e.clientX, e.clientY);
        }

        // Solver's grid position on canvas
        this.marginTopSolver = 0.1;
        this.marginBottomSolver = 0.1;
        this.aspectSolver = 1.25;
        this.hMarginSolver = 0.5 * (this.canvas.width * (this.marginTopSolver + 1.0 + this.marginBottomSolver) / (this.sitePrefs.canvasBox.height * this.aspectSolver) - 1.0);
        

        // sync loading, init when all is loaded
        var tank = this;
        var checkpoints = [];

        function sync(i) {
            checkpoints[i - 1] = true;
            if (checkpoints.every(function(i){return i;})) {
                tank.initPrograms();
            }
        }

        // Start loading of background texture
        var checkIndexImage = checkpoints.push(false);
        tank.backgroundImage.onload = function () {
           sync(checkIndexImage);
        }
        tank.backgroundImage.src = sitePrefs.backgroundImageUrl;
        

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
            var xhrPresets: any = new XMLHttpRequest();
            var checkIndexPresets = checkpoints.push(false);
            xhrPresets.open('GET', 'presets.json', true);
            xhrPresets.onload = function(e) {
                if (this.status == 200) {
                    let presets = JSON.parse(xhrPresets.response);
                    let clearSky = presets.remembered.ClearSky[0];
                    tank.simParams.update(clearSky);
                    tank.simParams.update(sitePrefs);
                    tank.solverResolution = sitePrefs.solverResolution;
                    tank.simParams.resolution = sitePrefs.solverResolution;
                    sync(checkIndexPresets);
                }
            };
            xhrPresets.send(null);
        }
    }


    private initPrograms(skipStep?:boolean) {
        this.solver.initProgram(this.gl, this.simParams);
        this.renderer.initProgram(this.gl, this.simParams, { backgroundImage: this.backgroundImage, useLinear: this.useLinear});
        this.glider.initPaperplaneProgram(this.gl, this.canvas, this.simParams, this.marginBottomSolver - 0.015);

        this.setupSolverGridReadCoords();
        this.setupBackgroundCoords();
        this.updateCanvas();

        this.solver.initializeAtmosphere();
        this.doRender(); // RENDER

        if (!skipStep)
            this.stepSimulation();
    }


    private setupBackgroundCoords() {
        let backgroundBox = {top: -1, left: -1, bottom: 1, right: 1};

        let cn = this.sitePrefs.canvasBox;
        let bg = this.sitePrefs.backgroundBox;

        let bgPlacement = {
            top: (cn.top - bg.top) / bg.height,
            left: (cn.left - bg.left) / bg.width,
            bottom: (cn.top + cn.height - bg.top) / bg.height,
            right: (cn.left + cn.width - bg.left) / bg.width,
        };

        var bgTexCoord = [
            bgPlacement.left, bgPlacement.bottom,
            bgPlacement.left, bgPlacement.top,
            bgPlacement.right, bgPlacement.bottom,
            bgPlacement.left, bgPlacement.top,
            bgPlacement.right, bgPlacement.top,
            bgPlacement.right, bgPlacement.bottom ,
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

        this.solverToCanvasPixelScale[0] = this.sitePrefs.canvasBox.width / (this.simParams.resolution * (1.0 + 2.0 * this.hMarginSolver));
        this.solverToCanvasPixelScale[1] = this.sitePrefs.canvasBox.height / (this.simParams.resolution * (1.0 + this.marginTopSolver + this.marginBottomSolver));
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

        this.solver.doCalcFunction(this.renderer.transferBasefluidFramebuffer, 0); // 0 - COPY basefluid
        this.gl.readPixels(sloverGridReadCoords[0], sloverGridReadCoords[1], 1, 1, this.gl.RGBA, this.gl.FLOAT, this.readBasefluid);
        this.gl.readPixels(solverGridGliderCoords[0], solverGridGliderCoords[1], 1, 1, this.gl.RGBA, this.gl.FLOAT, this.glider.basefluid);
        this.correctLinearScale();

        this.solver.doCalcFunction(this.renderer.transferSolutesFramebuffer, 1); // 1 - COPY solutes
        this.gl.readPixels(sloverGridReadCoords[0], sloverGridReadCoords[1], 1, 1, this.gl.RGBA, this.gl.FLOAT, this.readSolutes);
        this.gl.readPixels(solverGridGliderCoords[0], solverGridGliderCoords[1], 1, 1, this.gl.RGBA, this.gl.FLOAT, this.glider.solutes);

        this.updateReaderGUI();

        // Tell it to use our renderer program (pair of shaders)
        this.gl.useProgram(this.renderer.program);

        // set which texture units to render with.
        this.gl.uniform1i(this.renderer.u_basefluidLocation, 0);  // texture unit 0
        this.gl.uniform1i(this.renderer.u_solutesLocation, 1);  // texture unit 1
        this.gl.uniform1i(this.renderer.u_backgroundLocation, 2);  // texture unit 2
        this.gl.uniform1i(this.renderer.u_groundLocation, 3);  // texture unit 3

        // bind the input basefluidTexture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.transferBasefluidTexture);

        // bind the input solutesTexture
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.transferSolutesTexture);

        // bind the input backgroundImageTexture
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.renderer.backgroundImageTexture);

        // bind the input backgroundImageTexture
        this.gl.activeTexture(this.gl.TEXTURE3);
        this.solver.groundDataToTexture();

        // set the framebuffer (null for rendering to canvas)
        this.setFramebuffer(null);

        // Tell the shader the resolution of the framebuffer.
        this.gl.uniform2f(this.renderer.resolutionUniformLocation, this.simParams.resolution, this.simParams.resolution);
        this.gl.uniform2f(this.renderer.textureRatioUniformLocation,
            this.simParams.resolution / this.sitePrefs.canvasBox.width,
            this.simParams.resolution / this.sitePrefs.canvasBox.height);

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

        this.gl.uniform3f(this.renderer.backgroundTintColorUniformLocation, this.simParams.backgroundTintColor[0] / 256.0, this.simParams.backgroundTintColor[1] / 256.0, this.simParams.backgroundTintColor[2] / 256.0);
        this.gl.uniform1f(this.renderer.backgroundTintOpacityUniformLocation, this.simParams.backgroundTintOpacity);

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
/*        if (this.simParams.displayOutline)
            this.canvas.style.border = '1px  solid red';
        else
            this.canvas.style.border = 'none';
        */
        if (!this.isRunning) {
            this.doRender(); // RENDER
        }
    }


    private setGroundData(x, temp, humidity) {
        this.solver.groundData[x * 4 + 0] = temp;
        this.solver.groundData[x * 4 + 2] = humidity;
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

        this.solver.stepSimulation();
        this.glider.stepSimulation(this.readCoords);

        this.doRender(); // RENDER

        if (this.isRunning)
            requestAnimationFrame(this.stepSimulation.bind(this));
    }

/*
    public resolutionChanged(value) {
        if (value != this.solverResolution) {
            this.initPrograms(true);
            this.solverResolution = value;
        }
    }
*/

}
