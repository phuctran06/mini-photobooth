from pathlib import Path
from typing import List

from PIL import Image


# ==========================================
# Configuration
# ==========================================

BASE_DIR = Path(__file__).resolve().parents[2]

OUTPUT_DIR = BASE_DIR / "outputs"

OUTPUT_DIR.mkdir(
    exist_ok=True
)


# Photostrip configuration

PHOTO_WIDTH = 600
PHOTO_HEIGHT = 450

PADDING = 20

BACKGROUND_COLOR = "white"


# ==========================================
# Prepare Image
# ==========================================

def prepare_image(
    image: Image.Image,
    width: int,
    height: int
) -> Image.Image:

    """
    Resize and crop image to target size.
    """

    image = image.convert("RGB")


    original_width, original_height = (
        image.size
    )


    target_ratio = width / height

    original_ratio = (
        original_width / original_height
    )


    # --------------------------------------
    # Crop width
    # --------------------------------------

    if original_ratio > target_ratio:

        new_width = int(
            original_height * target_ratio
        )

        left = (
            original_width - new_width
        ) // 2

        image = image.crop(
            (
                left,
                0,
                left + new_width,
                original_height
            )
        )


    # --------------------------------------
    # Crop height
    # --------------------------------------

    elif original_ratio < target_ratio:

        new_height = int(
            original_width / target_ratio
        )

        top = (
            original_height - new_height
        ) // 2

        image = image.crop(
            (
                0,
                top,
                original_width,
                top + new_height
            )
        )


    # --------------------------------------
    # Resize
    # --------------------------------------

    image = image.resize(
        (
            width,
            height
        ),
        Image.Resampling.LANCZOS
    )


    return image


# ==========================================
# Create Photostrip
# ==========================================

def create_photostrip(
    photo_paths: List[Path]
) -> Path:

    """
    Combine 4 photos into one vertical photostrip.
    """

    if len(photo_paths) != 4:

        raise ValueError(
            "Exactly 4 photos are required."
        )


    prepared_images = []


    # --------------------------------------
    # Open + prepare photos
    # --------------------------------------

    for path in photo_paths:

        image = Image.open(path)


        image = prepare_image(
            image,
            PHOTO_WIDTH,
            PHOTO_HEIGHT
        )


        prepared_images.append(
            image
        )


    # --------------------------------------
    # Calculate canvas size
    # --------------------------------------

    canvas_width = (
        PHOTO_WIDTH
        + PADDING * 2
    )


    canvas_height = (
        PHOTO_HEIGHT * 4
        + PADDING * 5
    )


    # --------------------------------------
    # Create canvas
    # --------------------------------------

    canvas = Image.new(
        "RGB",
        (
            canvas_width,
            canvas_height
        ),
        BACKGROUND_COLOR
    )


    # --------------------------------------
    # Paste photos
    # --------------------------------------

    for index, image in enumerate(
        prepared_images
    ):

        x = PADDING

        y = (
            PADDING
            + index * (
                PHOTO_HEIGHT
                + PADDING
            )
        )


        canvas.paste(
            image,
            (
                x,
                y
            )
        )


    # --------------------------------------
    # Save output
    # --------------------------------------

    output_path = (
        OUTPUT_DIR
        / "photostrip.jpg"
    )


    canvas.save(
        output_path,
        "JPEG",
        quality=95
    )


    return output_path