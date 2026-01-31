# 🎙️ Study Vault - Frontend

Frontend web application for Study Vault, a serverless text-to-speech converter powered by AWS.

![Study Vault Interface](https://img.shields.io/badge/AWS-S3%20%7C%20Lambda%20%7C%20Polly-orange)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## 📋 Overview

This is a modern, professional frontend interface that allows users to:
- ✅ Upload `.txt` files via drag-and-drop or file selection
- ✅ Automatically convert text to speech using Amazon Polly
- ✅ View real-time conversion progress
- ✅ Download generated MP3 files
- ✅ Browse all converted audio files

## 🎨 Features

### User Interface
- **Modern Design**: Glassmorphism effects, smooth animations, and professional aesthetics
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Real-time Feedback**: Progress bars, status indicators, and toast notifications
- **Drag & Drop**: Intuitive file upload experience

### AWS Integration
- **AWS SDK for JavaScript**: Direct integration with S3 buckets
- **Automatic Polling**: Monitors conversion progress
- **Secure Downloads**: Uses pre-signed URLs for file downloads
- **Error Handling**: Comprehensive error messages and fallbacks

## 🚀 Quick Start

### Prerequisites

1. **AWS Account** with:
   - S3 buckets configured (input and output)
   - Lambda function with Amazon Polly integration
   - IAM user with S3 access permissions

2. **Web Browser** (Chrome, Firefox, Safari, or Edge)

### Installation Steps

1. **Clone or Download** this repository

2. **Configure AWS Credentials**:
   ```bash
   # Open config.js and replace:
   accessKeyId: 'YOUR_ACCESS_KEY_ID_HERE'
   secretAccessKey: 'YOUR_SECRET_ACCESS_KEY_HERE'
   ```

3. **Verify Bucket Names** in `config.js`:
   ```javascript
   buckets: {
       input: 'study-vault-input-dev-65a23ab0',
       output: 'study-vault-output-dev-65a23ab0'
   }
   ```

4. **Run Locally**:
   
   **Option A - Using Python**:
   ```bash
   # Navigate to frontend folder
   cd frontend
   
   # Start simple HTTP server
   python -m http.server 8000
   ```
   
   **Option B - Using Node.js**:
   ```bash
   # Install http-server globally
   npm install -g http-server
   
   # Navigate to frontend folder
   cd frontend
   
   # Start server
   http-server -p 8000
   ```
   
   **Option C - Using VS Code**:
   - Install "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

5. **Open Browser**:
   ```
   http://localhost:8000
   ```

## 🔐 Security Configuration

### IAM User Setup

Create an IAM user with the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::study-vault-input-dev-*/*",
                "arn:aws:s3:::study-vault-output-dev-*/*",
                "arn:aws:s3:::study-vault-input-dev-*",
                "arn:aws:s3:::study-vault-output-dev-*"
            ]
        }
    ]
}
```

### CORS Configuration for S3 Buckets

Both S3 buckets need CORS enabled:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

**To add CORS in AWS Console**:
1. Go to S3 → Select bucket → Permissions tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Click Edit and paste the JSON above
4. Save changes
5. Repeat for both input and output buckets

## 📁 Project Structure

```
frontend/
├── index.html          # Main HTML file
├── styles.css          # Professional CSS with animations
├── app.js              # JavaScript application logic
├── config.js           # AWS configuration (DO NOT COMMIT WITH CREDENTIALS)
└── README.md           # This file
```

## 🎯 Usage Guide

### Uploading Files

1. **Drag & Drop**: Drag a `.txt` file onto the upload zone
2. **Click to Browse**: Click the upload zone to select a file
3. **File Requirements**:
   - Format: `.txt` only
   - Max size: 10MB
   - Plain text content

### Conversion Process

1. Click "Upload & Convert" button
2. File is uploaded to S3 input bucket
3. Lambda function is triggered automatically
4. Amazon Polly converts text to speech
5. MP3 file is saved to output bucket
6. Frontend polls for completion (every 2 seconds)
7. Success notification appears when ready

### Downloading Files

1. Scroll to "Converted Files" section
2. Click "Download" button on any file
3. File downloads to your browser's default location

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AWS SDK**: aws-sdk-2.1563.0.min.js
- **Fonts**: DM Sans, JetBrains Mono (Google Fonts)
- **CSS Features**: 
  - CSS Grid & Flexbox
  - CSS Variables
  - CSS Animations
  - Glassmorphism effects
  - Responsive design

## ⚙️ Configuration Options

### AWS Region

Change in `config.js`:
```javascript
region: 'us-east-1'  // Your AWS region
```

### Polling Interval

Modify in `app.js`:
```javascript
// Line ~300
pollingInterval = setInterval(async () => {
    // ... polling logic
}, 2000); // Change 2000 to adjust milliseconds
```

### Max File Size

Modify in `app.js`:
```javascript
// Line ~125
const maxSize = 10 * 1024 * 1024; // Change to adjust limit
```

## 🐛 Troubleshooting

### "AWS Configuration Required" Error
- **Cause**: Credentials not set in `config.js`
- **Solution**: Edit `config.js` and add your AWS Access Key ID and Secret Key

### "Connection Failed" Error
- **Cause**: Invalid credentials or network issue
- **Solution**: Verify credentials are correct and you have internet connection

### "Upload Failed" Error
- **Cause**: S3 permissions or CORS issue
- **Solution**: 
  1. Verify IAM user has S3 permissions
  2. Check CORS configuration on S3 buckets
  3. Ensure bucket names match in `config.js`

### Files Not Appearing
- **Cause**: Lambda function not triggered or failed
- **Solution**:
  1. Check CloudWatch logs for Lambda function
  2. Verify S3 trigger is configured
  3. Check Lambda has Polly permissions

### Conversion Takes Too Long
- **Cause**: Large file or Lambda cold start
- **Solution**: 
  - Wait up to 2 minutes (max polling time)
  - Check CloudWatch logs for errors
  - Reduce file size if needed

## 📱 Responsive Design

The interface adapts to different screen sizes:
- **Desktop** (>768px): Full layout with side-by-side elements
- **Tablet** (768px): Stacked layout with preserved functionality
- **Mobile** (<768px): Optimized single-column layout

## 🎨 Customization

### Change Color Scheme

Edit CSS variables in `styles.css`:

```css
:root {
    --color-primary: #0ea5e9;      /* Primary blue */
    --color-secondary: #06b6d4;    /* Secondary cyan */
    --color-accent: #0891b2;       /* Accent color */
    /* ... more colors */
}
```

### Modify Animations

Adjust animation timing in `styles.css`:

```css
--transition-fast: 150ms;    /* Quick transitions */
--transition-base: 250ms;    /* Normal transitions */
--transition-slow: 400ms;    /* Slow transitions */
```

## 📸 Screenshots & Demo

This frontend is designed to be portfolio-ready. Recommended screenshots for your README:

1. **Upload Interface**: Show drag-and-drop area
2. **File Preview**: Show selected file details
3. **Conversion Status**: Show animated waveform
4. **Files List**: Show downloaded MP3 files
5. **Mobile View**: Show responsive design

## 🔒 Security Best Practices

**⚠️ IMPORTANT FOR PRODUCTION**:

1. **Never commit credentials**: Add `config.js` to `.gitignore`
2. **Use environment variables**: For production deployments
3. **Implement AWS Cognito**: For user authentication
4. **Use temporary credentials**: Consider AWS STS
5. **Restrict CORS**: Limit origins to your domain only
6. **Enable S3 encryption**: Use server-side encryption
7. **Add rate limiting**: Prevent abuse

### Example .gitignore

```
# AWS Credentials
config.js

