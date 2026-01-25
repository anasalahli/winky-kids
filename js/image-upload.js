// ============================================
// Enhanced Image Upload with Drag & Drop
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('product-image');
    const previewArea = document.getElementById('preview-area');
    const previewImage = document.getElementById('image-preview');
    const imageUrlInput = document.getElementById('current-image-url');

    if (!uploadArea || !fileInput) return;

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    });

    // Drag & Drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                fileInput.files = files;
                handleImageFile(file);
            } else {
                alert('يرجى اختيار ملف صورة فقط');
            }
        }
    });

    function handleImageFile(file) {
        // Check file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
            return;
        }

        // Read and display preview
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            uploadArea.style.display = 'none';
            previewArea.style.display = 'block';

            // Store base64 in hidden input
            if (imageUrlInput) {
                imageUrlInput.value = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
});

// Remove image function
function removeImage() {
    const uploadArea = document.getElementById('upload-area');
    const previewArea = document.getElementById('preview-area');
    const fileInput = document.getElementById('product-image');
    const previewImage = document.getElementById('image-preview');
    const imageUrlInput = document.getElementById('current-image-url');

    // Reset everything
    if (fileInput) fileInput.value = '';
    if (previewImage) previewImage.src = '';
    if (imageUrlInput) imageUrlInput.value = '';

    if (uploadArea) uploadArea.style.display = 'block';
    if (previewArea) previewArea.style.display = 'none';
}
