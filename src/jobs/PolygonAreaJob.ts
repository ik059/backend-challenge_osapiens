import { Job } from './Job';
import { Task } from '../models/Task';
import area from '@turf/area'

export class PolygonAreaJob implements Job {
    async run(task: Task): Promise<any> {
        try{
            const geoJson = JSON.parse(task.geoJson)
            const calculatedArea = area(geoJson)
            return {
                area: calculatedArea,
                unit: 'square meters'
            }; 
        }
        catch(error){
            throw new Error(`Invalid GeoJSON: ${error}`);
        }
    }
}