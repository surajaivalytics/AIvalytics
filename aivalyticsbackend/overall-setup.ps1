# Overall Project Setup Script
Write-Host "🚀 Starting comprehensive project setup..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to check if directory exists
function Test-Directory($path) {
    return [bool](Test-Path -Path $path -PathType Container)
}

# Function to check if file exists
function Test-File($path) {
    return [bool](Test-Path -Path $path -PathType Leaf)
}

# Function to install Git if not present
function Install-Git {
    Write-Host "📥 Installing Git..." -ForegroundColor Yellow
    winget install --id Git.Git -e --source winget
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Function to install Node.js if not present
function Install-NodeJS {
    Write-Host "📥 Installing Node.js..." -ForegroundColor Yellow
    winget install --id OpenJS.NodeJS.LTS -e --source winget
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Function to create necessary directories
function Initialize-ProjectStructure {
    Write-Host "📁 Creating project structure..." -ForegroundColor Yellow
    
    # Create frontend directory if it doesn't exist
    if (-not (Test-Directory "frontend")) {
        New-Item -ItemType Directory -Path "frontend"
        Write-Host "Created frontend directory" -ForegroundColor Green
    }
    
    # Create backend directory if it doesn't exist
    if (-not (Test-Directory "backend")) {
        New-Item -ItemType Directory -Path "backend"
        Write-Host "Created backend directory" -ForegroundColor Green
    }
}

# Function to create frontend package.json if it doesn't exist
function Initialize-Frontend {
    Write-Host "📦 Setting up frontend..." -ForegroundColor Yellow
    
    if (-not (Test-File "frontend/package.json")) {
        $packageJson = @'
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
'@
        Set-Content -Path "frontend/package.json" -Value $packageJson
        Write-Host "Created frontend package.json" -ForegroundColor Green
    }
}

# Function to create backend package.json if it doesn't exist
function Initialize-Backend {
    Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
    
    if (-not (Test-File "backend/package.json")) {
        $packageJson = @'
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "build": "echo 'No build step required'",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "mongoose": "^7.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "eslint": "^8.47.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-plugin-import": "^2.28.1"
  }
}
'@
        Set-Content -Path "backend/package.json" -Value $packageJson
        Write-Host "Created backend package.json" -ForegroundColor Green
    }
}

# Function to create backend ESLint config
function Initialize-ESLint {
    Write-Host "⚙️ Setting up ESLint..." -ForegroundColor Yellow
    
    $eslintConfig = @'
{
  "env": {
    "node": true,
    "es2021": true,
    "jest": true
  },
  "extends": "airbnb-base",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-console": "off",
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true}],
    "linebreak-style": "off",
    "quotes": ["error", "double"],
    "comma-dangle": ["error", "always-multiline"],
    "class-methods-use-this": "off",
    "camelcase": "off",
    "no-plusplus": "off",
    "no-param-reassign": "off",
    "consistent-return": "off",
    "no-nested-ternary": "off",
    "max-len": ["error", { 
      "code": 200,
      "ignoreUrls": true,
      "ignoreStrings": true,
      "ignoreTemplateLiterals": true,
      "ignoreRegExpLiterals": true
    }],
    "no-unused-vars": ["warn", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^(HTTP_STATUS|ERROR_MESSAGES|SUCCESS_MESSAGES|ROLES|authorizeOwnerOrAdmin|next|columns|functionName|params|data|enrolledCourses|totalMaxScore|totalQuizAttempts)$",
      "args": "none"
    }],
    "no-restricted-syntax": "off",
    "no-await-in-loop": "off",
    "no-prototype-builtins": "off",
    "no-control-regex": "off",
    "default-param-last": "off",
    "default-case": "off",
    "no-shadow": "off",
    "radix": "off",
    "no-use-before-define": ["error", { 
      "functions": false,
      "classes": false,
      "variables": false
    }]
  }
}
'@
    Set-Content -Path "backend/.eslintrc.json" -Value $eslintConfig
    Write-Host "Created ESLint configuration" -ForegroundColor Green
}

