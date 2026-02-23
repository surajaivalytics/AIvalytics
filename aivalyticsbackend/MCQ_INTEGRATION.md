# MCQ Generator Integration with OpenAI GPT

## Overview

The MCQ Generator has been integrated with OpenAI GPT to provide intelligent multiple-choice question generation from uploaded course materials.

## Features

- **AI-Powered Generation**: Uses OpenAI GPT-4o-mini model for intelligent MCQ creation
- **File Support**: PDF, TXT files (PPTX/DOCX support coming soon)
- **Fallback System**: Mock MCQ generation when API key is not available
- **Role-Based Access**: Teachers, HOD, and Principal can generate MCQs
- **Course Filtering**: Teachers see only their courses, HOD/Principal see all courses

## Setup Instructions

### 1. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in with your OpenAI account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment

Create a `.env` file in the `backend` directory with:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_actual_openai_api_key_here

# Other existing environment variables...
NODE_ENV=development
PORT=5000
# ... etc
```

### 3. Install Dependencies

The following packages have been installed:

- `openai` - OpenAI API SDK
- `pdf-parse` - PDF text extraction

## API Endpoints

### Generate MCQ

- **POST** `/api/mcq/generate`
- **Auth**: Required (Teachers, HOD, Principal)
- **Body**: FormData with:
  - `course_id`: Course ID
  - `quiz_name`: Name for the quiz
  - `num_questions`: Number of questions (optional, default: 20)
  - `max_score`: Maximum score (optional, default: 100)
  - `file`: Uploaded file (PDF, TXT)

### Get Teacher Quizzes

- **GET** `/api/mcq/quizzes`
- **Auth**: Required (Teachers, HOD, Principal)
- **Query**: `page`, `limit`, `course_id`

### Delete Quiz

- **DELETE** `/api/mcq/quiz/:quiz_id`
- **Auth**: Required (Teachers, HOD, Principal)

## File Processing

- **PDF**: Full text extraction using `pdf-parse`
- **TXT**: Direct text reading
- **PPTX/DOCX**: Not yet supported (shows error message)
- **File Size Limit**: 10MB maximum

## AI Processing

1. **Content Extraction**: Text is extracted from uploaded files
2. **AI Prompt**: Structured prompt sent to GPT-4o-mini model
3. **Response Parsing**: JSON response parsed and validated
4. **Fallback**: Mock generation if AI fails or no API key

## Course Access Control

- **Teachers**: Can only see and create MCQs for their own courses
- **HOD/Principal**: Can see all courses and create MCQs for any course
- **Students**: Cannot access MCQ generation features

## Error Handling

- Invalid file types rejected
- File size limits enforced
- AI errors fall back to mock generation
- Database errors properly logged
- User-friendly error messages

## Mock Mode

When no OpenAI API key is provided, the system operates in mock mode:

- Generates sample MCQs based on content analysis
- Maintains same API structure
- Allows testing without API costs

## Usage in Frontend

The MCQ Generator component (`frontend/src/components/MCQGenerator.tsx`) provides:

- Drag-and-drop file upload
- Course selection dropdown (filtered by role)
- Quiz configuration options
- Real-time quiz listing
- Quiz management (view, delete)

## Security Features

- File type validation
- File size limits
- Role-based access control
- Authentication required for all endpoints
- Secure file handling with cleanup

## Future Enhancements

- PPTX/DOCX file support
- Question difficulty analysis
- Bulk quiz generation
- Quiz templates
- Student quiz-taking interface
