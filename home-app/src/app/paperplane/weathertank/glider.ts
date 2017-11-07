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
import { WeathertankParams } from './sim-params';


const DEG_360 = 2.0 * Math.PI,
      DEG_270 = 1.5 * Math.PI,
      DEG_180 = Math.PI,
      DEG_90 = 0.5 * Math.PI;

declare var MDN: any;

// PAPER PLANE GLIDER
export class PaperplaneGlider {
    // Rendering
    private gl; any;
    private canvas: any;
    private simParams: WeathertankParams; 

    private program: any;
    public vertexShader: any;
    public fragmentShader: any;

    private positionAttributeLocation: any;
    private normalAttributeLocation: any;
    private paperplaneVerticesBuffer: any;

    private locationUniformLocation: any;
    private directionUniformLocation: any;

    private modelTranslationMatUniformLocation: any;
    private modelRotationMatUniformLocation: any;
    private perspectiveMatUniformLocation: any;

    private cloudColorUniformLocation: any;
    private cloudOpacityUniformLocation: any;
    private cloudCutoffUniformLocation: any;
    private cloudIORUniformLocation: any;
    private rainColorUniformLocation: any;
    private rainOpacityUniformLocation: any;
    private rainCutoffUniformLocation: any;
    private rainIORUniformLocation: any;
    private humidityColorUniformLocation: any;
    private humidityOpacityUniformLocation: any;
    private humidityCutoffUniformLocation: any;
    private humidityIORUniformLocation: any;

    private solutesUniformLocation: any;
    private wetnessUniformLocation: any;

    private modelTranslationMat: number[];
    private modelRotationMat: number[];

    private perspectiveMat: any;

    // Simulation
    public location: Float32Array;
    public direction: Float32Array;
    public heading: number;

    public funFactor: number;

    private sinkRate: number;
    private turnRate: number;
    private bankAngle: number;
    private pitchAngle: number;
    private wobblePhase: number;

    public vario: number;
    public wetness: number;

    private groundHeight: number;

    public basefluid: Float32Array;
    public solutes: Float32Array;

    //private isPaused: boolean;

    public turnRateMax: number;
    public dryingRate: number;
    public speed: number;
    public wobbleRate: number;

    private resetLocation(x, y) {
        this.location[0] = x;
        this.location[1] = y;
    }

    private isFlying: boolean;


    constructor() {
        // Rendering
        this.program = null;
        this.vertexShader = null;
        this.fragmentShader = null;

        this.positionAttributeLocation = null;
        this.normalAttributeLocation = null;
        this.paperplaneVerticesBuffer = null;

        this.locationUniformLocation = null;
        this.directionUniformLocation = null;

        this.modelTranslationMatUniformLocation = null;
        this.modelRotationMatUniformLocation = null;
        this.perspectiveMatUniformLocation = null;

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

        this.solutesUniformLocation = null;
        this.wetnessUniformLocation = null;

        this.modelTranslationMat = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        this.modelRotationMat = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

        // Simulation
        this.location = new Float32Array([0.5, 0.5, 0.0]);
        this.direction = new Float32Array(3);
        this.heading = 0.0;

        this.funFactor = 5.0;

        this.sinkRate = 0.07 * this.funFactor;
        this.turnRate = 0.0;
        this.bankAngle = 0.0;
        this.pitchAngle = 0.0;
        this.wobblePhase = 0.0;

        this.vario = -this.sinkRate;
        this.wetness = 0.0;

        this.groundHeight = 0.0;

        this.basefluid = new Float32Array(4);
        this.solutes = new Float32Array(4);

        //this.isPaused = true;

        this.turnRateMax = 0.01 * this.funFactor;
        this.dryingRate = 0.0001;
        this.speed = 0.5 * this.funFactor;
        this.wobbleRate = 0.2;


        this.turnRight = function() { this.turnRate = this.turnRateMax; }
        this.turnLeft = function() { this.turnRate = -this.turnRateMax; }
        this.turnStop = function() { this.turnRate = 0.0; }

        this.resetLocation = function(x, y) {
         this.location[0] = x;
         this.location[1] = y;
        }

        this.isFlying = true;
    }


