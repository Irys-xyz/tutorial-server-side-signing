# Bundlr Server Side Signing

A sample repository showing how to use Bundlr's Server-Side Signing feature, which is detailed here
https://docs.bundlr.network/recipes/server-side-signing

Server-side signing is a method to allow you to sign (and pay) for your users' data securely (without exposing your private key).

Server-side signing works in 4 main steps:

1. The client requests the required information from the server (mainly public key).
2. The client transfers the minimum amount of data required for signing (known as the signature info) to a server (which has access to the private key).
3. The server then signs this data and returns the resulting signature to the client.
4. The client then inserts this signature into their data, resulting in a signed transaction identical to if the client had access to the private key.

## Overview

This project uses NextJS along with Tailwind for styling. It allows users to upload an image through a simple web form, the upload is then passed on to a series of 3 API routes that handle signing, funding and uploading. The process of using Bundlr and paying for uploads is fully hidden from the end user.

## .env

If you want to fork and run this repository, you will need to rename `.env.example` to `.env` and then add both the public and private keys for an account with sufficient funds to pay for uploads. These environment variables are used by the server API routes.

## Devnet vs Production

This project is configured to use the Bundlr Devnet, which means you can pay using tokens available for free from faucets.

To switch from Devnet to production, you'll need to:

1. Change Bundlr node address in index.tsx
2. Change BUNDLR_NODE_ADDRESS in the .env file
3. Change the RPC url in the .env file

## Changing Currency

To change the payment currency, update the RPC .env variable and [also the currency name](/sdk/using-other-currencies) in all places where a Bundlr or WebBundlr object is instantiated.

## Server Routes

There are three server routes called by our main `index.tsx` page.

1. `publicKey.ts`: Returns the public key for the server's wallet.
2. `signData.ts`: Signs the data provided using the server's private key.
3. `lazyFund.ts`: Funds the specified Bundlr node exactly enough to pay for the number of bytes passed in. If your dApp only does up-front funding, you can leave this out. If you want to support lazy-funding, simply pass in the number of bytes you plan to upload and this route will ensure sufficient funds are transferred to pay.