# Function to create basic backend server file
function Initialize-BackendServer {
    Write-Host "⚙️ Setting up backend server..." -ForegroundColor Yellow
    
    # Create src directory if it doesn't exist
    if (-not (Test-Directory "backend/src")) {
        New-Item -ItemType Directory -Path "backend/src"
    }
    
    $serverContent = @'
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the backend server!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
'@
    Set-Content -Path "backend/src/server.js" -Value $serverContent
    Write-Host "Created basic backend server" -ForegroundColor Green
}

# Function to create .env file
function Initialize-EnvFile {
    Write-Host "⚙️ Setting up environment variables..." -ForegroundColor Yellow
    
    $envContent = @'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your_database
NODE_ENV=development
'@
    Set-Content -Path "backend/.env" -Value $envContent
    Write-Host "Created .env file" -ForegroundColor Green
}

# Function to set up Git hooks
function Initialize-GitHooks {
    Write-Host "⚙️ Setting up Git hooks..." -ForegroundColor Yellow
    
    # Create .git-hooks directory if it doesn't exist
    if (-not (Test-Directory ".git-hooks")) {
        New-Item -ItemType Directory -Path ".git-hooks"
    }
    
    # Create pre-push hook
    $prePushContent = @'
#!/bin/sh

echo "Running pre-push checks..."

# Function to check if a command succeeded
check_error() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

# Check frontend
echo "Checking frontend..."
cd frontend
npm install
check_error "Frontend dependencies installation failed"
CI=false npm run build
check_error "Frontend build failed"

# Check backend
echo "Checking backend..."
cd ../backend
npm install
check_error "Backend dependencies installation failed"

# Try to start the server and check if it starts without errors
echo "Checking if backend server starts without errors..."
NODE_ENV=test node src/server.js &
SERVER_PID=$!

# Wait for 5 seconds to see if server starts successfully
sleep 5

# Check if server process is still running
if ps -p $SERVER_PID > /dev/null; then
    echo "Backend server started successfully"
    kill $SERVER_PID
else
    echo "Backend server failed to start"
    exit 1
fi

echo "All checks passed! Proceeding with push..."
exit 0
'@
    Set-Content -Path ".git-hooks/pre-push" -Value $prePushContent
    
    # Create .git/hooks directory if it doesn't exist
    if (-not (Test-Directory ".git/hooks")) {
        New-Item -ItemType Directory -Path ".git/hooks" -Force
    }
    
    # Copy pre-push hook
    Copy-Item -Path ".git-hooks/pre-push" -Destination ".git/hooks/" -Force
    Write-Host "Git hooks configured" -ForegroundColor Green
}

# Main setup process
try {
    # Check and install Git if needed
    if (-not (Test-Command git)) {
        Write-Host "Git not found. Installing Git..." -ForegroundColor Yellow
        Install-Git
    }
    
    # Check and install Node.js if needed
    if (-not (Test-Command node)) {
        Write-Host "Node.js not found. Installing Node.js..." -ForegroundColor Yellow
        Install-NodeJS
    }
    
    # Configure Git
    Write-Host "⚙️ Configuring Git..." -ForegroundColor Yellow
    git config --global core.autocrlf true
    
    # Initialize project structure
    Initialize-ProjectStructure
    
    # Initialize frontend
    Initialize-Frontend
    
    # Initialize backend
    Initialize-Backend
    
    # Initialize ESLint
    Initialize-ESLint
    
    # Initialize backend server
    Initialize-BackendServer
    
    # Initialize environment variables
    Initialize-EnvFile
    
    # Initialize Git hooks
    Initialize-GitHooks
    
    # Install frontend dependencies
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location -Path "frontend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend dependencies installation failed"
    }
    
    # Install backend dependencies
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location -Path "../backend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Backend dependencies installation failed"
    }
    
    # Return to root directory
    Set-Location -Path ".."
    
    Write-Host "`n✅ Project setup completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Start the frontend: cd frontend && npm start" -ForegroundColor White
    Write-Host "2. Start the backend: cd backend && npm run dev" -ForegroundColor White
    Write-Host "`nThe project is now ready for development!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Error during setup: $_" -ForegroundColor Red
    exit 1
}

# Keep the window open
Read-Host "Press Enter to exit" 