    private turnRight() { this.turnRate = this.turnRateMax; }
    private turnLeft() { this.turnRate = -this.turnRateMax; }
    private turnStop() { this.turnRate = 0.0; }



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

    public initPaperplaneProgram(gl, canvas, simParams, groundHeight) {
        this.gl = gl;
        this.canvas = canvas;
        this.simParams = simParams;

        this.groundHeight = groundHeight;

        this.program = this.createProgram(this.vertexShader, this.fragmentShader);

        this.perspectiveMat = MDN.perspectiveMatrix(
            0.1 * DEG_90, // fieldOfViewInRadians
            this.canvas.width / this.canvas.height, // aspectRatio
            0.01, // near
            100.0 // far
        );

        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.normalAttributeLocation = this.gl.getAttribLocation(this.program, 'a_normal');

        this.paperplaneVerticesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.paperplaneVerticesBuffer);
        var paperplaneVertices = [
-0.09996557235717773, 0.19790717959403992, -0.09055982530117035, 0.02121148072183132, 0.5361764430999756, 0.8438394069671631,
1.2999999523162842, -5.68248026411311e-08, -9.814726809054264e-08, 0.02121148072183132, 0.5361764430999756, 0.8438394069671631,
0.8995165228843689, 0.17341434955596924, -0.1001209020614624, 0.02121148072183132, 0.5361764430999756, 0.8438394069671631,
-0.9999998807907104, 0.17341439425945282, -0.10012073069810867, -0.0, 0.9848077893257141, 0.17364820837974548,
-0.7000001668930054, 0.3122909963130951, -0.8877289891242981, -0.0, 0.9848077893257141, 0.17364820837974548,
-0.9999999403953552, 0.3122909963130951, -0.8877289891242981, -0.0, 0.9848077893257141, 0.17364820837974548,
-0.699999988079071, 0.31229105591773987, 0.8877291083335876, 2.456518899407456e-08, 0.9848077297210693, -0.17364811897277832,
0.8995163440704346, 0.1734144687652588, 0.10012083500623703, 2.456518899407456e-08, 0.9848077297210693, -0.17364811897277832,
-0.7000000476837158, 0.17341452836990356, 0.10012094676494598, 2.456518899407456e-08, 0.9848077297210693, -0.17364811897277832,
-0.9999998807907104, 0.17341454327106476, 0.10012096911668777, -4.3527411008881245e-08, 0.49999991059303284, -0.8660253882408142,
-0.7000000476837158, 3.059797393234476e-08, 5.2848534437544004e-08, -4.3527411008881245e-08, 0.49999991059303284, -0.8660253882408142,
-0.9999998807907104, 4.371138473402425e-08, 7.549789415861596e-08, -4.3527411008881245e-08, 0.49999991059303284, -0.8660253882408142,
0.8995165228843689, 0.17341434955596924, -0.1001209020614624, 8.723878863747814e-08, 0.4999999701976776, 0.866025447845459,
-0.7000000476837158, 3.059797393234476e-08, 5.2848534437544004e-08, 8.723878863747814e-08, 0.4999999701976776, 0.866025447845459,
1.2999999523162842, -5.68248026411311e-08, -9.814726809054264e-08, 8.723878863747814e-08, 0.4999999701976776, 0.866025447845459,
1.2999999523162842, -5.68248026411311e-08, -9.814726809054264e-08, 0.021211348474025726, 0.5361765027046204, -0.8438394069671631,
-0.09996555745601654, 0.19790717959403992, 0.09055984020233154, 0.021211348474025726, 0.5361765027046204, -0.8438394069671631,
0.8995163440704346, 0.1734144687652588, 0.10012083500623703, 0.021211348474025726, 0.5361765027046204, -0.8438394069671631,
-0.09996555745601654, 0.19790717959403992, 0.09055984020233154, -0.025488976389169693, -0.992059051990509, 0.12316243350505829,
0.8995163440704346, 0.1734144687652588, 0.10012083500623703, -0.025488976389169693, -0.992059051990509, 0.12316243350505829,
-0.699999988079071, 0.31229105591773987, 0.8877291083335876, -0.025488976389169693, -0.992059051990509, 0.12316243350505829,
-0.9999998807907104, 0.17341439425945282, -0.10012073069810867, 9.301992776045154e-08, 0.4999999403953552, 0.866025447845459,
-0.7000000476837158, 3.059797393234476e-08, 5.2848534437544004e-08, 9.301992776045154e-08, 0.4999999403953552, 0.866025447845459,
-0.7000000476837158, 0.17341437935829163, -0.10012075304985046, 9.301992776045154e-08, 0.4999999403953552, 0.866025447845459,
0.8995163440704346, 0.1734144687652588, 0.10012083500623703, 0.015631096437573433, 0.4818004071712494, -0.8761415481567383,
0.2999999523162842, 0.021000539883971214, 0.005610767286270857, 0.015631096437573433, 0.4818004071712494, -0.8761415481567383,
0.2999999523162842, 0.18654491007328033, 0.0966455414891243, 0.015631096437573433, 0.4818004071712494, -0.8761415481567383,
0.8995165228843689, 0.17341434955596924, -0.1001209020614624, -0.02548910118639469, -0.9920591115951538, -0.12316228449344635,
-0.09996557235717773, 0.19790717959403992, -0.09055982530117035, -0.02548910118639469, -0.9920591115951538, -0.12316228449344635,
-0.7000001668930054, 0.3122909963130951, -0.8877289891242981, -0.02548910118639469, -0.9920591115951538, -0.12316228449344635,
0.8995163440704346, 0.1734144687652588, 0.10012083500623703, -0.014723860658705235, -0.8226855993270874, -0.5683058500289917,
0.2999999523162842, 0.18654491007328033, 0.0966455414891243, -0.014723860658705235, -0.8226855993270874, -0.5683058500289917,
-0.09996555745601654, 0.19790717959403992, 0.09055984020233154, -0.014723860658705235, -0.8226855993270874, -0.5683058500289917,
0.8995163440704346, 0.1734144687652588, 0.10012083500623703, -4.070846415515916e-08, 0.4999999701976776, -0.866025447845459,
-0.7000000476837158, 3.059797393234476e-08, 5.2848534437544004e-08, -4.070846415515916e-08, 0.4999999701976776, -0.866025447845459,
-0.7000000476837158, 0.17341452836990356, 0.10012094676494598, -4.070846415515916e-08, 0.4999999701976776, -0.866025447845459,
-0.9999998807907104, 0.17341454327106476, 0.10012096911668777, 3.1053485116672164e-08, 0.9848077297210693, -0.17364811897277832,
-0.699999988079071, 0.31229105591773987, 0.8877291083335876, 3.1053485116672164e-08, 0.9848077297210693, -0.17364811897277832,
-0.7000000476837158, 0.17341452836990356, 0.10012094676494598, 3.1053485116672164e-08, 0.9848077297210693, -0.17364811897277832,
0.8995165228843689, 0.17341434955596924, -0.1001209020614624, -0.014723292551934719, -0.8226696252822876, 0.5683291554450989,
-0.09996557235717773, 0.19790717959403992, -0.09055982530117035, -0.014723292551934719, -0.8226696252822876, 0.5683291554450989,
0.2999999523162842, 0.18654479086399078, -0.0966455265879631, -0.014723292551934719, -0.8226696252822876, 0.5683291554450989,
0.2999999523162842, 0.021000539883971214, -0.0014001112431287766, 0.015944967046380043, 0.49863389134407043, 0.8666661381721497,
0.8995165228843689, 0.17341434955596924, -0.1001209020614624, 0.015944967046380043, 0.49863389134407043, 0.8666661381721497,
0.2999999523162842, 0.18654479086399078, -0.0966455265879631, 0.015944967046380043, 0.49863389134407043, 0.8666661381721497,
-0.7000000476837158, 0.17341437935829163, -0.10012075304985046, 3.452615615628929e-08, 0.9848077893257141, 0.17364822328090668,
0.8995165228843689, 0.17341434955596924, -0.1001209020614624, 3.452615615628929e-08, 0.9848077893257141, 0.17364822328090668,
-0.7000001668930054, 0.3122909963130951, -0.8877289891242981, 3.452615615628929e-08, 0.9848077893257141, 0.17364822328090668,
-0.9999998807907104, 0.17341439425945282, -0.10012073069810867, 6.185376122402886e-08, 0.9848077297210693, 0.17364820837974548,
-0.7000000476837158, 0.17341437935829163, -0.10012075304985046, 6.185376122402886e-08, 0.9848077297210693, 0.17364820837974548,
-0.7000001668930054, 0.3122909963130951, -0.8877289891242981, 6.185376122402886e-08, 0.9848077297210693, 0.17364820837974548,
-0.9999998807907104, 0.17341454327106476, 0.10012096911668777, -3.968867900994155e-08, 0.4999999403953552, -0.8660253882408142,
-0.7000000476837158, 0.17341452836990356, 0.10012094676494598, -3.968867900994155e-08, 0.4999999403953552, -0.8660253882408142,
-0.7000000476837158, 3.059797393234476e-08, 5.2848534437544004e-08, -3.968867900994155e-08, 0.4999999403953552, -0.8660253882408142,
0.8995165228843689, 0.17341434955596924, -0.1001209020614624, 8.999531786457737e-08, 0.4999999701976776, 0.866025447845459,
-0.7000000476837158, 0.17341437935829163, -0.10012075304985046, 8.999531786457737e-08, 0.4999999701976776, 0.866025447845459,
-0.7000000476837158, 3.059797393234476e-08, 5.2848534437544004e-08, 8.999531786457737e-08, 0.4999999701976776, 0.866025447845459,
-0.9999998807907104, 0.17341439425945282, -0.10012073069810867, 8.723880284833285e-08, 0.4999999403953552, 0.866025447845459,
-0.9999998807907104, 4.371138473402425e-08, 7.549789415861596e-08, 8.723880284833285e-08, 0.4999999403953552, 0.866025447845459,
-0.7000000476837158, 3.059797393234476e-08, 5.2848534437544004e-08, 8.723880284833285e-08, 0.4999999403953552, 0.866025447845459,
0.8995163440704346, 0.1734144687652588, 0.10012083500623703, 0.005887860897928476, 0.5101547837257385, -0.8600624799728394,
1.2999999523162842, -5.68248026411311e-08, -9.814726809054264e-08, 0.005887860897928476, 0.5101547837257385, -0.8600624799728394,
0.2999999523162842, 0.021000539883971214, 0.005610767286270857, 0.005887860897928476, 0.5101547837257385, -0.8600624799728394,
0.8995163440704346, 0.1734144687652588, 0.10012083500623703, -4.352740390345389e-08, 0.49999991059303284, -0.8660253882408142,
1.2999999523162842, -5.68248026411311e-08, -9.814726809054264e-08, -4.352740390345389e-08, 0.49999991059303284, -0.8660253882408142,
-0.7000000476837158, 3.059797393234476e-08, 5.2848534437544004e-08, -4.352740390345389e-08, 0.49999991059303284, -0.8660253882408142,
-0.9999998807907104, 0.17341454327106476, 0.10012096911668777, 0.0, 0.9848077297210693, -0.17364810407161713,
-0.9999998211860657, 0.31229105591773987, 0.8877291083335876, 0.0, 0.9848077297210693, -0.17364810407161713,
-0.699999988079071, 0.31229105591773987, 0.8877291083335876, 0.0, 0.9848077297210693, -0.17364810407161713,
0.2999999523162842, 0.021000539883971214, -0.0014001112431287766, 0.0096502136439085, 0.516598105430603, 0.8561736941337585,
1.2999999523162842, -5.68248026411311e-08, -9.814726809054264e-08, 0.0096502136439085, 0.516598105430603, 0.8561736941337585,
0.8995165228843689, 0.17341434955596924, -0.1001209020614624, 0.0096502136439085, 0.516598105430603, 0.8561736941337585,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(paperplaneVertices), this.gl.STATIC_DRAW);


