# Blitz Static Site Generation

Helps generate a completely static site from a Craft CMS site that uses [Blitz](https://github.com/putyourlightson/craft-blitz) for caching.

## What it does

- Runs the build process for the site (Javascript, CSS, image optimization, etc)
- Clears the Blitz caches
- Refreshes a complete Blitz cache by crawling the entire site
- Copies the Blitz-generated static cache files into a new directory
- Copies all other public assets into the same directory
- Makes all URLs absolute.

## Requirements

This utility makes the following assumptions about your project:

- It's a Craft 3.x site using Blitz for caching
- Your Blitz cache path is `/web/cache/blitz`
- All assets (CSS, JS, images, etc) are served out of `/web/dist`
- Your site's build process is triggered with `NODE_ENV=production yarn build`
- Your site's base URL is defined as `APP_SITE_URL` in a `.env` file.

If any of the above are **not** true of your site, this probably won't work.

## Installation

```sh
# Clone this repo to wherever you want the code to live
cd ~/code
git clone git@github.com:cmalven/blitz-static.git

# Link this utility so its available globally
cd blitz-static
npm i
npm link
```
## Usage

```sh
# Go to the Craft project you'd like to make static
cd ~/code/my-craft-project

# Run the utility
blitz-static
```

## Deployment

You have a lot of simple options for deployment. I recommend either [Netlify](https://www.netlify.com) or [Surge](https://surge.sh) (in that order of preference).

### With Netlify

```sh
npx netlify-cli deploy --dir ./my-site.test --prod
```

### With Surge

```sh
npx surge ./my-site.test my-site.surge.sh
```