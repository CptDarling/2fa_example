# 2FA Example

## Install
```sh
  cd 2fa-example
  npm install
```

## Run

```sh
npm run dev
```

## Usage

You can now use tools like Postman to generate secrets and verify tokens using the endpoints:

- **POST /generate-secret** with body `{ "username": "user1" }`
- **POST /verify** with body `{ "username": "user1", "token": "123456"}`

This is a simple starting point. In a real-world application, you'll need to store user data securely, possibly in a database, and implement additional error handling and security measures.
