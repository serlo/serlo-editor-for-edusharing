# Educational Content Editor as a Service

## Starting Moodle

- `yarn moodle:start` starts a Moodle instance that can be used to test the LTI tool.
- `yarn moodle:stop` stops the Moodle instance.

## Starting the LTI Tool

- `yarn mongodb:start` starts the MongoDB server.
- `yarn dev` starts the Next.js server.

## Endpoints

We expose two POST endpoints.

### Editing documents: POST /edit

Expects a POST request with the following JSON body:

```ts
interface EditProps {
  // The (JSON) state of the document. Falls back to an empty document if not provided.
  state?: {
    version: number, 
    document: { plugin: string; state?: unknown }
  }
  // The endpoint that will be used when the user initiates a save.
  saveUrl: string
  // Arbitrary additional information that we should pass when the user iniates a save.
  // (e.g. user id, token, ...)
  savePayload?: unknown
}
```

When the user clicks "Save", we do a POST request to the specified `saveUrl` with the following JSON body:

```ts
interface SavePayload {
  // The (JSON) state of the document.
  state: {
    version: number,
    document: { plugin: string; state?: unknown }
  }
  // The additional information that was specified via `savePayload`.
  payload: unknown
}
```

### Rendering documents: POST /render

Expects a POST request with the following JSON body:

```ts
interface RenderProps {
  // The (JSON) state of the document.
  state: {
    version: number,
    document: { plugin: string; state?: unknown }
  }
}
```

## Integration

- [Docker image](https://github.com/serlo/ece-as-a-service/pkgs/container/ece-as-a-service)
