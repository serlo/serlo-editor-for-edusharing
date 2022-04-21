# Educational Content Editor as a Service

## Endpoints

### /edit

Expects a POST request with the following JSON body:

```ts
interface EditProps {
  // The (JSON) state of the document. Falls back to an empty document if not provided.
  state?: { plugin: string; state?: unknown }
  // The endpoint that will be used when the user initiates a save.
  saveUrl: string
  // Arbitrary additional information that we should pass when the user iniates a save.
  savePayload?: unknown
}
```

When the user clicks "Save", we do a POST request to the specified `saveUrl` with the following JSON body:

```ts
interface SavePayload {
  // The (JSON) state of the document.
  state: { plugin: string; state?: unknown }
  // The additional information that was specified via `savePayload`.
  payload: unknown
}
```

### /render

Expects a POST request with the following JSON body:

```ts
interface RenderProps {
  // The (JSON) state of the document.
  state: { plugin: string; state?: unknown }
}
```

## Integration

- [Docker image](https://github.com/serlo/ece-as-a-service/pkgs/container/ece-as-a-service)
- [Vercel deployment](https://ece-as-a-service.vercel.app/edit)
