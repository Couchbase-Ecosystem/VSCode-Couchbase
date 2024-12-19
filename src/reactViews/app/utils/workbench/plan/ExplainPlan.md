# Legacy Workbench Visual Explain Plan

> Note: the code in this folder does not conform to our coding standards and should **not** be used as an example of how to write code within `cmd/cp-ui-v2`

The code in this folder is ported directly from `cmd/cp-ui`, and the code there was originally ported from ns_server.

## Challenges

Updating this code is challenging as it relys on outdated versions of [d3js](https://d3js.org/) and there are breaking changes in newer versions.

## Overview of existing code

The following four functions are the core of what makes the visual explain plan work. Everything else in this folder are just internals of these four functions.

### analyzePlan

This is used to walk the plan tree and determine things like total execution time, and fields used in the query. This is the first step in building the visual explain plan.

### convertN1QLPlanToPlanNodes

This takes the explain plan tree and results of analyzePlan to create a tree of nodes that we want to render with d3. The root of the tree is the last item in the query execution plan. So with a execution plan like `step 1 -> step 2 -> step 3`, "step 3" becomes the root of the tree returned by convertN1QLPlanToPlanNodes.

### makeSimpleTreeFromPlanNodes

This takes the plan node tree from convertN1QLPlanToPlanNodes and turns it into a tree that is easier to use with d3.

### makeD3TreeFromSimpleTree

This is where we actually draw svgs. Refactoring/replacing this function is the bulk of the work needed to update to the latest version of d3, or replace d3 with a different tool.

## n1ql.ts

This is a parser for n1ql queries and is the largest part of the port of the visual explain plan code. This is likely something we can move into cp-api at some point in the future. The parser is used to get information about the query such as fields and buckets being queried.

## Updates to code after porting

### compact mode

A new option has been added to the `PlanOptions`. A boolean of `compact`. This determines is we render the tree as boxes with details, or simple dots.

### PlanConfig `config.ts`

A PlanConfig type has also been added to contain some global configuration values. As we add any functionality to the visual explain plan (such as compact mode), we should begin moving values into the PlanConfig to allow us to easily change the output from a centralized place.
