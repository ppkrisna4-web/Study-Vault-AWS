// ============================================
// Study Vault - JavaScript Application
// ============================================

// AWS Configuration
let s3;
let awsConfigured = false;

// DOM Elements
const elements = {
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),
    filePreview: document.getElementById('filePreview'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    btnRemove: document.getElementById('btnRemove'),
    btnUpload: document.getElementById('btnUpload'),
    uploadProgress: document.getElementById('uploadProgress'),
    uploadPercentage: document.getElementById('uploadPercentage'),
    uploadProgressBar: document.getElementById('uploadProgressBar'),
    conversionSection: document.getElementById('conversionSection'),
    conversionStatus: document.getElementById('conversionStatus'),
    filesList: document.getElementById('filesList'),
    emptyState: document.getElementById('emptyState'),
    btnRefresh: document.getElementById('btnRefresh'),
    statusBadge: document.getElementById('statusBadge'),
    toastContainer: document.getElementById('toastContainer')
};

// State
let selectedFile = null;
let pollingInterval = null;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeAWS();
    setupEventListeners();
});

function initializeAWS() {
    try {
        // Configure AWS SDK
        AWS.config.update({
            region: AWS_CONFIG.region,
            credentials: new AWS.Credentials({
                accessKeyId: AWS_CONFIG.credentials.accessKeyId,
                secretAccessKey: AWS_CONFIG.credentials.secretAccessKey
            })
        });

        s3 = new AWS.S3({
            apiVersion: '2006-03-01'
        });

        awsConfigured = true;
        updateStatus('connected', 'AWS Connected');
        showToast('success', 'AWS Connected', 'Successfully connected to AWS S3');
        
        // Load existing files
        loadConvertedFiles();
    } catch (error) {
        console.error('AWS Configuration Error:', error);
        updateStatus('error', 'Connection Failed');
        showToast('error', 'AWS Error', 'Failed to connect to AWS. Check your credentials.');
    }
}

function updateStatus(status, text) {
    elements.statusBadge.className = `status-badge ${status}`;
    elements.statusBadge.querySelector('.status-text').textContent = text;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Upload zone click
    elements.uploadZone.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // File input change
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    elements.uploadZone.addEventListener('dragover', handleDragOver);
    elements.uploadZone.addEventListener('dragleave', handleDragLeave);
    elements.uploadZone.addEventListener('drop', handleDrop);

    // Remove file
    elements.btnRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFile();
    });

    // Upload button
    elements.btnUpload.addEventListener('click', uploadAndConvert);

    // Refresh button
    elements.btnRefresh.addEventListener('click', () => {
        elements.btnRefresh.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            elements.btnRefresh.style.transform = '';
        }, 600);
        loadConvertedFiles();
    });
}

// ============================================
// File Selection
// ============================================

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndSetFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    elements.uploadZone.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    elements.uploadZone.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    elements.uploadZone.classList.remove('dragover');
    
    const file = event.dataTransfer.files[0];
    if (file) {
        validateAndSetFile(file);
    }
}

function validateAndSetFile(file) {
    // Validate file type
    if (!file.name.endsWith('.txt')) {
        showToast('error', 'Invalid File', 'Please select a .txt file');
        return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showToast('error', 'File Too Large', 'Maximum file size is 10MB');
        return;
    }

    selectedFile = file;
    showFilePreview();
    elements.btnUpload.disabled = false;
}

function showFilePreview() {
    elements.fileName.textContent = selectedFile.name;
    elements.fileSize.textContent = formatFileSize(selectedFile.size);
    elements.filePreview.style.display = 'flex';
    elements.uploadZone.style.display = 'none';
}

function removeFile() {
    selectedFile = null;
    elements.fileInput.value = '';
    elements.filePreview.style.display = 'none';
    elements.uploadZone.style.display = 'block';
    elements.btnUpload.disabled = true;
}

// ============================================
// Upload & Conversion
// ============================================

async function uploadAndConvert() {
    if (!selectedFile || !awsConfigured) return;

    try {
        elements.btnUpload.disabled = true;
        elements.uploadProgress.style.display = 'block';

        // Upload to S3 input bucket
        const uploadParams = {
            Bucket: AWS_CONFIG.buckets.input,
            Key: selectedFile.name,
            Body: selectedFile,
            ContentType: 'text/plain'
        };

        const upload = s3.upload(uploadParams);

        // Track upload progress
        upload.on('httpUploadProgress', (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            updateUploadProgress(percentage);
        });

        await upload.promise();

        // Upload complete
        showToast('success', 'Upload Complete', 'File uploaded successfully. Converting to speech...');
        
        // Reset upload UI
        elements.uploadProgress.style.display = 'none';
        removeFile();

        // Show conversion status
        showConversionStatus();

        // Start polling for converted file
        startPollingForConversion(selectedFile.name);

    } catch (error) {
        console.error('Upload Error:', error);
        showToast('error', 'Upload Failed', error.message);
        elements.btnUpload.disabled = false;
        elements.uploadProgress.style.display = 'none';
    }
}

