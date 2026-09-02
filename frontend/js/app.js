const camera = document.getElementById("camera");
const startCameraButton = document.getElementById("startCamera");


async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        camera.srcObject = stream;

    } catch (error) {
        console.error("Cannot access camera:", error);
        alert("Cannot access camera.");
    }
}


startCameraButton.addEventListener("click", startCamera);