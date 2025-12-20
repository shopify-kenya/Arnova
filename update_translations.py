#!/usr/bin/env python3
"""
Update all components to use the translation system
"""
import re
from pathlib import Path


def find_hardcoded_strings(file_path):
    """Find hardcoded strings that should be translated"""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Pattern to find hardcoded strings in JSX
    patterns = [
        r">\s*([A-Z][a-zA-Z\s]+)\s*<",  # Text between tags
        r'placeholder="([^"]+)"',  # Placeholder attributes
        r'title="([^"]+)"',  # Title attributes
        r'alt="([^"]+)"',  # Alt attributes
    ]

    hardcoded_strings = []
    for pattern in patterns:
        matches = re.findall(pattern, content)
        hardcoded_strings.extend(matches)

    # Filter out common non-translatable strings
    exclude_patterns = [
        r"^\d+$",  # Numbers only
        r"^[A-Z]{2,}$",  # All caps (likely constants)
        r"^[a-z-]+$",  # Kebab case (likely CSS classes)
        r"^\$\d+",  # Prices
        r"^#[0-9a-fA-F]+$",  # Hex colors
        r"^https?://",  # URLs
        r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",  # Emails
    ]

    filtered_strings = []
    for string in hardcoded_strings:
        should_exclude = False
        for exclude_pattern in exclude_patterns:
            if re.match(exclude_pattern, string.strip()):
                should_exclude = True
                break

        if not should_exclude and len(string.strip()) > 1:
            filtered_strings.append(string.strip())

    return list(set(filtered_strings))  # Remove duplicates


def scan_components():
    """Scan all components for hardcoded strings"""
    components_dir = Path("components")
    app_dir = Path("app")

    all_files = []

    # Scan components directory
    if components_dir.exists():
        all_files.extend(components_dir.rglob("*.tsx"))
        all_files.extend(components_dir.rglob("*.ts"))

    # Scan app directory
    if app_dir.exists():
        all_files.extend(app_dir.rglob("*.tsx"))
        all_files.extend(app_dir.rglob("*.ts"))

    hardcoded_strings_by_file = {}

    for file_path in all_files:
        if file_path.name.endswith((".tsx", ".ts")):
            strings = find_hardcoded_strings(file_path)
            if strings:
                hardcoded_strings_by_file[str(file_path)] = strings

    return hardcoded_strings_by_file


def suggest_translation_keys(strings):
    """Suggest translation keys for hardcoded strings"""
    suggestions = {}

    for string in strings:
        # Convert to translation key format
        key = string.lower()
        key = re.sub(r"[^a-zA-Z0-9\s]", "", key)  # Remove special chars
        key = re.sub(r"\s+", " ", key).strip()  # Normalize spaces
        key = key.replace(" ", ".")  # Replace spaces with dots

        # Add appropriate prefix based on content
        if any(
            word in string.lower()
            for word in ["login", "signup", "register", "password", "email"]
        ):
            key = f"auth.{key}"
        elif any(
            word in string.lower()
            for word in ["home", "about", "contact", "profile", "cart"]
        ):
            key = f"nav.{key}"
        elif any(
            word in string.lower()
            for word in ["search", "filter", "sort", "price", "add", "remove"]
        ):
            key = f"common.{key}"
        elif any(
            word in string.lower()
            for word in ["product", "category", "brand", "size", "color"]
        ):
            key = f"product.{key}"
        else:
            key = f"common.{key}"

        suggestions[string] = key

    return suggestions


def generate_translation_report():
    """Generate a report of hardcoded strings that need translation"""
    print("Scanning for hardcoded strings...")
    print("=" * 50)

    hardcoded_strings_by_file = scan_components()

    if not hardcoded_strings_by_file:
        print("No hardcoded strings found!")
        return

    all_strings = set()
    for strings in hardcoded_strings_by_file.values():
        all_strings.update(strings)

    suggestions = suggest_translation_keys(all_strings)

    print(
        f"Found {len(all_strings)} unique hardcoded strings across "
        f"{len(hardcoded_strings_by_file)} files:"
    )
    print()

    # Group by file
    for file_path, strings in hardcoded_strings_by_file.items():
        print(f"{file_path}:")
        for string in strings:
            suggested_key = suggestions.get(string, "unknown.key")
            print(f"  • '{string}' → t('{suggested_key}')")
        print()

    # Generate translation keys to add
    print("Suggested translation keys to add to language-provider.tsx:")
    print("=" * 50)

    for string, key in sorted(suggestions.items()):
        print(f'    "{key}": "{string}",')

    print()
    print("To fix these issues:")
    print("1. Add the suggested translation keys to your language provider")
    print("2. Replace hardcoded strings with t('key') calls")
    print("3. Import and use the useLanguage hook in components")
    print("4. Add Swahili translations for all new keys")


def main():
    """Main function"""
    print("Translation Update Tool")
    print("=" * 50)

    generate_translation_report()


if __name__ == "__main__":
    main()
