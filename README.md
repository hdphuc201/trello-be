# Trello Clone

A backend service for a Trello-like application built with Node.js, Express, and MongoDB. Provides real-time collaboration, authentication, and board management features via REST APIs and WebSockets.

## 🚀 Features

- 📋 Kanban board management
- 🎯 Drag-and-drop card organization
- 👥 Real-time collaboration via Socket.io
- 🔐 User authentication (Google OAuth)
- 📤 File uploads to Cloudinary
- 📩 Email notification service via Brevo
- 📚 RESTful API structure
- 🛡 Secure routes & role-based access

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Socket.io
- JWT Authentication
- Google OAuth
- Cloudinary (File Storage)
- Brevo (Email Service)

## 📋 Prerequisites

- Node.js >= 18.x
- MongoDB
- Yarn package manager

## 🚀 Getting Started

1. Navigate to the backend directory:
```bash
cd trello-be
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
BREVO_API_KEY=your_brevo_api_key
```

4. Start the development server:
```bash
yarn dev
```

The backend will be available at `http://localhost:5000`

## 🏗️ Project Structure

```
trello-be/
├── src/             # Source code
│   ├── config/          
│   ├── modules/         
│   ├── middlewares/     
│   ├── sockets/         
│   ├── utils/           
│   ├── services/       
│   ├── constants/       
│   └── server.js
├── uploads/         # File upload directory
├── .env             # Environment variables
└── package.json     # Backend dependencies
```

## 🔧 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn production` - Run production build
- `yarn lint` - Run ESLint
- `yarn eslint` - Fix ESLint issues

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License – see the LICENSE file for details.

## 👥 Authors

- DuyPhucDev – Initial backend development
