/************************************************************************

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

function createShader(gl, type, source) {
   var shader = gl.createShader(type);
   gl.shaderSource(shader, source);
   gl.compileShader(shader);
   
   var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
   
   if (success) {
      return shader;
   }

   console.log(gl.getShaderInfoLog(shader));
   console.log(source);
   gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
   var program = gl.createProgram();
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);
   var success = gl.getProgramParameter(program, gl.LINK_STATUS);
   if (success) {
      return program;
   }

   console.log(gl.getProgramInfoLog(program));
   gl.deleteProgram(program);
}


window.onload = function() {
   var canvas = document.getElementById('simcanvas');
   canvas.width = canvas.clientWidth;
   canvas.height = canvas.clientHeight;
   var gl = canvas.getContext('webgl2', { premultipliedAlpha: false }); // ('experimental-webgl');

   ext = gl.getExtension("EXT_color_buffer_float");
   if (!ext) {
      console.log("need EXT_color_buffer_float");
      return;
   }
   ext = gl.getExtension('OES_texture_float_linear');
   if (!ext) {
      console.log("need OES_texture_float_linear");
      return;
   }


   var readCoords = new Float32Array(2);
   var readBasefluid = new Float32Array(4);
   var readSolutes = new Float32Array(4);

   canvas.onmousemove = function(e) {
      // console.log(e.clientX / canvas.width + ' ' + e.clientY / canvas.height);
      readCoords[0] = e.clientX / canvas.width;
      readCoords[1] = 1.0 - e.clientY / canvas.height;

      if (!isRunning) {
         updateReaderGUI();
      }
   }


   var gui = null;

   var RendererClass = function() {
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
      this.logoImageTexture = null;

      // Transfer textures and framebuffers
      this.transferBasefluidTexture = null;
      this.transferBasefluidFramebuffer = null;
      this.transferSolutesTexture = null;
      this.transferSolutesFramebuffer = null;

      this.u_basefluidLocation = null;
      this.u_solutesLocation = null;
      this.u_backgroundLocation = null;
   };

   var SolverClass = function() {
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
   };

   var renderer = new RendererClass();
   var solver = new SolverClass();

   var groundData = new Uint8Array(16 * 4);

   function groundDataToTexture() {
      gl.bindTexture(gl.TEXTURE_2D, solver.groundTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, groundData);
   }

   function setupTexture() {
      // Create a texture.
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Set the parameters so we can render any size image.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
      return texture;
   }


   var isRunning = window.location.hash!='#nostart';
   var stepSimulation; // Function declaration
   

   var SimParams = function() {
      // Simulation params

      // Buoyancy
      this.buoyancyFactor = 0.01;
      this.rainFallingFactor = 0.01;

      this.globalWind = 0.05;
      this.globalStability = 0.02;
      this.inversionAltitude = 0.9;
      this.inversionTemperature = 0.8;
      this.groundInversionDepth = 0.1;
      this.groundInversionTemperature = 0.3;
      this.heatDisipationRate = 0.0001;

      this.temperatureDiffusion = 0.01;
      this.humidityDiffusion = 0.01;
      this.condensationFactor = 1.0;
      this.mistDiffusion = 0.01;
      this.mistToRainFactor = 0.001;
      this.rainFallDiffusion = 0.2;
      this.rainEvaporation = 0.00008;

      this.initialHumidity = 0.0;
      this.condensationLevel = 0.6;
      this.latentHeat = 1.0;


      // Solver Settings
      this.stepSize = 0.1;
      this.resolution = 256;
      this.pressureSolveSteps = 10;
      this.diffusion = 0.01;

      // Display Options
      this.displayOutline = false;

      this.backgroundImage = -1;
      this.backgroundImageTint = [255, 255, 255];
      this.backgroundImageBrightness = 0.0;

      this.pressureColor = [255, 0, 0];
      this.pressureOpacity = 0.0;
      this.pressureCutoff = 0.0;
      this.pressureIOR = 0.0;
      this.updraftColor = [255, 0, 0];
      this.updraftOpacity = 0.0;
      this.updraftCutoff = 0.0;
      this.updraftIOR = 0.0;
      this.cloudColor = [255, 255, 255];
      this.cloudOpacity = 1.0;
      this.cloudCutoff = 0.0;
      this.cloudIOR = 0.0;
      this.rainColor = [120, 120, 155];
      this.rainOpacity = 1.0;
      this.rainCutoff = 0.0;
      this.rainIOR = 0.0;
      this.humidityColor = [0, 0, 255];
      this.humidityOpacity = 1.0;
      this.humidityCutoff = 0.0;
      this.humidityIOR = 0.0;
      this.temperatureColor = [255, 0, 0];
      this.temperatureOpacity = 0.0;
      this.temperatureCutoff = 0.0;
      this.temperatureIOR = 0.0;
      this.humidityTemperatureColor = [255, 0, 0];
      this.humidityTemperatureOpacity = 0.0;
      this.humidityTemperatureCutoff = 0.0;
      this.humidityTemperatureIOR = 0.0;
      this.relativeTemperatureColor = [255, 0, 0];
      this.relativeTemperatureOpacity = 0.0;
      this.relativeTemperatureCutoff = 0.0;
      this.relativeTemperatureIOR = 0.0;
      this.updraftTemperatureColor = [255, 0, 0];
      this.updraftTemperatureOpacity = 0.0;
      this.updraftTemperatureCutoff = 0.0;
      this.updraftTemperatureIOR = 0.0;

      // Controls
      this.runSimulation = function() {
         if (!isRunning) {      
            console.log('START');
            
            isRunning = true; // reset stop signal
            requestAnimationFrame(stepSimulation);
         }
      };
      this.stopSimulation = function() {
         if (isRunning) {
            isRunning = false;
            console.log('STOP');
         } else {
            console.log('RESET');
            initPrograms();
         }
      };
      this.stepSimulation =  function() {
         if (!isRunning) {
            stepSimulation();
            console.log('STEP');
         }
      };

      // Read pixels
      this.basefluid = '';
      this.solutes = '';
   };

   var simParams = new SimParams();

   function initPrograms() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      initSolverProgram();
      initRendererProgram();
      updateCanvas();

      solutesSrc = 0;
      solutesDst = 1;
      baseSrc = 0;
      baseDst = 1;
      doCalcFunction(solver.solutesFramebuffers[solutesDst], 11); swapSolutes(); // 1 - Initialize ATMOSPHERE

      doRender(); // RENDER

      stepSimulation();
   }

   function initSolverProgram() {
      solver.program = createProgram(gl, solver.vertexShader, solver.fragmentShader);

      solver.positionAttributeLocation = gl.getAttribLocation(solver.program, "a_position");
      solver.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, solver.positionBuffer);
      var positions = [
         -1, -1,
         -1,  1,
          1, -1,
         -1,  1,
          1,  1,
          1, -1,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      solver.texCoordAttributeLocation = gl.getAttribLocation(solver.program, "a_texCoord");
      solver.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, solver.texCoordBuffer);
      var texCoord = [
         0, 0,
         0, 1,
         1, 0,
         0, 1,
         1, 1,
         1, 0,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoord), gl.STATIC_DRAW);
   
      solver.calcFunctionUniformLocation = gl.getUniformLocation(solver.program, "u_calcFunction");
      solver.resolutionUniformLocation = gl.getUniformLocation(solver.program, "u_resolution");
      solver.diffusionUniformLocation = gl.getUniformLocation(solver.program, "u_diffusion");

      // Buoyancy
      solver.buoyancyFactorUniformLocation = gl.getUniformLocation(solver.program, 'u_buoyancyFactor');
      solver.rainFallingFactorUniformLocation = gl.getUniformLocation(solver.program, 'u_rainFallingFactor');

      // Stability uniforms
      solver.globalWindUniformLocation = gl.getUniformLocation(solver.program, "u_globalWind");
      solver.globalStabilityUniformLocation = gl.getUniformLocation(solver.program, "u_globalStability");
      solver.inversionAltitudeUniformLocation = gl.getUniformLocation(solver.program, "u_inversionAltitude");
      solver.inversionTemperatureUniformLocation = gl.getUniformLocation(solver.program, "u_inversionTemperature");
      solver.groundInversionDepthUniformLocation = gl.getUniformLocation(solver.program, "u_groundInversionDepth");
      solver.groundInversionTemperatureUniformLocation = gl.getUniformLocation(solver.program, "u_groundInversionTemperature");
      solver.heatDisipationRateUniformLocation = gl.getUniformLocation(solver.program, 'u_heatDisipationRate');

      // Atmosphere uniforms
      solver.temperatureDiffusionUniformLocation = gl.getUniformLocation(solver.program, 'u_temperatureDiffusion');
      solver.humidityDiffusionUniformLocation = gl.getUniformLocation(solver.program, 'u_humidityDiffusion');
      solver.condensationFactorUniformLocation = gl.getUniformLocation(solver.program, 'u_condensationFactor');
      solver.mistDiffusionUniformLocation = gl.getUniformLocation(solver.program, 'u_mistDiffusion');
      solver.mistToRainFactorUniformLocation = gl.getUniformLocation(solver.program, 'u_mistToRainFactor');
      solver.rainFallDiffusionUniformLocation = gl.getUniformLocation(solver.program, 'u_rainFallDiffusion');
      solver.rainEvaporationUniformLocation = gl.getUniformLocation(solver.program, 'u_rainEvaporation');
      solver.initialHumidityUniformLocation = gl.getUniformLocation(solver.program, 'u_initialHumidity');
      solver.condensationLevelUniformLocation = gl.getUniformLocation(solver.program, 'u_condensationLevel');
      solver.latentHeatUniformLocation = gl.getUniformLocation(solver.program, 'u_latentHeat');

      // Samplers locations.
      solver.u_basefluidLocation = gl.getUniformLocation(solver.program, "u_basefluid");
      solver.u_solutesLocation = gl.getUniformLocation(solver.program, "u_solutes");
      solver.u_groundLocation = gl.getUniformLocation(solver.program, "u_ground");


      if (solver.groundTexture) {
         gl.deleteTexture(solver.groundTexture);
      }
      solver.groundTexture = setupTexture();
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      groundDataToTexture();

      const level = 0;
      const internalFormat = gl.RGBA32F;
      var res = simParams.resolution;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.FLOAT; //UNSIGNED_BYTE; // FLOAT;
      const data = null;

      // Base fluid textures
      for (var ii = 0; ii < 2; ++ii) {
         var basefluidTexture = setupTexture();
         if (ii < solver.basefluidTextures.length) {
            gl.deleteTexture(solver.basefluidTextures[ii]);
            solver.basefluidTextures[ii] = basefluidTexture;
         }
         else
            solver.basefluidTextures.push(basefluidTexture);

         // make the texture of the right size
         gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, res, res, border, format, type, data);

         // create a framebuffer
         var basefluidFramebuffer = gl.createFramebuffer();
         if (ii < solver.basefluidFramebuffers.length) {
            gl.deleteFramebuffer(solver.basefluidFramebuffers[ii]);
            solver.basefluidFramebuffers[ii] = basefluidFramebuffer;
         }
         else
            solver.basefluidFramebuffers.push(basefluidFramebuffer);

         // Attach a texture to it
         gl.bindFramebuffer(gl.FRAMEBUFFER, basefluidFramebuffer);
         gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, basefluidTexture, 0);
      }

      // Solutes textures
      for (var ii = 0; ii < 2; ++ii) {
         var solutesTexture = setupTexture();
         if (ii < solver.solutesTextures.length) {
            gl.deleteTexture(solver.solutesTextures[ii]);
            solver.solutesTextures[ii] = solutesTexture;
         }
         else
            solver.solutesTextures.push(solutesTexture);

         // make the texture of the right size
         gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, res, res, border, format, type, data);

         // create a framebuffer
         var solutesFramebuffer = gl.createFramebuffer();
         if (ii < solver.solutesFramebuffers.length) {
            gl.deleteFramebuffer(solver.solutesFramebuffers[ii]);
            solver.solutesFramebuffers[ii] = solutesFramebuffer;
         }
         else
            solver.solutesFramebuffers.push(solutesFramebuffer);

         // Attach a texture to it
         gl.bindFramebuffer(gl.FRAMEBUFFER, solutesFramebuffer);
         gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, solutesTexture, 0);
      }
   }

   function setupBackgroundCoords() {
      var vMarginBackground = 0.5 * (canvas.height / backgroundImage.height - 1.0);
      var hMarginBackground = 0.5 * (canvas.width / backgroundImage.width - 1.0);

      gl.bindBuffer(gl.ARRAY_BUFFER, renderer.bgTexCoordBuffer);
      var bgTexCoord = [
         -hMarginBackground, 1.0 + vMarginBackground,
         -hMarginBackground, -vMarginBackground,
         1.0 + hMarginBackground, 1.0 + vMarginBackground,
         -hMarginBackground, -vMarginBackground,
         1.0 + hMarginBackground, -vMarginBackground,
         1.0 + hMarginBackground, 1.0 + vMarginBackground,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bgTexCoord), gl.STATIC_DRAW);
   }

   // Solver's grid position on canvas
   var marginTopSolver = 0.1;
   var marginBottomSolver = 0.1;
   var aspectSolver = 1.25;
   var hMarginSolver = 0.5 * (canvas.width * (marginTopSolver + 1.0 + marginBottomSolver) / (canvas.height * aspectSolver) - 1.0);

   function setupSolverGridCoords() {
      gl.bindBuffer(gl.ARRAY_BUFFER, renderer.texCoordBuffer);
      var texCoord = [
         -hMarginSolver, -marginBottomSolver,
         -hMarginSolver, 1.0 + marginTopSolver,
          1.0 + hMarginSolver, -marginBottomSolver,
         -hMarginSolver, 1.0 + marginTopSolver,
          1.0 + hMarginSolver, 1.0 + marginTopSolver,
          1.0 + hMarginSolver, -marginBottomSolver,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoord), gl.STATIC_DRAW);
   }

   function getPointOnSolverGrid(canvasPoint) {
      var x = canvasPoint[0] * (1.0 + 2.0 * hMarginSolver) - hMarginSolver;
      var y = canvasPoint[1] * (1.0 + marginBottomSolver + marginTopSolver) - marginBottomSolver;
      return [x, y];
   }


   function initRendererProgram(solverCanvasScale) {
      renderer.program = createProgram(gl, renderer.vertexShader, renderer.fragmentShader);

      renderer.positionAttributeLocation = gl.getAttribLocation(renderer.program, "a_position");
      renderer.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, renderer.positionBuffer);
      var positions = [
         -1, -1,
         -1,  1,
          1, -1,
         -1,  1,
          1,  1,
          1, -1,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


      // Solver texture coordinates
      renderer.texCoordAttributeLocation = gl.getAttribLocation(renderer.program, "a_texCoord");
      renderer.texCoordBuffer = gl.createBuffer();
      setupSolverGridCoords();

      // Background texture coordinates
      renderer.bgTexCoordAttributeLocation = gl.getAttribLocation(renderer.program, "a_bgTexCoord");
      renderer.bgTexCoordBuffer = gl.createBuffer();
      setupBackgroundCoords();

      // Uniform variables locations   
      renderer.resolutionUniformLocation = gl.getUniformLocation(renderer.program, "u_resolution");

      // Display uniforms
      renderer.backgroundImageTintUniformLocation = gl.getUniformLocation(renderer.program, 'u_backgroundImageTint');
      renderer.backgroundImageBrightnessUniformLocation = gl.getUniformLocation(renderer.program, 'u_backgroundImageBrightness');

      renderer.pressureColorUniformLocation = gl.getUniformLocation(renderer.program, 'u_pressureColor');
      renderer.pressureOpacityUniformLocation = gl.getUniformLocation(renderer.program, 'u_pressureOpacity');
      renderer.pressureCutoffUniformLocation = gl.getUniformLocation(renderer.program, 'u_pressureCutoff');
      renderer.pressureIORUniformLocation = gl.getUniformLocation(renderer.program, 'u_pressureIOR');
      renderer.updraftColorUniformLocation = gl.getUniformLocation(renderer.program, "u_updraftColor");
      renderer.updraftOpacityUniformLocation = gl.getUniformLocation(renderer.program, "u_updraftOpacity");
      renderer.updraftCutoffUniformLocation = gl.getUniformLocation(renderer.program, "u_updraftCutoff");
      renderer.updraftIORUniformLocation = gl.getUniformLocation(renderer.program, "u_updraftIOR");
      renderer.cloudColorUniformLocation = gl.getUniformLocation(renderer.program, "u_cloudColor");
      renderer.cloudOpacityUniformLocation = gl.getUniformLocation(renderer.program, "u_cloudOpacity");
      renderer.cloudCutoffUniformLocation = gl.getUniformLocation(renderer.program, "u_cloudCutoff");
      renderer.cloudIORUniformLocation = gl.getUniformLocation(renderer.program, "u_cloudIOR");
      renderer.rainColorUniformLocation = gl.getUniformLocation(renderer.program, "u_rainColor");
      renderer.rainOpacityUniformLocation = gl.getUniformLocation(renderer.program, "u_rainOpacity");
      renderer.rainCutoffUniformLocation = gl.getUniformLocation(renderer.program, "u_rainCutoff");
      renderer.rainIORUniformLocation = gl.getUniformLocation(renderer.program, "u_rainIOR");
      renderer.humidityColorUniformLocation = gl.getUniformLocation(renderer.program, "u_humidityColor");
      renderer.humidityOpacityUniformLocation = gl.getUniformLocation(renderer.program, "u_humidityOpacity");
      renderer.humidityCutoffUniformLocation = gl.getUniformLocation(renderer.program, "u_humidityCutoff");
      renderer.humidityIORUniformLocation = gl.getUniformLocation(renderer.program, "u_humidityIOR");
      renderer.temperatureColorUniformLocation = gl.getUniformLocation(renderer.program, "u_temperatureColor");
      renderer.temperatureOpacityUniformLocation = gl.getUniformLocation(renderer.program, "u_temperatureOpacity");
      renderer.temperatureCutoffUniformLocation = gl.getUniformLocation(renderer.program, "u_temperatureCutoff");
      renderer.temperatureIORUniformLocation = gl.getUniformLocation(renderer.program, "u_temperatureIOR");
      renderer.humidityTemperatureColorUniformLocation = gl.getUniformLocation(renderer.program, "u_humidityTemperatureColor");
      renderer.humidityTemperatureOpacityUniformLocation = gl.getUniformLocation(renderer.program, "u_humidityTemperatureOpacity");
      renderer.humidityTemperatureCutoffUniformLocation = gl.getUniformLocation(renderer.program, "u_humidityTemperatureCutoff");
      renderer.humidityTemperatureIORUniformLocation = gl.getUniformLocation(renderer.program, "u_humidityTemperatureIOR");
      renderer.relativeTemperatureColorUniformLocation = gl.getUniformLocation(renderer.program, "u_relativeTemperatureColor");
      renderer.relativeTemperatureOpacityUniformLocation = gl.getUniformLocation(renderer.program, "u_relativeTemperatureOpacity");
      renderer.relativeTemperatureCutoffUniformLocation = gl.getUniformLocation(renderer.program, "u_relativeTemperatureCutoff");
      renderer.relativeTemperatureIORUniformLocation = gl.getUniformLocation(renderer.program, "u_relativeTemperatureIOR");
      renderer.updraftTemperatureColorUniformLocation = gl.getUniformLocation(renderer.program, "u_updraftTemperatureColor");
      renderer.updraftTemperatureOpacityUniformLocation = gl.getUniformLocation(renderer.program, "u_updraftTemperatureOpacity");
      renderer.updraftTemperatureCutoffUniformLocation = gl.getUniformLocation(renderer.program, "u_updraftTemperatureCutoff");
      renderer.updraftTemperatureIORUniformLocation = gl.getUniformLocation(renderer.program, "u_updraftTemperatureIOR");

      // Stability uniforms
      renderer.globalStabilityUniformLocation = gl.getUniformLocation(renderer.program, "u_globalStability");
      renderer.inversionAltitudeUniformLocation = gl.getUniformLocation(renderer.program, "u_inversionAltitude");
      renderer.inversionTemperatureUniformLocation = gl.getUniformLocation(renderer.program, "u_inversionTemperature");
      renderer.groundInversionDepthUniformLocation = gl.getUniformLocation(renderer.program, "u_groundInversionDepth");
      renderer.groundInversionTemperatureUniformLocation = gl.getUniformLocation(renderer.program, "u_groundInversionTemperature");

      // Samplers locations.
      renderer.u_basefluidLocation = gl.getUniformLocation(renderer.program, "u_basefluid");
      renderer.u_solutesLocation = gl.getUniformLocation(renderer.program, "u_solutes");
      renderer.u_backgroundLocation = gl.getUniformLocation(renderer.program, "u_background");

      
      // Setup background image texture and first time initialize
      if (renderer.backgroundImageTexture)
         gl.deleteTexture(renderer.backgroundImageTexture);
      renderer.backgroundImageTexture = setupTexture();
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
   
      // Upload the backgroundImage into the texture.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, backgroundImage);


/*
      if (renderer.logoImageTexture)
         gl.deleteTexture(renderer.logoImageTexture);
      renderer.logoImageTexture = setupTexture();
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
*/ 
      // Upload the image into the texture.
      //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);

      // Make transfer texture and framebuffer (uses linear interpolation)
      if (renderer.transferBasefluidTexture)
         gl.deleteTexture(renderer.transferBasefluidTexture);
      renderer.transferBasefluidTexture = setupTexture();
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, simParams.resolution, simParams.resolution, 0, gl.RGBA, gl.FLOAT, null);
      if (renderer.transferBasefluidFramebuffer)
         gl.deleteFramebuffer(renderer.transferBasefluidFramebuffer);
      renderer.transferBasefluidFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderer.transferBasefluidFramebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderer.transferBasefluidTexture, 0);

      if (renderer.transferSolutesTexture)
         gl.deleteTexture(renderer.transferSolutesTexture);
      renderer.transferSolutesTexture = setupTexture();
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, simParams.resolution, simParams.resolution, 0, gl.RGBA, gl.FLOAT, null);
      if (renderer.transferSolutesFramebuffer)
         gl.deleteFramebuffer(renderer.transferSolutesFramebuffer);
      renderer.transferSolutesFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderer.transferSolutesFramebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderer.transferSolutesTexture, 0);

   }

   // sync loading, init when all is loaded
   var checkpoints = [];
   function sync(i) {
      checkpoints[i - 1] = true;
      if (checkpoints.every(function(i){return i;})) {
         initPrograms();
      }
   }


   var backgroundImageURLs = [
      './images/aileron-grey.png',
      './images/squares/squares_00.png',
      './images/squares/squares_01.png',
      './images/squares/squares_02.png',
      './images/squares/squares_03.png',
      './images/hexes/hexes_00.png',
      './images/hexes/hexes_01.png',
      './images/aileron.png',
      './images/aileron-inv.png',
   ];


   var backgroundImage = new Image();

   // Loading new background image and pushing it into the background texture
   function loadBackgroundImage() {
      if (renderer.backgroundImageTexture) {
         backgroundImage.onload = function () {
            // Upload the backgroundImage into the texture.
            gl.bindTexture(gl.TEXTURE_2D, renderer.backgroundImageTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, backgroundImage);
            setupBackgroundCoords();
            updateCanvas();
         }
         backgroundImage.src = backgroundImageURLs[simParams.backgroundImage];
      }
   }


   // Load and compile solver shaders
   var xhrVertSolver = new XMLHttpRequest();
   var checkIndexVertSolver = checkpoints.push(false);
   xhrVertSolver.open('GET', 'shaders/weathersolver.vert', true);
   xhrVertSolver.onload = function(e) {
      if (this.status == 200) {
         solver.vertexShader = createShader(gl, gl.VERTEX_SHADER, xhrVertSolver.response);
         sync(checkIndexVertSolver);
      }
   };
   xhrVertSolver.send(null);

   var xhrFragSolver = new XMLHttpRequest();
   var checkIndexFragSolver = checkpoints.push(false);
   xhrFragSolver.open('GET', 'shaders/weathersolver.frag', true);
   xhrFragSolver.onload = function(e) {
      if (this.status == 200) {
         solver.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, xhrFragSolver.response);
         sync(checkIndexFragSolver);
      }
   };
   xhrFragSolver.send(null);

   // Load and compile renderer shaders
   var xhrVertRenderer = new XMLHttpRequest();
   var checkIndexVertRenderer = checkpoints.push(false);
   xhrVertRenderer.open('GET', 'shaders/weatherrenderer.vert', true);
   xhrVertRenderer.onload = function(e) {
      if (this.status == 200) {
         renderer.vertexShader = createShader(gl, gl.VERTEX_SHADER, xhrVertRenderer.response);
         sync(checkIndexVertRenderer);
      }
   };
   xhrVertRenderer.send(null);

   var xhrFragRenderer = new XMLHttpRequest();
   var checkIndexFragRenderer = checkpoints.push(false);
   xhrFragRenderer.open('GET', 'shaders/weatherrenderer.frag', true);
   xhrFragRenderer.onload = function(e) {
      if (this.status == 200) {
         renderer.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, xhrFragRenderer.response);
         sync(checkIndexFragRenderer);
      }
   };
   xhrFragRenderer.send(null);



   function initGUI(presets) {
      gui = new dat.GUI({ load: presets});

      gui.remember(simParams);

      var g0 = gui.addFolder('Simulation Params');

      var g00 = g0.addFolder('Stability');
      g00.add(simParams, 'globalWind').min(-1.0).max(1.0).step(0.01);
      g00.add(simParams, 'globalStability').min(0.0).max(0.5).step(0.01);
      g00.add(simParams, 'inversionAltitude').min(0.5).max(1.0).step(0.01);
      g00.add(simParams, 'inversionTemperature').min(0.5).max(1.5).step(0.01);
      g00.add(simParams, 'groundInversionDepth').min(0.0).max(0.5).step(0.01);
      g00.add(simParams, 'groundInversionTemperature').min(0.0).max(0.5).step(0.01);
      g00.add(simParams, 'heatDisipationRate').min(0.0).max(0.005).step(0.0001);
      // Buoyancy
      g00.add(simParams, 'buoyancyFactor').min(0.0).max(0.1).step(0.001);
      g00.add(simParams, 'rainFallingFactor').min(0.0).max(0.1).step(0.001);

      var g01 = g0.addFolder('Water Content');
      g01.add(simParams, 'temperatureDiffusion').min(0.0).max(0.1).step(0.01);
      g01.add(simParams, 'humidityDiffusion').min(0.0).max(0.1).step(0.01);
      g01.add(simParams, 'condensationFactor').min(0.0).max(1.0).step(0.01);
      g01.add(simParams, 'mistDiffusion').min(0.0).max(0.1).step(0.01);
      g01.add(simParams, 'mistToRainFactor').min(0.0).max(0.01).step(0.0001);
      g01.add(simParams, 'rainFallDiffusion').min(0.0).max(1.0).step(0.001);
      g01.add(simParams, 'rainEvaporation').min(0.0).max(0.001).step(0.00001);
      g01.add(simParams, 'initialHumidity').min(0.0).max(1.0).step(0.01);
      g01.add(simParams, 'condensationLevel').min(0.0).max(1.0).step(0.01);
      g01.add(simParams, 'latentHeat').min(0.0).max(5.0).step(0.1);

      var g1 = gui.addFolder('Solver Settings');
      //g1.add(simParams, 'stepSize').min(0.01).max(1.0).step(0.01);
      g1.add(simParams, 'resolution', [64, 128, 256, 512, 1024, 2048, 4096]).onChange(resolutionChanged);
      g1.add(simParams, 'pressureSolveSteps').min(1).max(30).step(1);
      g1.add(simParams, 'diffusion').min(0.0).max(1.0).step(0.01);


      // DISPLAY OPTIONS
      var g2 = gui.addFolder('Display Options');
      g2.add(simParams, 'displayOutline').onChange(updateCanvas);

      g2.add(simParams, 'backgroundImage', [0, 1, 2, 3, 4, 5, 6, 7, 8]).onChange(loadBackgroundImage);
      g2.addColor(simParams, 'backgroundImageTint').onChange(updateCanvas);
      g2.add(simParams, 'backgroundImageBrightness').min(-1.0).max(1.0).step(0.01).onChange(updateCanvas);

      var g20 = g2.addFolder('Pressure');
      g20.addColor(simParams, 'pressureColor').onChange(updateCanvas);
      g20.add(simParams, 'pressureOpacity').min(0.0).max(100000.0).step(100.0).onChange(updateCanvas);
      g20.add(simParams, 'pressureCutoff').min(0.0).max(0.01).step(0.00001).onChange(updateCanvas);
      g20.add(simParams, 'pressureIOR').min(-100.0).max(100.0).step(1.0).onChange(updateCanvas);
      var g21 = g2.addFolder('Updraft');
      g21.addColor(simParams, 'updraftColor').onChange(updateCanvas);
      g21.add(simParams, 'updraftOpacity').min(0.0).max(15.0).step(0.01).onChange(updateCanvas);
      g21.add(simParams, 'updraftCutoff').min(0.0).max(1.0).step(0.001).onChange(updateCanvas);
      g21.add(simParams, 'updraftIOR').min(-0.1).max(0.1).step(0.001).onChange(updateCanvas);
      var g22 = g2.addFolder('Cloud');
      g22.addColor(simParams, 'cloudColor').onChange(updateCanvas);
      g22.add(simParams, 'cloudOpacity').min(0.0).max(70.0).step(0.1).onChange(updateCanvas);
      g22.add(simParams, 'cloudCutoff').min(0.0).max(1.0).step(0.001).onChange(updateCanvas);
      g22.add(simParams, 'cloudIOR').min(-0.1).max(0.1).step(0.001).onChange(updateCanvas);
      var g23 = g2.addFolder('Rain');
      g23.addColor(simParams, 'rainColor').onChange(updateCanvas);
      g23.add(simParams, 'rainOpacity').min(0.0).max(30.0).step(0.1).onChange(updateCanvas);
      g23.add(simParams, 'rainCutoff').min(0.0).max(1.0).step(0.001).onChange(updateCanvas);
      g23.add(simParams, 'rainIOR').min(-0.1).max(0.1).step(0.001).onChange(updateCanvas);
      var g24 = g2.addFolder('Humidity');
      g24.addColor(simParams, 'humidityColor').onChange(updateCanvas);
      g24.add(simParams, 'humidityOpacity').min(0.0).max(15.0).step(0.1).onChange(updateCanvas);
      g24.add(simParams, 'humidityCutoff').min(0.0).max(1.0).step(0.001).onChange(updateCanvas);
      g24.add(simParams, 'humidityIOR').min(-0.1).max(0.1).step(0.001).onChange(updateCanvas);
      var g25 = g2.addFolder('Temperature');
      g25.addColor(simParams, 'temperatureColor').onChange(updateCanvas);
      g25.add(simParams, 'temperatureOpacity').min(0.0).max(15.0).step(0.1).onChange(updateCanvas);
      g25.add(simParams, 'temperatureCutoff').min(0.0).max(1.0).step(0.001).onChange(updateCanvas);
      g25.add(simParams, 'temperatureIOR').min(-0.1).max(0.1).step(0.001).onChange(updateCanvas);
      var g26 = g2.addFolder('Humidity Temperature');
      g26.addColor(simParams, 'humidityTemperatureColor').onChange(updateCanvas);
      g26.add(simParams, 'humidityTemperatureOpacity').min(0.0).max(15.0).step(0.01).onChange(updateCanvas);
      g26.add(simParams, 'humidityTemperatureCutoff').min(0.0).max(1.0).step(0.001).onChange(updateCanvas);
      g26.add(simParams, 'humidityTemperatureIOR').min(-0.1).max(0.1).step(0.001).onChange(updateCanvas);
      var g27 = g2.addFolder('Relative Temperature');
      g27.addColor(simParams, 'relativeTemperatureColor').onChange(updateCanvas);
      g27.add(simParams, 'relativeTemperatureOpacity').min(0.0).max(15.0).step(0.01).onChange(updateCanvas);
      g27.add(simParams, 'relativeTemperatureCutoff').min(0.0).max(1.0).step(0.001).onChange(updateCanvas);
      g27.add(simParams, 'relativeTemperatureIOR').min(-0.1).max(0.1).step(0.001).onChange(updateCanvas);
      var g28 = g2.addFolder('Updraft Temperature');
      g28.addColor(simParams, 'updraftTemperatureColor').onChange(updateCanvas);
      g28.add(simParams, 'updraftTemperatureOpacity').min(0.0).max(15.0).step(0.01).onChange(updateCanvas);
      g28.add(simParams, 'updraftTemperatureCutoff').min(0.0).max(1.0).step(0.001).onChange(updateCanvas);
      g28.add(simParams, 'updraftTemperatureIOR').min(-0.1).max(0.1).step(0.001).onChange(updateCanvas);


      // CONTROLS
      gui.add(simParams, 'runSimulation');
      gui.add(simParams, 'stopSimulation');
      gui.add(simParams, 'stepSimulation');

      gui.add(simParams, 'basefluid').listen();
      gui.add(simParams, 'solutes').listen();
   }

   {
      var xhrPresets = new XMLHttpRequest();
      var checkIndexPresets = checkpoints.push(false);
      xhrPresets.open('GET', 'presets.json', true);
      xhrPresets.onload = function(e) {
         if (this.status == 200) {
            initGUI(JSON.parse(xhrPresets.response));

            // Start loading of default background texture
            var checkIndexImage = checkpoints.push(false);
            backgroundImage.onload = function () {
               sync(checkIndexImage);
            }
            backgroundImage.src = backgroundImageURLs[simParams.backgroundImage];

            sync(checkIndexPresets);
         }
      };
      xhrPresets.send(null);
   }


   function setFramebuffer(fbo) {
      var width;
      var height;

      if (fbo == null) {
         width = gl.canvas.width;
         height = gl.canvas.height;
      } else {
         width = simParams.resolution;
         height = simParams.resolution;
      }

      // make this the framebuffer we are rendering to.
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

      // Tell webgl the viewport setting needed for framebuffer.
      gl.viewport(0, 0, parseFloat(width), parseFloat(height));
   }

   var baseSrc = 0;
   var baseDst = 1;
   var solutesSrc = 0;
   var solutesDst = 1;
   function swapSolutes() { solutesSrc = (solutesSrc == 0) ? 1 : 0; solutesDst = (solutesDst == 0) ? 1 : 0; }
   function swapBase() { baseSrc = (baseSrc == 0) ? 1 : 0; baseDst = (baseDst == 0) ? 1 : 0; }

   function doCalcFunction(framebuffer, calcFunction) {
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
      gl.useProgram(solver.program);

      // set which texture units to render with.
      gl.uniform1i(solver.u_basefluidLocation, 0);  // texture unit 0
      gl.uniform1i(solver.u_solutesLocation, 1);  // texture unit 1
      gl.uniform1i(solver.u_groundLocation, 2);  // texture unit 2

      // bind the input basefluidTexture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, solver.basefluidTextures[baseSrc]);

      // bind the input solutesTexture
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, solver.solutesTextures[solutesSrc]);

      gl.activeTexture(gl.TEXTURE2);
      groundDataToTexture();

      // set the framebuffer (null for rendering to canvas)
      setFramebuffer(framebuffer);

      // Tell the shader the resolution of the framebuffer.
      gl.uniform1f(solver.resolutionUniformLocation, simParams.resolution);

