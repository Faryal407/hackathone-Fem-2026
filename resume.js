document.addEventListener('DOMContentLoaded', function() {
    const userInfoForm = document.getElementById('userInfoForm');
    const resumePreview = document.getElementById('resumePreview');
    const editBtn = document.getElementById('editBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const profileImageInput = document.getElementById('profileImage');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const themeToggleBtn = document.getElementById('themeToggle');

    // Theme toggle functionality
    initializeTheme();
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Load html2pdf library
    loadHtml2pdfLibrary();

    // Preview profile image on file selection
    if (profileImageInput) {
        profileImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('File size must be less than 5MB', 'error');
                    return;
                }
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showNotification('Please upload a valid image file', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    profileImagePreview.src = event.target.result;
                    showNotification('Image uploaded successfully', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle form submission and navigation
    if (userInfoForm) {
        userInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all required fields
            if (!validateForm()) {
                showNotification('Please fill all required fields', 'error');
                return;
            }

            const userInfo = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                summary: document.getElementById('summary').value.trim(),
                experience: document.getElementById('experience').value.trim(),
                education: document.getElementById('education').value.trim(),
                skills: document.getElementById('skills').value.trim(),
                profileImage: profileImagePreview.src,
                createdDate: new Date().toLocaleDateString()
            };

            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            showNotification('Resume saved successfully. Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'generate.html';
            }, 1500);
        });
    }

    // Check if we are on the resume preview page
    if (resumePreview) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            displayResumePreview(userInfo);
        } else {
            resumePreview.innerHTML = `<p style="text-align: center; color: #999;">No resume data found. Please fill the form first.</p>`;
        }

        if (editBtn) {
            editBtn.addEventListener('click', function() {
                window.location.href = 'resume.html';
            });
        }

        // Print button functionality
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                printResume(userInfo);
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                if (userInfo) {
                    downloadBtn.disabled = true;
                    downloadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating PDF...';
                    
                    setTimeout(() => {
                        downloadResumePDF(userInfo);
                        downloadBtn.disabled = false;
                        downloadBtn.innerHTML = 'Download as PDF';
                        showNotification('Resume downloaded successfully!', 'success');
                    }, 1000);
                } else {
                    showNotification('No resume data found. Please fill the form first.', 'error');
                }
            });
        }
    }
});

// Function to display resume preview
function displayResumePreview(userInfo) {
    const resumePreview = document.getElementById('resumePreview');
    resumePreview.innerHTML = `
        <div class="resume-header">
            <img src="${userInfo.profileImage}" alt="Profile Image" class="profile-image">
            <div class="personal-info">
                <h2>${escapeHtml(userInfo.firstName)} ${escapeHtml(userInfo.lastName)}</h2>
                <p><strong>Email:</strong> <a href="mailto:${escapeHtml(userInfo.email)}">${escapeHtml(userInfo.email)}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${escapeHtml(userInfo.phone)}">${escapeHtml(userInfo.phone)}</a></p>
                <p><strong>Address:</strong> ${escapeHtml(userInfo.address)}</p>
            </div>
        </div>

        <h3>Professional Summary</h3>
        <p>${escapeHtml(userInfo.summary).replace(/\n/g, '<br>')}</p>

        <h3>Experience</h3>
        <p>${escapeHtml(userInfo.experience).replace(/\n/g, '<br>')}</p>

        <h3>Education</h3>
        <p>${escapeHtml(userInfo.education).replace(/\n/g, '<br>')}</p>

        <h3>Skills</h3>
        <p>${escapeHtml(userInfo.skills).replace(/\n/g, '<br>')}</p>
    `;
}

// Function to download resume as PDF
function downloadResumePDF(userInfo) {
    const element = document.getElementById('resumePreview');
    
    if (typeof html2pdf === 'undefined') {
        showNotification('PDF library is loading. Please try again.', 'warning');
        return;
    }

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `${userInfo.firstName}_${userInfo.lastName}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    // Using html2pdf library
    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .catch(function(error) {
            console.error('PDF Download Error:', error);
            showNotification('Failed to download PDF. Please try again.', 'error');
        });
}

// Function to load html2pdf library
function loadHtml2pdfLibrary() {
    if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = function() {
            console.log('html2pdf library loaded successfully');
        };
        script.onerror = function() {
            console.error('Failed to load html2pdf library');
            showNotification('PDF feature may not work properly', 'warning');
        };
        document.head.appendChild(script);
    }
}

// Function to validate form
function validateForm() {
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const summary = document.getElementById('summary');
    const experience = document.getElementById('experience');
    const education = document.getElementById('education');
    const skills = document.getElementById('skills');

    const fields = [firstName, lastName, email, phone, address, summary, experience, education, skills];
    
    return fields.every(field => field && field.value.trim() !== '');
}

// Function to show notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${getAlertClass(type)} alert-dismissible fade show`;
    notification.setAttribute('role', 'alert');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notification);

    // Auto-remove notification after 4 seconds
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Function to get alert class based on type
function getAlertClass(type) {
    const classes = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return classes[type] || 'info';
}

