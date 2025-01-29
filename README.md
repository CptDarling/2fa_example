# 2FA Example

## Install
```sh
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

## Database

This project is using [MongoDB](https://www.mongodb.com/?msockid=09675b29a60168a402d0494ea76269e3).
