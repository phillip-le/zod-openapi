import { oas31 } from 'openapi3-ts';
import { AnyZodObject, ZodType } from 'zod';

import { ComponentsObject } from './components';
import { ZodOpenApiContentObject, ZodOpenApiMediaTypeObject } from './document';
import { createSchemaOrRef } from './schema';

const createMediaTypeSchema = (
  schemaObject:
    | AnyZodObject
    | oas31.SchemaObject
    | oas31.ReferenceObject
    | undefined,
  components: ComponentsObject,
): oas31.SchemaObject | oas31.ReferenceObject | undefined => {
  if (!schemaObject) {
    return undefined;
  }

  if (!(schemaObject instanceof ZodType)) {
    return schemaObject;
  }

  return createSchemaOrRef(schemaObject, components);
};

const createMediaTypeObject = (
  mediaTypeObject: ZodOpenApiMediaTypeObject | undefined,
  components: ComponentsObject,
): oas31.MediaTypeObject | undefined => {
  if (!mediaTypeObject) {
    return undefined;
  }

  return {
    ...mediaTypeObject,
    schema: createMediaTypeSchema(mediaTypeObject.schema, components),
  };
};

export const createContent = (
  contentObject: ZodOpenApiContentObject,
  components: ComponentsObject,
): oas31.ContentObject =>
  Object.entries(contentObject).reduce<oas31.ContentObject>(
    (acc, [path, zodOpenApiMediaTypeObject]): oas31.ContentObject => {
      const mediaTypeObject = createMediaTypeObject(
        zodOpenApiMediaTypeObject,
        components,
      );

      if (mediaTypeObject) {
        acc[path] = mediaTypeObject;
      }
      return acc;
    },
    {},
  );
