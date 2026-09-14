# AWS deployment preparation

The current prototype is local-first and uses deterministic dummy data. The simplest AWS target for the current build is a static web deployment behind CloudFront:

1. Build the app with the project build command and confirm the generated client output.
2. Publish the static client assets to an S3 bucket with public access blocked.
3. Serve the bucket through a CloudFront distribution with HTTPS and SPA fallback routing.
4. Store the custom domain in Route 53 and the TLS certificate in ACM.
5. Move forecast and equipment data into an API-backed service (API Gateway/Lambda or ECS) before production use.
6. Move durable approvals, purchase orders, work orders, and user access into a database and identity provider.

Before deployment, confirm the target domain, AWS account/region, authentication provider, data retention policy, and whether the production app needs server-side APIs. No AWS resources are created by this preparation file.
