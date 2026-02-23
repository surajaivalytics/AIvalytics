# Setup Project Script
Write-Host "🚀 Starting project setup..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to check if directory exists
function Test-Directory($path) {
    return [bool](Test-Path -Path $path -PathType Container)
}

# Check for Git
if (-not (Test-Command git)) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check for Node.js
if (-not (Test-Command node)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if we're in the correct directory
if (-not (Test-Directory "frontend") -or -not (Test-Directory "backend")) {
    Write-Host "❌ Please run this script from the root directory of the project (where frontend and backend folders are located)" -ForegroundColor Red
    exit 1
}

# Store the current directory
$rootDir = Get-Location

# Configure Git
Write-Host "⚙️ Configuring Git..." -ForegroundColor Yellow
git config --global core.autocrlf true

# Create .git-hooks directory if it doesn't exist
if (-not (Test-Path ".git-hooks")) {
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
if (-not (Test-Path ".git/hooks")) {
    New-Item -ItemType Directory -Path ".git/hooks" -Force
}

# Copy pre-push hook
Copy-Item -Path ".git-hooks/pre-push" -Destination ".git/hooks/" -Force

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location -Path "$rootDir/frontend"
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found in frontend directory" -ForegroundColor Red
    exit 1
}
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependencies installation failed" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -Path "$rootDir/backend"
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found in backend directory" -ForegroundColor Red
    exit 1
}
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependencies installation failed" -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location -Path $rootDir

# Create ESLint config for backend
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

Write-Host "✅ Project setup completed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. The pre-push hook is now configured" -ForegroundColor White
Write-Host "2. Frontend and backend dependencies are installed" -ForegroundColor White
Write-Host "3. ESLint configuration is set up" -ForegroundColor White
Write-Host "`nYou can now start developing!" -ForegroundColor Green

# Keep the window open
Read-Host "Press Enter to exit" 