// Function to escape HTML special characters
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Function to print resume
function printResume(userInfo) {
    if (!userInfo) {
        showNotification('No resume data found. Please fill the form first.', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    
    const printContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(userInfo.firstName)} ${escapeHtml(userInfo.lastName)} - Resume</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
                padding: 20px;
            }
            
            .container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                padding: 40px;
            }
            
            .resume-header {
                display: flex;
                align-items: center;
                gap: 30px;
                border-bottom: 3px solid #0d6efd;
                padding-bottom: 30px;
                margin-bottom: 30px;
            }
            
            .profile-image {
                flex-shrink: 0;
                width: 150px;
                height: 150px;
                border: 3px solid #0d6efd;
                border-radius: 12px;
                object-fit: cover;
            }
            
            .personal-info {
                flex: 1;
            }
            
            .personal-info h2 {
                font-size: 2.2rem;
                color: #2d3436;
                margin-bottom: 10px;
            }
            
            .personal-info p {
                margin: 8px 0;
                color: #555;
                font-size: 0.95rem;
            }
            
            .personal-info a {
                color: #0d6efd;
                text-decoration: none;
            }
            
            h3 {
                font-size: 1.4rem;
                color: #0d6efd;
                margin-top: 25px;
                margin-bottom: 12px;
                padding-bottom: 10px;
                border-bottom: 2px solid #dee2e6;
            }
            
            p {
                color: #555;
                margin-bottom: 15px;
                line-height: 1.7;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            
            @media print {
                body {
                    padding: 0;
                }
                
                .container {
                    padding: 0;
                    max-width: 100%;
                }
                
                .resume-header {
                    page-break-inside: avoid;
                }
                
                h3 {
                    page-break-after: avoid;
                }
            }
            
            @page {
                margin: 10mm;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="resume-header">
                <img src="${userInfo.profileImage}" alt="Profile Image" class="profile-image">
                <div class="personal-info">
                    <h2>${escapeHtml(userInfo.firstName)} ${escapeHtml(userInfo.lastName)}</h2>
                    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(userInfo.email)}">${escapeHtml(userInfo.email)}</a></p>
                    <p><strong>Phone:</strong> <a href="tel:${escapeHtml(userInfo.phone)}">${escapeHtml(userInfo.phone)}</a></p>
                    <p><strong>Address:</strong> ${escapeHtml(userInfo.address)}</p>
                </div>
            </div>

            <h3>Professional Summary</h3>
            <p>${escapeHtml(userInfo.summary)}</p>

            <h3>Experience</h3>
            <p>${escapeHtml(userInfo.experience)}</p>

            <h3>Education</h3>
            <p>${escapeHtml(userInfo.education)}</p>

            <h3>Skills</h3>
            <p>${escapeHtml(userInfo.skills)}</p>
        </div>
        
        <script>
            window.addEventListener('load', function() {
                window.print();
                setTimeout(function() {
                    window.close();
                }, 500);
            });
        </script>
    </body>
    </html>
    `;
    
    printWindow.document.writeln(printContent);
    printWindow.document.close();
    
    showNotification('Opening print dialog...', 'info');
}

/* ==================== THEME TOGGLE FUNCTIONALITY ==================== */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    updateThemeIcon();
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = themeToggleBtn.querySelector('.theme-icon');
    
    if (document.body.classList.contains('dark-theme')) {
        themeIcon.textContent = '☀️';
        themeToggleBtn.title = 'Switch to Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeToggleBtn.title = 'Switch to Dark Mode';
    }
}
 





document.addEventListener('DOMContentLoaded', function() {
    const userInfoForm = document.getElementById('userInfoForm');
    const resumePreview = document.getElementById('resumePreview');
    const editBtn = document.getElementById('editBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const profileImageInput = document.getElementById('profileImage');
    const profileImagePreview = document.getElementById('profileImagePreview');

    // Preview profile image on file selection
    if (profileImageInput) {
        profileImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    profileImagePreview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle form submission and navigation
    if (userInfoForm) {
        userInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userInfo = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                summary: document.getElementById('summary').value,
                experience: document.getElementById('experience').value,
                education: document.getElementById('education').value,
                skills: document.getElementById('skills').value,
                profileImage: profileImagePreview.src
            };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            window.location.href = 'generate.html';
        });
    }

    // Check if we are on the resume page
    if (resumePreview) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            resumePreview.innerHTML = `
                <div class="resume-header">
                    <img src="${userInfo.profileImage}" alt="Profile Image" class="profile-image">
                    <div class="personal-info">
                        <h2>${userInfo.firstName} ${userInfo.lastName}</h2>
                        <p><strong>Email:</strong> ${userInfo.email}</p>
                        <p><strong>Phone:</strong> ${userInfo.phone}</p>
                        <p><strong>Address:</strong> ${userInfo.address}</p>
                    </div>
                </div>

                <h3>Professional Summary</h3>
                <p>${userInfo.summary}</p>

                <h3>Experience</h3>
                <p>${userInfo.experience}</p>

                <h3>Education</h3>
                <p>${userInfo.education}</p>

                <h3>Skills</h3>
                <p>${userInfo.skills}</p>
            `;
        }

        editBtn.addEventListener('click', function() {
            window.location.href = 'resume.html';
        });

        downloadBtn.addEventListener('click', function() {
            window.print();
        });
    }
});