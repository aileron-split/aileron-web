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

// Simulation params
export class WeathertankParams {
    // Buoyancy
    public buoyancyFactor: number;
    public rainFallingFactor: number;

    public globalWind: number;
    public globalStability: number;
    public inversionAltitude: number;
    public inversionTemperature: number;
    public groundInversionDepth: number;
    public groundInversionTemperature: number;
    public heatDisipationRate: number;

    public temperatureDiffusion: number;
    public humidityDiffusion: number;
    public condensationFactor: number;
    public mistDiffusion: number;
    public mistToRainFactor: number;
    public rainFallDiffusion: number;
    public rainEvaporation: number;

    public initialHumidity: number;
    public condensationLevel: number;
    public latentHeat: number;


    // Solver Settings
    public stepSize: number;
    public resolution: number;
    public pressureSolveSteps: number;
    public diffusion: number;

    // Display Options
    public displayOutline: boolean;

    public backgroundImage: number;
    public backgroundImageTint: number[];
    public backgroundImageBrightness: number;

    public pressureColor: number[];
    public pressureOpacity: number;
    public pressureCutoff: number;
    public pressureIOR: number;
    public updraftColor: number[];
    public updraftOpacity: number;
    public updraftCutoff: number;
    public updraftIOR: number;
    public cloudColor: number[];
    public cloudOpacity: number;
    public cloudCutoff: number;
    public cloudIOR: number;
    public rainColor: number[];
    public rainOpacity: number;
    public rainCutoff: number;
    public rainIOR: number;
    public humidityColor: number[];
    public humidityOpacity: number;
    public humidityCutoff: number;
    public humidityIOR: number;
    public temperatureColor: number[];
    public temperatureOpacity: number;
    public temperatureCutoff: number;
    public temperatureIOR: number;
    public humidityTemperatureColor: number[];
    public humidityTemperatureOpacity: number;
    public humidityTemperatureCutoff: number;
    public humidityTemperatureIOR: number;
    public relativeTemperatureColor: number[];
    public relativeTemperatureOpacity: number;
    public relativeTemperatureCutoff: number;
    public relativeTemperatureIOR: number;
    public updraftTemperatureColor: number[];
    public updraftTemperatureOpacity: number;
    public updraftTemperatureCutoff: number;
    public updraftTemperatureIOR: number;

    constructor() {
        // Default values
        
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

        this.backgroundImage = 0;
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
    }


}
