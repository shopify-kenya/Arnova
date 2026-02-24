#!/usr/bin/env python3
"""
Fetch free product images from Unsplash API
"""

import sys
from pathlib import Path

import requests
from decouple import config


def fetch_product_image(product_name, save_path="public"):
    """
    Fetch a free product image from Unsplash based on product name

    Args:
        product_name: Name of the product to search for
        save_path: Directory to save the image

    Returns:
        str: Path to the saved image or None if failed
    """
    # Get Unsplash API key from environment
    access_key = config("UNSPLASH_ACCESS_KEY", default="")

    if not access_key:
        print("⚠️  No UNSPLASH_ACCESS_KEY found in .env")
        print("💡 Get a free API key from https://unsplash.com/developers")
        return None

    # Search for images
    search_url = "https://api.unsplash.com/search/photos"
    params = {
        "query": product_name,
        "per_page": 1,
        "orientation": "portrait",
        "client_id": access_key,
    }

    try:
        print("🔍 Searching for '{}' images...".format(product_name))
        response = requests.get(search_url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        if not data.get("results"):
            print(f"❌ No images found for '{product_name}'")
            return None

        # Get the first image
        image_data = data["results"][0]
        image_url = image_data["urls"]["regular"]
        photographer = image_data["user"]["name"]

        print(f"✅ Found image by {photographer}")

        # Download the image
        print("⬇️  Downloading image...")
        img_response = requests.get(image_url, timeout=30)
        img_response.raise_for_status()

        # Create filename from product name
        filename = f"{product_name.lower().replace(' ', '-')}.jpg"
        filepath = Path(save_path) / filename

        # Save the image
        with open(filepath, "wb") as f:
            f.write(img_response.content)

        print(f"💾 Saved to: {filepath}")

        # Return the web path
        return f"/{filename}"

    except requests.RequestException as e:
        print(f"❌ Error fetching image: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None


def fetch_multiple_images(product_name, count=3, save_path="public"):
    """
    Fetch multiple product images

    Args:
        product_name: Name of the product to search for
        count: Number of images to fetch
        save_path: Directory to save images

    Returns:
        list: List of image paths
    """
    access_key = config("UNSPLASH_ACCESS_KEY", default="")

    if not access_key:
        print("⚠️  No UNSPLASH_ACCESS_KEY found in .env")
        return []

    search_url = "https://api.unsplash.com/search/photos"
    params = {
        "query": product_name,
        "per_page": count,
        "orientation": "portrait",
        "client_id": access_key,
    }

    try:
        print("🔍 Searching for {} '{}' images...".format(count, product_name))
        response = requests.get(search_url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        results = data.get("results", [])

        if not results:
            print(f"❌ No images found for '{product_name}'")
            return []

        image_paths = []

        for idx, image_data in enumerate(results[:count]):
            image_url = image_data["urls"]["regular"]
            photographer = image_data["user"]["name"]

            print(f"✅ Image {idx + 1} by {photographer}")

            # Download the image
            img_response = requests.get(image_url, timeout=30)
            img_response.raise_for_status()

            # Create filename
            filename = f"{product_name.lower().replace(' ', '-')}-{idx + 1}.jpg"
            filepath = Path(save_path) / filename

            # Save the image
            with open(filepath, "wb") as f:
                f.write(img_response.content)

            print(f"💾 Saved to: {filepath}")
            image_paths.append(f"/{filename}")

        return image_paths

    except Exception as e:
        print(f"❌ Error: {e}")
        return []


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fetch_product_images.py <product_name> [count]")
        print("Example: python fetch_product_images.py 'leather wallet' 3")
        sys.exit(1)

    product_name = sys.argv[1]
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 1

    if count == 1:
        result = fetch_product_image(product_name)
        if result:
            print(f"\n✅ Image URL: {result}")
    else:
        results = fetch_multiple_images(product_name, count)
        if results:
            print("\n✅ Image URLs:")
            for url in results:
                print(f"   {url}")
