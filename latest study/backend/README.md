# StudyBuddy Backend

The backend server for the StudyBuddy application, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Study plan management
- Analytics tracking
- Feedback system
- Real-time updates

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO (for real-time features)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studybuddy/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory and add the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studybuddy
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

## API Documentation

### Authentication

#### POST /api/auth/register
Register a new user.

Request body:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "student" | "teacher"
}
```

#### POST /api/auth/login
Login user.

Request body:
```json
{
  "email": "string",
  "password": "string"
}
```

### Study Plans

#### GET /api/study-plans
Get all study plans for the authenticated user.

#### POST /api/study-plans
Create a new study plan.

Request body:
```json
{
  "title": "string",
  "description": "string",
  "subjects": [
    {
      "name": "string",
      "topics": [
        {
          "name": "string",
          "status": "not_started" | "in_progress" | "completed"
        }
      ]
    }
  ],
  "goals": ["string"]
}
```

#### GET /api/study-plans/:id
Get a specific study plan.

#### PUT /api/study-plans/:id
Update a study plan.

#### DELETE /api/study-plans/:id
Delete a study plan.

### Analytics

#### GET /api/analytics/:id
Get analytics for a specific study plan.

#### POST /api/analytics/:id/session
Update study session data.

Request body:
```json
{
  "duration": number,
  "subject": "string",
  "topic": "string",
  "engagement": number,
  "notes": "string"
}
```

#### GET /api/analytics/:id/insights
Get study insights for a specific study plan.

### Feedback

#### GET /api/feedback/:id
Get all feedback for a study plan.

#### POST /api/feedback/:id
Add feedback to a study plan.

Request body:
```json
{
  "content": "string",
  "type": "suggestion" | "question" | "comment"
}
```

#### PUT /api/feedback/:id/:feedbackId
Update feedback.

#### DELETE /api/feedback/:id/:feedbackId
Delete feedback.

#### GET /api/feedback/:id/stats
Get feedback statistics for a study plan.

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include a message field:
```json
{
  "message": "Error message"
}
```

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project uses ESLint for code linting. Run:
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 