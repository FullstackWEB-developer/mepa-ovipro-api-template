#!/usr/bin/env node
import 'source-map-support/register';
import { Project } from '@alma-cdk/project';
import { Environment } from '../lib/environment';
import projectProps from './config';

// new Project instead of new App
const project = new Project(projectProps);

new Environment(project);
