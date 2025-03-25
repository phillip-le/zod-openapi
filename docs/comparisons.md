## Comparisons

### [@asteasolutions/zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi)

zod-openapi was created while trying to add a feature to support auto-registering schemas to zod-to-openapi. This proved to be extra challenging given the overall structure of the library, so I decided to rewrite the whole thing. I was a big contributor to this library and love everything it's done; however, I could not overlook a few issues:

1. **Inaccurate** schema generation: This is because the library is written without considering that Zod Types can produce different schemas depending on if they are an `input` or `output` type. This means that when you use a `ZodTransform`, `ZodPipeline`, or `ZodDefault`, it may generate incorrect documentation depending on whether you are creating a schema for a request or a response.

2. **No input/output validation on components**: Registered schema for inputs and outputs should **NOT** be used if they contain a ZodEffect such as `ZodTransform`, `ZodPipeline`, or `ZodDefault` in both request and response schemas. This is because they will be inaccurate for the reasons stated above.

3. **No transform support or safety**: You can use a `type` to override the transform type, but what happens when that transform logic changes? We solve this by introducing `effectType`.

4. **No lazy/recursive schema support**.

5. **Wider and richer generation of OpenAPI types for Zod Types.**

6. The underlying structure of the library consists of tightly coupled classes, which require you to create an awkward Registry class to create references. This would mean you need to ship a registry class instance along with your types, making sharing types difficult.

7. Previously, zod-to-openapi did not support auto-registering schemas; however, more recently they added a solution which is less clear as they are using named parameters:
   ```ts
   z.string().openapi('foo');
   z.string().openapi('foo', { description: 'foo' });
   // vs

   z.string().openapi({ ref: 'foo' });
   z.string().openapi({ description: 'foo', ref: 'foo' });
   ```
8. None of the large number of [issues](https://github.com/asteasolutions/zod-to-openapi/issues), [known issues](https://github.com/asteasolutions/zod-to-openapi#known-issues), or discussion threads apply to this library.

Did I really rewrite an entire library just for this? Absolutely. I believe that creating documentation and types should be as simple and frictionless as possible.

---

#### Migration

1. Delete the OpenAPIRegistry and OpenAPIGenerator classes.
2. Replace any `.register()` call with `ref` in `.openapi()`, or alternatively, add them directly to the components section of the schema.
   ```ts
   const registry = new OpenAPIRegistry();

   const foo = registry.register(
     'foo',
     z.string().openapi({ description: 'foo' }),
   );
   const bar = z.object({ foo });

   // Replace with:
   const foo = z.string().openapi({ ref: 'foo', description: 'foo' });
   const bar = z.object({ foo });

   // or
   const foo = z.string().openapi({ description: 'foo' });
   const bar = z.object({ foo });

   const document = createDocument({
     components: {
       schemas: {
         foo,
       },
     },
   });
   ```
3. Replace `registry.registerComponent()` with a regular OpenAPI component in the document.

   ```ts
   const registry = new OpenAPIRegistry();

   registry.registerComponent('securitySchemes', 'auth', {
     type: 'http',
     scheme: 'bearer',
     bearerFormat: 'JWT',
     description: 'An auth token issued by oauth',
   });
   // Replace with regular component declaration

   const document = createDocument({
     components: {
       // declare directly in components
       securitySchemes: {
         auth: {
           type: 'http',
           scheme: 'bearer',
           bearerFormat: 'JWT',
           description: 'An auth token issued by oauth',
         },
       },
     },
   });
   ```
4. Replace `registry.registerPath()` with regular OpenAPI paths in the document.

   ```ts
   const registry = new OpenAPIRegistry();

   registry.registerPath({
     method: 'get',
     path: '/foo',
     request: {
       query: z.object({ a: z.string() }),
       params: z.object({ b: z.string() }),
       body: z.object({ c: z.string() }),
       headers: z.object({ d: z.string() })
     },
     responses: {},
   });
   // Replace with regular path declaration

   const getFoo: ZodOpenApiPathItemObject = {
     get: {
       requestParams: {
         query: z.object({ a: z.string() }),
         path: z.object({ b: z.string() }), // params -> path
         header: z.object({ d: z.string() }) // headers -> header
       }, // renamed from request -> requestParams
       requestBody: z.object({ c: z.string() }), // request.body -> requestBody
       responses: {},
     },
   };

   const document = createDocument({
     paths: {
       '/foo': getFoo,
     },
   });
   ```


