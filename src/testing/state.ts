import { getDefaultComponents } from '../create/components';
import { ZodOpenApiComponentsObject } from '../create/document';
import { SchemaState } from '../create/schema';

export const createOutputState = (
  componentsObject?: ZodOpenApiComponentsObject,
): SchemaState => ({
  components: getDefaultComponents(componentsObject),
  type: 'output',
});

export const createInputState = (): SchemaState => ({
  components: getDefaultComponents(),
  type: 'input',
});

export const createOutputOpenapi3State = (): SchemaState => ({
  components: { ...getDefaultComponents(), openapi: '3.0.0' },
  type: 'output',
});
