# Lehrerzugang

## Connect Cloudflare Pages to git repository

## Develop locally

Create a file ```.dev.vars```:
```
LOGIN=<LOGIN>
SCHULNUMMER=<SCHULNUMMER>
PASSWORD=<PASSWORD>
```

```
npm run cf-dev
```

## Deploy

Set the env variables from ```.dev.vars``` in the cloudflare dashboard. Make you select to encrypt these values.