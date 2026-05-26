import { DataSource } from 'typeorm';
import { Task } from './models/Task';
import {Result} from "./models/Result";
import {Workflow} from "./models/Workflow";

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'data/database.sqlite',
    dropSchema: true, // Note: set to false in production
    entities: [Task, Result, Workflow],
    synchronize: true,
    logging: false,
});