# OS Files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

## 🚀 Deployment Options

### GitHub Pages
```bash
# Remove or encrypt config.js before pushing
git add .
git commit -m "Deploy frontend"
git push origin main
```

### AWS S3 Static Hosting
```bash
# Upload to S3 bucket with static website hosting
aws s3 sync . s3://your-website-bucket/ --exclude "*.md"
```

### Netlify/Vercel
1. Connect your GitHub repository
2. Set build command: (none needed for static site)
3. Set publish directory: `frontend/`
4. Add environment variables for AWS credentials

## 📚 Learning Resources

- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Amazon S3 Developer Guide](https://docs.aws.amazon.com/s3/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon Polly Documentation](https://docs.aws.amazon.com/polly/)

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Feel free to use this for your own projects

## 👨‍💻 Author

Created as part of an AWS learning journey. Perfect for:
- AWS certification preparation
- Portfolio projects
- Learning serverless architecture
- Understanding AWS SDK integration

## 🎓 Portfolio Tips

When showcasing this project:
1. **Record a demo video**: Show the upload and conversion process
2. **Highlight AWS integration**: Mention specific services used
3. **Explain architecture**: Include a diagram in your main README
4. **Show code quality**: Mention error handling, validation, UX
5. **Discuss challenges**: What problems did you solve?

## 📞 Support

For issues or questions:
- Check troubleshooting section above
- Review AWS CloudWatch logs
- Verify S3 and Lambda configurations
- Check browser console for errors

---

**Built with ❤️ using AWS Services**

Stack: AWS Lambda | Amazon S3 | Amazon Polly | JavaScript | HTML5 | CSS3
