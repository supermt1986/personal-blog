#!/usr/bin/env node
import 'aws-cdk/lib/util'
import { App } from 'aws-cdk-lib'
import { BlogStack } from '../lib/blog-stack'

const app = new App()
new BlogStack(app, 'PersonalBlogStack')