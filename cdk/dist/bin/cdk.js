#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_cdk_lib_1 = require("aws-cdk-lib");
const blog_stack_1 = require("../lib/blog-stack");
const app = new aws_cdk_lib_1.App();
new blog_stack_1.BlogStack(app, 'PersonalBlogStack');