/*      if (framebuffer==null) {
         // Clear the canvas
         gl.clearColor(
            simParams.backgroundColor[0] / 256.0, 
            simParams.backgroundColor[1] / 256.0, 
            simParams.backgroundColor[2] / 256.0, 
            simParams.backgroundColor[3]);
         gl.clear(gl.COLOR_BUFFER_BIT);
      }
*/
      // VERTEX
      // Turn on the attribute
      gl.enableVertexAttribArray(solver.positionAttributeLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, solver.positionBuffer);

      // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(solver.positionAttributeLocation, size, type, normalize, stride, offset)

      // TEXTURE COORDINATE
      // Turn on the attribute
      gl.enableVertexAttribArray(solver.texCoordAttributeLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, solver.texCoordBuffer);

      // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(solver.texCoordAttributeLocation, size, type, normalize, stride, offset)


      gl.uniform1i(solver.calcFunctionUniformLocation, calcFunction);
      gl.uniform1f(solver.diffusionUniformLocation, simParams.diffusion);

      // Buoyancy
      gl.uniform1f(solver.buoyancyFactorUniformLocation, simParams.buoyancyFactor);
      gl.uniform1f(solver.rainFallingFactorUniformLocation, simParams.rainFallingFactor);

      // Stability uniforms
      gl.uniform1f(solver.globalWindUniformLocation, simParams.globalWind);
      gl.uniform1f(solver.globalStabilityUniformLocation, simParams.globalStability);
      gl.uniform1f(solver.inversionAltitudeUniformLocation, simParams.inversionAltitude);
      gl.uniform1f(solver.inversionTemperatureUniformLocation, simParams.inversionTemperature);
      gl.uniform1f(solver.groundInversionDepthUniformLocation, simParams.groundInversionDepth);
      gl.uniform1f(solver.groundInversionTemperatureUniformLocation, simParams.groundInversionTemperature);
      gl.uniform1f(solver.heatDisipationRateUniformLocation, simParams.heatDisipationRate);

      // Atmosphere uniforms
      gl.uniform1f(solver.temperatureDiffusionUniformLocation, simParams.temperatureDiffusion);
      gl.uniform1f(solver.humidityDiffusionUniformLocation, simParams.humidityDiffusion);
      gl.uniform1f(solver.condensationFactorUniformLocation, simParams.condensationFactor);
      gl.uniform1f(solver.mistDiffusionUniformLocation, simParams.mistDiffusion);
      gl.uniform1f(solver.mistToRainFactorUniformLocation, simParams.mistToRainFactor);
      gl.uniform1f(solver.rainFallDiffusionUniformLocation, simParams.rainFallDiffusion);
      gl.uniform1f(solver.rainEvaporationUniformLocation, simParams.rainEvaporation);
      gl.uniform1f(solver.initialHumidityUniformLocation, simParams.initialHumidity);
      gl.uniform1f(solver.condensationLevelUniformLocation, simParams.condensationLevel);
      gl.uniform1f(solver.latentHeatUniformLocation, simParams.latentHeat);

      // draw
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
   }


   function updateReaderGUI() {
      if (!isRunning) {
         // If not running, maunaly read the data
         var sloverGridCoords = getPointOnSolverGrid(readCoords);
         gl.bindFramebuffer(gl.FRAMEBUFFER, renderer.transferBasefluidFramebuffer);
         gl.readPixels(sloverGridCoords[0] * solverResolution, sloverGridCoords[1] * solverResolution, 1, 1, gl.RGBA, gl.FLOAT, readBasefluid);
         gl.bindFramebuffer(gl.FRAMEBUFFER, renderer.transferSolutesFramebuffer);
         gl.readPixels(sloverGridCoords[0] * solverResolution, sloverGridCoords[1] * solverResolution, 1, 1, gl.RGBA, gl.FLOAT, readSolutes);
      }

      simParams.basefluid =
         ' vx: ' + readBasefluid[0].toFixed(2) +
         ', vy: ' + readBasefluid[1].toFixed(2) +
         ', t: ' + readSolutes[0].toFixed(3);
      simParams.solutes = 
         ' h: ' + readSolutes[2].toFixed(3) +
         ', m: ' + readSolutes[3].toFixed(3) +
         ', r: ' + readSolutes[1].toFixed(3);
   }


   function doRender() {
      var sloverGridCoords = getPointOnSolverGrid(readCoords);

      doCalcFunction(renderer.transferBasefluidFramebuffer, 0); // 0 - COPY basefluid
      gl.readPixels(sloverGridCoords[0] * solverResolution, sloverGridCoords[1] * solverResolution, 1, 1, gl.RGBA, gl.FLOAT, readBasefluid);
      
      doCalcFunction(renderer.transferSolutesFramebuffer, 1); // 1 - COPY solutes
      gl.readPixels(sloverGridCoords[0] * solverResolution, sloverGridCoords[1] * solverResolution, 1, 1, gl.RGBA, gl.FLOAT, readSolutes);

      updateReaderGUI();

      // Tell it to use our renderer program (pair of shaders)
      gl.useProgram(renderer.program);

      // set which texture units to render with.
      gl.uniform1i(renderer.u_basefluidLocation, 0);  // texture unit 0
      gl.uniform1i(renderer.u_solutesLocation, 1);  // texture unit 1
      gl.uniform1i(renderer.u_backgroundLocation, 2);  // texture unit 1

      // bind the input basefluidTexture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, renderer.transferBasefluidTexture);

      // bind the input solutesTexture
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, renderer.transferSolutesTexture);

      // bind the input backgro
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, renderer.backgroundImageTexture);

      // set the framebuffer (null for rendering to canvas)
      setFramebuffer(null);

      // Tell the shader the resolution of the framebuffer.
      gl.uniform2f(renderer.resolutionUniformLocation, simParams.resolution, simParams.resolution);

      // VERTEX
      // Turn on the attribute
      gl.enableVertexAttribArray(renderer.positionAttributeLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, renderer.positionBuffer);
      gl.vertexAttribPointer(renderer.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

      // TEXTURE COORDINATE
      // Turn on the attribute
      gl.enableVertexAttribArray(renderer.texCoordAttributeLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, renderer.texCoordBuffer);
      gl.vertexAttribPointer(renderer.texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0)

      // BACKGROUND TEXTURE COORDINATE
      // Turn on the attribute
      gl.enableVertexAttribArray(renderer.bgTexCoordAttributeLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, renderer.bgTexCoordBuffer);
      gl.vertexAttribPointer(renderer.bgTexCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0)

      // Display uniforms
      gl.uniform3f(renderer.backgroundImageTintUniformLocation, simParams.backgroundImageTint[0] / 256.0, simParams.backgroundImageTint[1] / 256.0, simParams.backgroundImageTint[2] / 256.0);
      gl.uniform1f(renderer.backgroundImageBrightnessUniformLocation, simParams.backgroundImageBrightness);

      gl.uniform3f(renderer.pressureColorUniformLocation, simParams.pressureColor[0] / 256.0, simParams.pressureColor[1] / 256.0, simParams.pressureColor[2] / 256.0);
      gl.uniform1f(renderer.pressureOpacityUniformLocation, simParams.pressureOpacity);
      gl.uniform1f(renderer.pressureCutoffUniformLocation, simParams.pressureCutoff);
      gl.uniform1f(renderer.pressureIORUniformLocation, simParams.pressureIOR);
      gl.uniform3f(renderer.updraftColorUniformLocation, simParams.updraftColor[0] / 256.0, simParams.updraftColor[1] / 256.0, simParams.updraftColor[2] / 256.0);
      gl.uniform1f(renderer.updraftOpacityUniformLocation, simParams.updraftOpacity);
      gl.uniform1f(renderer.updraftCutoffUniformLocation, simParams.updraftCutoff);
      gl.uniform1f(renderer.updraftIORUniformLocation, simParams.updraftIOR);
      gl.uniform3f(renderer.cloudColorUniformLocation, simParams.cloudColor[0] / 256.0, simParams.cloudColor[1] / 256.0, simParams.cloudColor[2] / 256.0);
      gl.uniform1f(renderer.cloudOpacityUniformLocation, simParams.cloudOpacity);
      gl.uniform1f(renderer.cloudCutoffUniformLocation, simParams.cloudCutoff);
      gl.uniform1f(renderer.cloudIORUniformLocation, simParams.cloudIOR);
      gl.uniform3f(renderer.rainColorUniformLocation, simParams.rainColor[0] / 256.0, simParams.rainColor[1] / 256.0, simParams.rainColor[2] / 256.0);
      gl.uniform1f(renderer.rainOpacityUniformLocation, simParams.rainOpacity);
      gl.uniform1f(renderer.rainCutoffUniformLocation, simParams.rainCutoff);
      gl.uniform1f(renderer.rainIORUniformLocation, simParams.rainIOR);
      gl.uniform3f(renderer.humidityColorUniformLocation, simParams.humidityColor[0] / 256.0, simParams.humidityColor[1] / 256.0, simParams.humidityColor[2] / 256.0);
      gl.uniform1f(renderer.humidityOpacityUniformLocation, simParams.humidityOpacity);
      gl.uniform1f(renderer.humidityCutoffUniformLocation, simParams.humidityCutoff);
      gl.uniform1f(renderer.humidityIORUniformLocation, simParams.humidityIOR);
      gl.uniform3f(renderer.temperatureColorUniformLocation, simParams.temperatureColor[0] / 256.0, simParams.temperatureColor[1] / 256.0, simParams.temperatureColor[2] / 256.0);
      gl.uniform1f(renderer.temperatureOpacityUniformLocation, simParams.temperatureOpacity);
      gl.uniform1f(renderer.temperatureCutoffUniformLocation, simParams.temperatureCutoff);
      gl.uniform1f(renderer.temperatureIORUniformLocation, simParams.temperatureIOR);
      gl.uniform3f(renderer.humidityTemperatureColorUniformLocation, simParams.humidityTemperatureColor[0] / 256.0, simParams.humidityTemperatureColor[1] / 256.0, simParams.humidityTemperatureColor[2] / 256.0);
      gl.uniform1f(renderer.humidityTemperatureOpacityUniformLocation, simParams.humidityTemperatureOpacity);
      gl.uniform1f(renderer.humidityTemperatureCutoffUniformLocation, simParams.humidityTemperatureCutoff);
      gl.uniform1f(renderer.humidityTemperatureIORUniformLocation, simParams.humidityTemperatureIOR);
      gl.uniform3f(renderer.relativeTemperatureColorUniformLocation, simParams.relativeTemperatureColor[0] / 256.0, simParams.relativeTemperatureColor[1] / 256.0, simParams.relativeTemperatureColor[2] / 256.0);
      gl.uniform1f(renderer.relativeTemperatureOpacityUniformLocation, simParams.relativeTemperatureOpacity);
      gl.uniform1f(renderer.relativeTemperatureCutoffUniformLocation, simParams.relativeTemperatureCutoff);
      gl.uniform1f(renderer.relativeTemperatureIORUniformLocation, simParams.relativeTemperatureIOR);
      gl.uniform3f(renderer.updraftTemperatureColorUniformLocation, simParams.updraftTemperatureColor[0] / 256.0, simParams.updraftTemperatureColor[1] / 256.0, simParams.updraftTemperatureColor[2] / 256.0);
      gl.uniform1f(renderer.updraftTemperatureOpacityUniformLocation, simParams.updraftTemperatureOpacity);
      gl.uniform1f(renderer.updraftTemperatureCutoffUniformLocation, simParams.updraftTemperatureCutoff);
      gl.uniform1f(renderer.updraftTemperatureIORUniformLocation, simParams.updraftTemperatureIOR);

      // Stability uniforms
      gl.uniform1f(renderer.globalStabilityUniformLocation, simParams.globalStability);
      gl.uniform1f(renderer.inversionAltitudeUniformLocation, simParams.inversionAltitude);
      gl.uniform1f(renderer.inversionTemperatureUniformLocation, simParams.inversionTemperature);
      gl.uniform1f(renderer.groundInversionDepthUniformLocation, simParams.groundInversionDepth);
      gl.uniform1f(renderer.groundInversionTemperatureUniformLocation, simParams.groundInversionTemperature);

      // draw
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
   }

   var updateCanvas =function () {
      if (simParams.displayOutline)
         canvas.style.border = '1px  solid red';
      else
         canvas.style.border = 'none';
      if (!isRunning) {
         doRender(); // RENDER
      }
   }


   var project = function(srcIndex) {
      doCalcFunction(solver.basefluidFramebuffers[baseDst], 4); swapBase();
      for (var i=1; i<simParams.pressureSolveSteps; i+=1) {
         doCalcFunction(solver.basefluidFramebuffers[baseDst], 5); swapBase();
      }
      doCalcFunction(solver.basefluidFramebuffers[baseDst], 6); swapBase();
   }

   function setGroundData(x, temp, humidity) {
      groundData[x * 4 + 0] = temp;
      groundData[x * 4 + 2] = humidity;
   }

   stepSimulation = function() {
      setGroundData(2, 70, 0);
      setGroundData(3, 70, 10);
      setGroundData(4, 170, 10);
      setGroundData(5, 70, 10);
      setGroundData(8, 170, 10);
      setGroundData(9, 70, 0);
      setGroundData(12, 0, 50);
      setGroundData(13, 0, 50);

      doCalcFunction(solver.basefluidFramebuffers[baseDst], 9); swapBase(); // 9 - add forces
      doCalcFunction(solver.solutesFramebuffers[solutesDst], 10); swapSolutes(); // 10 - atmospherics
      doCalcFunction(solver.basefluidFramebuffers[baseDst], 2); swapBase(); // 2 - diffuse
      doCalcFunction(solver.solutesFramebuffers[solutesDst], 7); swapSolutes(); // 7 - diffuse solutes
      project();
      doCalcFunction(solver.basefluidFramebuffers[baseDst], 3); swapBase(); // 3 - advect
      doCalcFunction(solver.solutesFramebuffers[solutesDst], 8); swapSolutes(); // 8 - advect solutes
      project();

      doRender(); // RENDER

      if (isRunning)
         requestAnimationFrame(stepSimulation);
   }

   var solverResolution = 256.0;

   function resolutionChanged(value) {
      if (value != solverResolution) {
         initPrograms();
         solverResolution = value;
      }
   }



};
