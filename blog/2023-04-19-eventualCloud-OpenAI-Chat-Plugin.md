---
title: eventualCloud Part 1 - Philosophy
description: Eventual Cloud Part 1 - Philosophy
slug: eventualCloud-OpenAI-ChatGPT-Plugin
authors:
  - name: Sam Sussman
    title: Co-creator of Eventual
    url: https://github.com/thantos
    image_url: https://avatars.githubusercontent.com/u/289213?v=4
tags: [eventual, cloud, ai, serverless, chatgpt, plugin, openai, openapi]
image: https://i.imgur.com/dVLQ8En.png
hide_table_of_contents: false
---

# Eventual Cloud + OpenAI Chat GPT Plugin

Eventual Cloud is the best way to build many different types of services. In this blog, we'll show how to build an OpenAI Chat Plugin.

Eventual Cloud provides a fully serverless framework for building plugins 

## Anatomy of a OpenAI Chat Plugin

An OpenAI Chat Plugin needs 3 things to operate (find all of the details [here](https://platform.openai.com/docs/plugins/getting-started)):

1. `/.well-known/ai-plugin.json` - The Plugin Manifest defines details about what the plugin is and how it operates. This must be at a public `/.well-known` url and will be used when registering and installing the plugin.
2. OpenAPI 3 Specification - [OpenAPI 3 Specification](https://swagger.io/specification/) is used to describe the REST APIs that are available and provide descriptions of the APIs, request, response, and fields involved in the API. This file should be public and hosted at the location described in `api.url` in the `ai-plugin.json` file.
3. Rest API - Finally the REST API described in the OpenAPI Specification must be available at the url in the OpenAPI `servers` array.

## Getting Started

This blog will start an OpenAI Plugin from scratch. There is a complete version in [eventual-examples](https://github.com/functionless/eventual-examples/tree/main/examples/open-ai-chat-plugin).

1. Create an EventualCloud project.
2. Create the ai-plugin endpoint
3. Create the OpenAPI Spec
4. Create our plugin operations
5. Describe the operations for Open AI
6. Test the Plugin Locally with Lang Chain
7. Test the Plugin locally with ChatGPT
8. Deploy the Plugin

### Create An Eventual Cloud Project
