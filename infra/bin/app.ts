#!/usr/bin/env node
import 'source-map-support/register';
import { Project } from '@alma-cdk/project';
import { Aspects } from 'aws-cdk-lib';
import { Environment } from '../lib/environment';
import { LambdaLogGroupConfig } from '../lib/utils/log-group-aspect/LambdaLogGroupConfig';
import { ResourceRemovalPolicyTesterAspect } from '../lib/utils/policy-aspect/ResourceRemovalPolicyTesterAspect';
import projectProps from './config';

// new Project instead of new App
const project = new Project(projectProps);

new Environment(project);

// Aspects
const aspects = Aspects.of(project);
aspects.add(new LambdaLogGroupConfig());
aspects.add(new ResourceRemovalPolicyTesterAspect());
