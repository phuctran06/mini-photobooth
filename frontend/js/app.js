// ==========================================
// DOM ELEMENTS
// ==========================================

const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const countdown = document.getElementById("countdown");
const statusText = document.getElementById("status");

const startCameraButton =
    document.getElementById("startCamera");

const startSessionButton =
    document.getElementById("startSession");

const retakeButton =
    document.getElementById("retake");

const downloadButton =
    document.getElementById("downloadButton");

const resultSection =
    document.getElementById("resultSection");

const resultImage =
    document.getElementById("resultImage");


// ==========================================
// PHOTO ELEMENTS
// ==========================================

const photoElements = [
    document.getElementById("photo1"),
    document.getElementById("photo2"),
    document.getElementById("photo3"),
    document.getElementById("photo4")
];


// ==========================================
// APPLICATION STATE
// ==========================================

let cameraStream = null;

let photos = [];

let isTakingPhotos = false;


// ==========================================
// START CAMERA
// ==========================================

async function startCamera() {

    try {

        statusText.textContent =
            "Requesting camera permission...";

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        camera.srcObject = cameraStream;

        startCameraButton.disabled = true;

        startSessionButton.disabled = false;

        statusText.textContent =
            "Camera ready. Click Take Photos.";

    } catch (error) {

        console.error(error);

        statusText.textContent =
            "Cannot access camera.";

        alert(
            "Cannot access camera. Please allow camera permission."
        );
    }
}


// ==========================================
// COUNTDOWN
// ==========================================

function countdownTimer(seconds = 3) {

    return new Promise((resolve) => {

        let count = seconds;

        countdown.style.display = "block";

        countdown.textContent = count;

        const timer = setInterval(() => {

            count--;

            if (count > 0) {

                countdown.textContent = count;

            } else {

                clearInterval(timer);

                countdown.style.display = "none";

                resolve();

            }

        }, 1000);

    });
}


// ==========================================
// CAPTURE PHOTO
// ==========================================

function capturePhoto() {

    const width = camera.videoWidth;
    const height = camera.videoHeight;


    if (width === 0 || height === 0) {

        throw new Error(
            "Camera is not ready."
        );
    }


    canvas.width = width;
    canvas.height = height;


    const context =
        canvas.getContext("2d");


    context.drawImage(
        camera,
        0,
        0,
        width,
        height
    );


    return canvas.toDataURL(
        "image/jpeg",
        0.9
    );
}


// ==========================================
// DISPLAY PHOTO
// ==========================================

function displayPhoto(index, image) {

    photoElements[index].src = image;

    photoElements[index].style.display =
        "block";
}


// ==========================================
// CLEAR PHOTOS
// ==========================================

function clearPhotos() {

    photos = [];


    photoElements.forEach((image) => {

        image.src = "";

        image.style.display = "none";

    });


    resultSection.classList.add("hidden");

    resultImage.src = "";

}


// ==========================================
// TAKE 4 PHOTOS
// ==========================================

async function takePhotos() {

    if (isTakingPhotos) {
        return;
    }


    isTakingPhotos = true;


    startSessionButton.disabled = true;

    retakeButton.disabled = true;


    clearPhotos();


    statusText.textContent =
        "Get ready...";


    try {

        for (let i = 0; i < 4; i++) {

            statusText.textContent =
                `Photo ${i + 1} of 4`;


            // Countdown
            await countdownTimer(3);


            // Capture
            const image =
                capturePhoto();


            // Save in array
            photos.push(image);


            // Display preview
            displayPhoto(i, image);


            // Small delay before next photo
            if (i < 3) {

                await wait(1000);

            }

        }


        statusText.textContent =
            "All photos captured!";


        retakeButton.disabled = false;


        // Send photos to backend
        await createPhotostrip();


    } catch (error) {

        console.error(error);

        statusText.textContent =
            "Something went wrong.";

    } finally {

        isTakingPhotos = false;

    }
}


// ==========================================
// WAIT
// ==========================================

function wait(milliseconds) {

    return new Promise((resolve) => {

        setTimeout(
            resolve,
            milliseconds
        );

    });
}


// ==========================================
// SEND PHOTOS TO BACKEND
// ==========================================

async function createPhotostrip() {

    statusText.textContent =
        "Creating photostrip...";


    const formData =
        new FormData();


    photos.forEach((photo, index) => {

        const blob =
            dataURLToBlob(photo);

        formData.append(
            "photos",
            blob,
            `photo_${index + 1}.jpg`
        );

    });


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/api/photobooth/create",
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data =
            await response.json();


        resultImage.src =
            `http://127.0.0.1:8000${data.image_url}`;


        resultSection.classList.remove(
            "hidden"
        );


        statusText.textContent =
            "Photostrip ready!";


    } catch (error) {

        console.error(error);


        statusText.textContent =
            "Photos captured, but backend is not ready yet.";

    }

}


// ==========================================
// DATA URL → BLOB
// ==========================================

function dataURLToBlob(dataURL) {

    const parts =
        dataURL.split(",");


    const mime =
        parts[0]
            .match(/:(.*?);/)[1];


    const binary =
        atob(parts[1]);


    const array =
        new Uint8Array(binary.length);


    for (let i = 0; i < binary.length; i++) {

        array[i] =
            binary.charCodeAt(i);

    }


    return new Blob(
        [array],
        { type: mime }
    );

}


// ==========================================
// RETAKE
// ==========================================

function retakePhotos() {

    if (isTakingPhotos) {
        return;
    }


    clearPhotos();


    statusText.textContent =
        "Ready to take photos again.";


    startSessionButton.disabled =
        false;

}


// ==========================================
// DOWNLOAD RESULT
// ==========================================

function downloadResult() {

    if (!resultImage.src) {
        return;
    }


    const link =
        document.createElement("a");


    link.href =
        resultImage.src;


    link.download =
        "mini-photobooth.jpg";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);

}


// ==========================================
// EVENT LISTENERS
// ==========================================

startCameraButton.addEventListener(
    "click",
    startCamera
);


startSessionButton.addEventListener(
    "click",
    takePhotos
);


retakeButton.addEventListener(
    "click",
    retakePhotos
);


downloadButton.addEventListener(
    "click",
    downloadResult
);