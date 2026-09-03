from pathlib import Path
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from app.services.image_service import create_photostrip


# ==========================================
# ROUTER
# ==========================================

router = APIRouter(
    prefix="/api/photobooth",
    tags=["Photobooth"]
)


# ==========================================
# DIRECTORIES
# ==========================================

BASE_DIR = Path(__file__).resolve().parents[2]

UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


# ==========================================
# CREATE PHOTOSTRIP
# ==========================================

@router.post("/create")
async def create_photobooth(
    photos: List[UploadFile] = File(...)
):
    # --------------------------------------
    # Validate number of photos
    # --------------------------------------

    if len(photos) != 4:
        raise HTTPException(
            status_code=400,
            detail="Exactly 4 photos are required."
        )

    saved_files = []

    try:

        # ----------------------------------
        # Save uploaded photos
        # ----------------------------------

        for index, photo in enumerate(photos):

            file_path = (
                UPLOAD_DIR /
                f"photo_{index + 1}.jpg"
            )

            content = await photo.read()

            if not content:
                raise HTTPException(
                    status_code=400,
                    detail=f"Photo {index + 1} is empty."
                )

            with open(file_path, "wb") as file:
                file.write(content)

            saved_files.append(file_path)

        # ----------------------------------
        # Create photostrip
        # ----------------------------------

        output_path = create_photostrip(
            saved_files
        )

        # ----------------------------------
        # Response
        # ----------------------------------

        return {
            "message": "Photostrip created successfully",
            "image_url": (
                f"/outputs/{output_path.name}"
            )
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            f"Photostrip error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create photostrip."
        )


# ==========================================
# DOWNLOAD PHOTOSTRIP
# ==========================================

@router.get("/download")
async def download_photostrip():

    file_path = (
        OUTPUT_DIR /
        "photostrip.jpg"
    )

    # --------------------------------------
    # Check file exists
    # --------------------------------------

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Photostrip not found."
        )

    # --------------------------------------
    # Return downloadable file
    # --------------------------------------

    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        filename="mini-photobooth.jpg"
    )