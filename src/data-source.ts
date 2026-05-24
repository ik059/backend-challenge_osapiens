import { DataSource } from 'typeorm';
import { Task } from './models/Task';
import {Result} from "./models/Result";
import {Workflow} from "./models/Workflow";

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'data/database.sqlite',
    dropSchema: true, //need to update when ready for production
    entities: [Task, Result, Workflow],
    synchronize: true,
    logging: false,
});
