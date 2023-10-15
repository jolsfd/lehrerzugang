# Lehrerzugang

## Description

This project is a cloudflare pages application. It enables you to see where a teacher teaches. No more clicking through timetables of endless classes that you don't care about. This functionality is achieved by a cloudflare worker that bypasses the cors functionality from the stundenplan24 api. Credentials like passwords, logins or ids are never exposed to the public.

## Quick Start

### Setup Cloudflare Pages

- create a [cloudflare](https://dash.cloudflare.com) account
- create a new pages application by naviagting to "Workers & Pages"
- connect your git repository to cloudflare pages application

### Local Development

```bash
# clone repository
git clone https://github.com/jolsfd/lehrerzugang.git
cd lehrerzugang

# install npm packages
npm install

# run local dev server
npm run cf-dev
```

- create a file ```.dev.vars``` and copy the following section with your data into the file **This is required!**
```
LOGIN=<YOUR_LOGIN>
SCHULNUMMER=<YOUR_SCHULNUMMER>
PASSWORD=<YOUR_PASSWORD>
```

### Deployment

- set the env variables from ```.dev.vars``` in the cloudflare dashboard. Be sure to encrpyt these values in the dashboard!
- cloudflare automatically builds your application when you push a commit to your repository

## Support

- report bugs, place feature requests or other things via github 👋

## Credits

- ❤️❤️ cloudflare