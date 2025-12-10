#!/usr/bin/env python3
"""
Generate self-signed SSL certificate for HTTPS development
"""
import os
import subprocess
import sys


def generate_ssl_cert():
    """Generate self-signed SSL certificate for localhost"""
    cert_dir = "ssl"

    # Create ssl directory if it doesn't exist
    if not os.path.exists(cert_dir):
        os.makedirs(cert_dir)

    cert_file = os.path.join(cert_dir, "cert.pem")
    key_file = os.path.join(cert_dir, "key.pem")

    # Check if certificates already exist
    if os.path.exists(cert_file) and os.path.exists(key_file):
        print("SSL certificates already exist!")
        return cert_file, key_file

    # Generate self-signed certificate
    cmd = [
        "openssl",
        "req",
        "-x509",
        "-newkey",
        "rsa:4096",
        "-keyout",
        key_file,
        "-out",
        cert_file,
        "-days",
        "365",
        "-nodes",
        "-subj",
        "/C=US/ST=State/L=City/O=Arnova/CN=localhost",
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"SSL certificate generated: {cert_file}")
        print(f"SSL private key generated: {key_file}")
        return cert_file, key_file
    except subprocess.CalledProcessError as e:
        print(f"Error generating SSL certificate: {e}")
        sys.exit(1)
    except FileNotFoundError:
        msg = (
            "OpenSSL not found. Please install OpenSSL to "
            "generate SSL certificates."
        )
        print(msg)
        print("On Ubuntu/Debian: sudo apt-get install openssl")
        print("On macOS: brew install openssl")
        sys.exit(1)


if __name__ == "__main__":
    generate_ssl_cert()
