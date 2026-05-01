# Docker (optional)

RoofVision does not require local Docker image generation. AI generation is handled by the backend provider configuration (see **[docs/IMAGE-GEN-API.md](../docs/IMAGE-GEN-API.md)**).

If you previously ran old image-generation containers, you can stop and remove them:

```bash
docker stop roofvision-sd 2>/dev/null; docker rm roofvision-sd 2>/dev/null
```