        this.locationUniformLocation = this.gl.getUniformLocation(this.program, 'u_location');
        this.directionUniformLocation = this.gl.getUniformLocation(this.program, 'u_direction');

        this.modelTranslationMatUniformLocation = this.gl.getUniformLocation(this.program, 'u_modelTranslationMat');
        this.modelRotationMatUniformLocation = this.gl.getUniformLocation(this.program, 'u_modelRotationMat');
        this.perspectiveMatUniformLocation = this.gl.getUniformLocation(this.program, 'u_perspectiveMat');


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

        this.solutesUniformLocation = this.gl.getUniformLocation(this.program, 'u_solutes');
        this.wetnessUniformLocation = this.gl.getUniformLocation(this.program, 'u_wetness');
    }


    public stepSimulation(readCoords: Float32Array) {
     if (this.isFlying) { // If glider is in air

        var mouseVector = readCoords[0] - this.location[0];
        if (this.solutes[3] > 0.01) mouseVector = 1.0;

        if (mouseVector > 0.0) {
           if (this.heading < this.turnRateMax || this.heading > DEG_360 - this.turnRateMax)
              this.turnStop();
           else {
              if (this.turnRate == 0.0) {
                 if (this.bankAngle < -5.0 * this.turnRateMax)
                    this.turnRight();
                 else
                    this.turnLeft();
              }
              else {
                 if (this.heading > 0.0 && this.heading < DEG_90) this.turnLeft();
                 if (this.heading > DEG_270 && this.heading < DEG_360) this.turnRight();
              }
           }
        } else {
           if (this.heading > DEG_180 - this.turnRateMax && this.heading < DEG_180 + this.turnRateMax)
              this.turnStop();
           else {
              if (this.turnRate == 0.0) {
                 if (this.bankAngle > 5.0 * this.turnRateMax)
                    this.turnLeft();
                 else
                    this.turnRight();
              }
              else {
                 if (this.heading > DEG_90 && this.heading < DEG_180) this.turnRight();
                 if (this.heading > DEG_180 && this.heading < DEG_270) this.turnLeft();
              }
           }
        }

        var linearScale = [1.0 / this.canvas.width, 1.0 / this.canvas.height];

        this.heading = (this.heading + this.turnRate) % DEG_360;
        if (this.heading < 0.0) this.heading += DEG_360;

        var newVario = (-this.sinkRate - this.wetness + this.basefluid[1] * this.funFactor) * linearScale[1];

        this.direction[0] = Math.cos(this.heading);
        this.direction[1] = newVario - this.vario;
        this.direction[2] = Math.sin(this.heading);

        this.location[0] += (this.speed * this.direction[0] + this.basefluid[0] * this.funFactor) * linearScale[0];
        this.location[1] += newVario;

        this.vario = newVario;

        this.wetness += 0.05 * this.solutes[1];
        if (this.wetness > 0.0) this.wetness -= this.dryingRate;
        if (this.wetness < 0.0) this.wetness = 0.0;

        this.bankAngle += 0.03 * (-15.0 * this.turnRate - this.bankAngle);
        this.pitchAngle += 0.15 * (-400.0 * this.vario - this.pitchAngle);

        this.wobblePhase += this.wobbleRate;

        this.modelTranslationMat = MDN.translateMatrix(0.0, 0.0, -10.0 - 0.1 * this.direction[2]);
        this.modelRotationMat = MDN.multiplyArrayOfMatrices([
           MDN.rotateYMatrix(this.heading),
           MDN.rotateZMatrix(this.pitchAngle),
           MDN.rotateXMatrix(this.bankAngle + 0.15 * Math.sin(this.wobblePhase) / (1.0 + Math.abs(this.bankAngle))),
           ]);


        if (this.location[1] < this.groundHeight) 
           this.isFlying = false;

     }
    }


    public doRender() {
        this.gl.useProgram(this.program);

        // set the framebuffer (null for rendering to canvas)
        this.setFramebuffer(null);

        // Turn on the attribute
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.paperplaneVerticesBuffer);

        // VERTEX
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 3, this.gl.FLOAT, false, 24, 0);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);

        // NORMALS
        this.gl.vertexAttribPointer(this.normalAttributeLocation, 3, this.gl.FLOAT, true, 24, 12);
        this.gl.enableVertexAttribArray(this.normalAttributeLocation);

        this.gl.uniform3fv(this.locationUniformLocation, this.location);
        this.gl.uniform3fv(this.directionUniformLocation, this.direction);

        this.gl.uniformMatrix4fv(this.modelTranslationMatUniformLocation, false, this.modelTranslationMat);
        this.gl.uniformMatrix4fv(this.modelRotationMatUniformLocation, false, this.modelRotationMat);
        this.gl.uniformMatrix4fv(this.perspectiveMatUniformLocation, false, this.perspectiveMat);

        this.gl.uniform4fv(this.solutesUniformLocation, this.solutes);
        this.gl.uniform1f(this.wetnessUniformLocation, this.wetness * 7.0);

        // Display uniforms
        this.gl.uniform3f(this.cloudColorUniformLocation, this.simParams.cloudColor[0] / 256.0, this.simParams.cloudColor[1] / 256.0, this.simParams.cloudColor[2] / 256.0);
        this.gl.uniform1f(this.cloudOpacityUniformLocation, this.simParams.cloudOpacity);
        this.gl.uniform1f(this.cloudCutoffUniformLocation, this.simParams.cloudCutoff);
        this.gl.uniform1f(this.cloudIORUniformLocation, this.simParams.cloudIOR);
        this.gl.uniform3f(this.rainColorUniformLocation, this.simParams.rainColor[0] / 256.0, this.simParams.rainColor[1] / 256.0, this.simParams.rainColor[2] / 256.0);
        this.gl.uniform1f(this.rainOpacityUniformLocation, this.simParams.rainOpacity);
        this.gl.uniform1f(this.rainCutoffUniformLocation, this.simParams.rainCutoff);
        this.gl.uniform1f(this.rainIORUniformLocation, this.simParams.rainIOR);
        this.gl.uniform3f(this.humidityColorUniformLocation, this.simParams.humidityColor[0] / 256.0, this.simParams.humidityColor[1] / 256.0, this.simParams.humidityColor[2] / 256.0);
        this.gl.uniform1f(this.humidityOpacityUniformLocation, this.simParams.humidityOpacity);
        this.gl.uniform1f(this.humidityCutoffUniformLocation, this.simParams.humidityCutoff);
        this.gl.uniform1f(this.humidityIORUniformLocation, this.simParams.humidityIOR);

        // draw
        var primitiveType = this.gl.TRIANGLES,
            offset = 0,
            count = 72;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.SRC_ALPHA, this.gl.ONE);

        this.gl.drawArrays(primitiveType, offset, count);

        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.BLEND);

    }

}