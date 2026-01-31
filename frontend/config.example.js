// ============================================
// AWS Configuration Example
// ============================================

/**
 * This is an EXAMPLE configuration file.
 * 
 * TO USE THIS APPLICATION:
 * 1. Copy this file and rename it to 'config.js'
 * 2. Replace the placeholder values with your actual AWS credentials
 * 3. NEVER commit config.js with real credentials to Git
 * 
 * SECURITY WARNING:
 * - config.js is in .gitignore to prevent accidental commits
 * - Only commit config.example.js to your repository
 * - For production, use AWS Cognito or environment variables
 */

const AWS_CONFIG = {
    // AWS Region where your S3 buckets are located
    // Examples: 'us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'
    region: 'us-east-1',
    
    // AWS Credentials
    credentials: {
        // Your AWS Access Key ID
        // Get this from: AWS Console → IAM → Users → Security Credentials
        accessKeyId: 'YOUR_ACCESS_KEY_ID_HERE',
        
        // Your AWS Secret Access Key
        // Get this from: AWS Console → IAM → Users → Security Credentials
        secretAccessKey: 'YOUR_SECRET_ACCESS_KEY_HERE'
    },
    
    // S3 Bucket Names
    buckets: {
        // Input bucket where .txt files are uploaded
        // This should match your Terraform output
        input: 'study-vault-input-dev-XXXXXXXX',
        
        // Output bucket where .mp3 files are stored
        // This should match your Terraform output
        output: 'study-vault-output-dev-XXXXXXXX'
    }
};

// ============================================
// How to Get Your AWS Credentials
// ============================================

/*
STEP 1: Create IAM User
------------------------
1. Go to AWS Console: https://console.aws.amazon.com
2. Navigate to IAM (Identity and Access Management)
3. Click "Users" → "Add users"
4. User name: study-vault-frontend
5. Select "Access key - Programmatic access"
6. Click "Next: Permissions"

STEP 2: Set Permissions
------------------------
Option A - Use Existing Policy:
1. Click "Attach existing policies directly"
2. Search for "AmazonS3FullAccess"
3. Check the box and click "Next"

Option B - Create Custom Policy (Recommended):
1. Click "Create policy"
2. Use this JSON:

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

STEP 3: Save Credentials
-------------------------
1. Click "Create user"
2. IMPORTANT: Download or copy the credentials
   - Access key ID: AKIAIOSFODNN7EXAMPLE
   - Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
3. You won't be able to see these again!

STEP 4: Configure CORS on S3 Buckets
-------------------------------------
For BOTH input and output buckets:
1. Go to S3 → Select bucket → Permissions tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Click Edit and paste:

[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]

4. Save changes

STEP 5: Update config.js
-------------------------
1. Copy this file to config.js
2. Replace YOUR_ACCESS_KEY_ID_HERE with your Access Key ID
3. Replace YOUR_SECRET_ACCESS_KEY_HERE with your Secret Access Key
4. Update bucket names if different
5. Save the file

DONE! You're ready to use the application.
*/

// ============================================
// Configuration Validation
// ============================================

function validateConfig() {
    const errors = [];
    
    if (AWS_CONFIG.credentials.accessKeyId === 'YOUR_ACCESS_KEY_ID_HERE') {
        errors.push('Access Key ID not configured');
    }
    
    if (AWS_CONFIG.credentials.secretAccessKey === 'YOUR_SECRET_ACCESS_KEY_HERE') {
        errors.push('Secret Access Key not configured');
    }
    
    if (AWS_CONFIG.buckets.input.includes('XXXXXXXX')) {
        errors.push('Input bucket name not configured');
    }
    
    if (AWS_CONFIG.buckets.output.includes('XXXXXXXX')) {
        errors.push('Output bucket name not configured');
    }
    
    if (errors.length > 0) {
        console.error('❌ AWS Configuration Errors:');
        errors.forEach(error => console.error(`   - ${error}`));
        console.error('\n📝 Please edit config.js and add your AWS credentials.');
        console.error('📚 See comments in config.js for detailed instructions.\n');
        return false;
    }
    
    console.log('✅ AWS Configuration validated');
    return true;
}

// Validate on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (!validateConfig()) {
            const statusBadge = document.getElementById('statusBadge');
            if (statusBadge) {
                statusBadge.className = 'status-badge error';
                statusBadge.querySelector('.status-text').textContent = 'Config Required';
            }
            
            alert('⚠️ AWS Configuration Required\n\nPlease edit config.js and add your AWS credentials.\n\nSee config.example.js for detailed instructions.');
        }
    });
}