function updateUploadProgress(percentage) {
    elements.uploadPercentage.textContent = `${percentage}%`;
    elements.uploadProgressBar.style.width = `${percentage}%`;
}

function showConversionStatus() {
    elements.conversionSection.style.display = 'block';
    elements.conversionStatus.textContent = 'Converting text to speech...';
}

function hideConversionStatus() {
    elements.conversionSection.style.display = 'none';
}

// ============================================
// Polling for Conversion
// ============================================

function startPollingForConversion(originalFileName) {
    const mp3FileName = originalFileName.replace('.txt', '.mp3');
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max

    pollingInterval = setInterval(async () => {
        attempts++;

        try {
            // Check if MP3 file exists in output bucket
            const exists = await checkFileExists(AWS_CONFIG.buckets.output, mp3FileName);

            if (exists) {
                clearInterval(pollingInterval);
                hideConversionStatus();
                showToast('success', 'Conversion Complete', 'Your audio file is ready!');
                loadConvertedFiles();
            } else if (attempts >= maxAttempts) {
                clearInterval(pollingInterval);
                hideConversionStatus();
                showToast('warning', 'Conversion Taking Longer', 'The conversion is taking longer than expected. Please check back later.');
                loadConvertedFiles();
            }
        } catch (error) {
            console.error('Polling Error:', error);
        }
    }, 2000); // Poll every 2 seconds
}

async function checkFileExists(bucket, key) {
    try {
        await s3.headObject({
            Bucket: bucket,
            Key: key
        }).promise();
        return true;
    } catch (error) {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    }
}

// ============================================
// Load Converted Files
// ============================================

async function loadConvertedFiles() {
    if (!awsConfigured) return;

    try {
        const params = {
            Bucket: AWS_CONFIG.buckets.output,
            MaxKeys: 100
        };

        const data = await s3.listObjectsV2(params).promise();

        if (data.Contents && data.Contents.length > 0) {
            // Filter only MP3 files and sort by date (newest first)
            const mp3Files = data.Contents
                .filter(file => file.Key.endsWith('.mp3'))
                .sort((a, b) => b.LastModified - a.LastModified);

            displayFiles(mp3Files);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Load Files Error:', error);
        showToast('error', 'Load Failed', 'Failed to load converted files');
        showEmptyState();
    }
}

function displayFiles(files) {
    elements.emptyState.style.display = 'none';
    elements.filesList.innerHTML = '';

    files.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        elements.filesList.appendChild(fileItem);
    });
}

function createFileItem(file, index) {
    const div = document.createElement('div');
    div.className = 'file-item';
    div.style.animationDelay = `${index * 0.05}s`;

    const lastModified = new Date(file.LastModified).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div class="file-item-info">
            <div class="file-item-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18V5L21 12L9 19V18Z" fill="currentColor"/>
                    <path d="M3 18V5L5 6V17L3 18Z" fill="currentColor"/>
                </svg>
            </div>
            <div class="file-item-details">
                <p class="file-item-name">${file.Key}</p>
                <div class="file-item-meta">
                    <span>${formatFileSize(file.Size)}</span>
                    <span>•</span>
                    <span>${lastModified}</span>
                </div>
            </div>
        </div>
        <button class="btn-download" onclick="downloadFile('${file.Key}')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4.66667 6.66667L8 10L11.3333 6.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 10V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Download
        </button>
    `;

    return div;
}

function showEmptyState() {
    elements.filesList.innerHTML = '';
    elements.emptyState.style.display = 'block';
}

// ============================================
// Download File
// ============================================

async function downloadFile(fileName) {
    try {
        const params = {
            Bucket: AWS_CONFIG.buckets.output,
            Key: fileName,
            Expires: 60 // URL valid for 60 seconds
        };

        const url = s3.getSignedUrl('getObject', params);

        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('success', 'Download Started', `Downloading ${fileName}`);
    } catch (error) {
        console.error('Download Error:', error);
        showToast('error', 'Download Failed', error.message);
    }
}

// ============================================
// Utilities
// ============================================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55298 18.6453 1.55199 18.9945C1.551 19.3437 1.64145 19.6871 1.81442 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3586 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>`
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    elements.toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}
