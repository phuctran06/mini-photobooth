// Get HTML elements

const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

const startCameraButton =
    document.getElementById("startCamera");

const capturePhotoButton =
    document.getElementById("capturePhoto");


// Start Camera

async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        camera.srcObject = stream;

        console.log("Camera started successfully.");

    } catch (error) {

        console.error(
            "Cannot access camera:",
            error
        );

        alert(
            "Cannot access camera. Please allow camera permission."
        );
    }
}


// Capture Photo

function capturePhoto() {

    // Lấy kích thước thật của video
    const width = camera.videoWidth;
    const height = camera.videoHeight;

    // Nếu camera chưa sẵn sàng
    if (width === 0 || height === 0) {

        alert(
            "Camera is not ready yet."
        );

        return;
    }

    // Set kích thước Canvas
    canvas.width = width;
    canvas.height = height;

    // Lấy context để vẽ ảnh
    const context = canvas.getContext("2d");

    // Vẽ frame hiện tại của camera vào Canvas
    context.drawImage(
        camera,
        0,
        0,
        width,
        height
    );

    // Convert Canvas thành JPEG
    const image =
        canvas.toDataURL("image/jpeg", 0.9);

    // Hiển thị ảnh vừa chụp
    preview.src = image;

    console.log("Photo captured.");
}


// Event Listeners

startCameraButton.addEventListener(
    "click",
    startCamera
);

capturePhotoButton.addEventListener(
    "click",
    capturePhoto
);