# Education Platform - Authentication Backend

Enterprise-grade authentication system for educational platform with role-based access control.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Student, Teacher, HOD, and Principal roles
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation and sanitization
- **Logging**: Enterprise-grade logging with Winston
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable CORS policy
- **Health Checks**: Database and server health monitoring

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Supabase configuration
│   │   ├── logger.js    # Winston logging setup
│   │   └── constants.js # Application constants
│   ├── controllers/     # Route controllers
│   │   └── authController.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # Authentication middleware
│   │   └── validation.js # Input validation
│   ├── routes/          # Express routes
│   │   └── authRoutes.js
│   ├── services/        # Business logic
│   │   └── authService.js
│   ├── utils/           # Utility functions
│   │   ├── jwt.js       # JWT utilities
│   │   └── password.js  # Password utilities
│   └── server.js        # Main server file
├── package.json
└── env.example          # Environment variables template
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account and project
- PostgreSQL database (via Supabase)

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment template:

```bash
cp env.example .env
```

Configure your `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### 3. Database Setup

Ensure your Supabase database has the required schema (provided in the main project description).

### 4. Start the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/auth
```

### Public Endpoints

#### Health Check

```http
GET /api/auth/health
```

#### User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "rollNumber": "CS2024001",
  "role": "student",
  "age": 20,
  "classId": "uuid-of-class" // Optional for non-students
}
```

#### User Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "username": "john_doe"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer your_access_token
```

#### Verify Token

```http
GET /api/auth/verify
Authorization: Bearer your_access_token
```

#### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer your_access_token
```

#### Change Password

```http
POST /api/auth/change-password
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer your_access_token
```

### Role-Based Endpoints

#### Student Dashboard

```http
GET /api/auth/dashboard/student
Authorization: Bearer student_access_token
```

#### Teacher Dashboard

```http
GET /api/auth/dashboard/teacher
Authorization: Bearer teacher_access_token
```

#### HOD Dashboard

```http
GET /api/auth/dashboard/hod
Authorization: Bearer hod_access_token
```

#### Principal Dashboard

```http
GET /api/auth/dashboard/principal
Authorization: Bearer principal_access_token
```

#### Admin Panel (HOD & Principal)

```http
GET /api/auth/admin-panel
Authorization: Bearer admin_access_token
```

#### Get User by ID (HOD & Principal)

```http
GET /api/auth/users/:userId
Authorization: Bearer admin_access_token
```

## 🔐 Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

### Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes
- General endpoints: 100 requests per 15 minutes

### JWT Security

- Access tokens expire in 7 days (configurable)
- Refresh tokens expire in 30 days (configurable)
- Tokens include role verification
- Secure HTTP-only cookies for refresh tokens

### Role Hierarchy

1. **Student** (Level 1): Basic access
2. **Teacher** (Level 2): Can access teacher resources
3. **HOD** (Level 3): Can manage department, create students/teachers
4. **Principal** (Level 4): Full administrative access

## 🧪 Testing

### Manual Testing with cURL

Register a new user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_student",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!",
    "rollNumber": "TEST001",
    "role": "student",
    "age": 20
  }'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_student",
    "password": "TestPass123!"
  }'
```

Access protected endpoint:

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Testing with Postman

1. Import the API endpoints into Postman
2. Set up environment variables for tokens
3. Test the authentication flow
4. Verify role-based access control

## 📊 Monitoring and Logging

### Log Levels

- `error`: Error messages
- `warn`: Warning messages
- `info`: General information
- `http`: HTTP request logs
- `debug`: Debug information

### Log Files (Production)

- `logs/error.log`: Error logs only
- `logs/combined.log`: All logs

### Health Monitoring

```http
GET /health
```

Returns server status, database connectivity, and system information.

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
LOG_LEVEL=warn
```

### PM2 Configuration

```json
{
  "name": "education-auth-api",
  "script": "src/server.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔧 Development

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues

### Code Style

- ESLint with Airbnb configuration
- Consistent error handling
- Comprehensive logging
- Input validation and sanitization

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include comprehensive logging
4. Write tests for new features
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the logs for error details
2. Verify environment configuration
3. Test database connectivity
4. Review API documentation

## 🔄 Version History

- **v1.0.0**: Initial release with complete authentication system
  - User registration and login
  - Role-based access control
  - Password reset functionality
  - JWT token management
  - Enterprise-grade security features
