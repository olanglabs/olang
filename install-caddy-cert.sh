#!/bin/bash

# Detect operating system
OS="$(uname -s)"
CERT_PATH="caddy/root.crt"
CERT_INSTALLED=false

echo "Checking for Caddy root certificate..."

# Check if certificate exists
if [ ! -f "$CERT_PATH" ]; then
    echo "Certificate not found at $CERT_PATH. Will check again after starting Caddy."
    exit 0
fi

# Function to check if cert is installed on macOS
check_cert_macos() {
    local cert_hash=$(openssl x509 -noout -fingerprint -sha256 -in "$CERT_PATH" | cut -d= -f2 | tr -d ':')
    if security find-certificate -a -Z | grep -q "$cert_hash"; then
        return 0
    else
        return 1
    fi
}

# Function to check if cert is installed on Linux
check_cert_linux() {
    local cert_subject=$(openssl x509 -noout -subject -in "$CERT_PATH" | cut -d= -f2-)
    
    # Check in different trust stores based on distribution
    if [ -d "/etc/pki/ca-trust/source/anchors" ]; then
        # RHEL/CentOS/Fedora
        if grep -q "$cert_subject" /etc/pki/ca-trust/source/anchors/* 2>/dev/null; then
            return 0
        fi
    elif [ -d "/usr/local/share/ca-certificates" ]; then
        # Debian/Ubuntu
        if grep -q "$cert_subject" /usr/local/share/ca-certificates/* 2>/dev/null; then
            return 0
        fi
    elif [ -d "/etc/ca-certificates/trust-source/anchors" ]; then
        # Arch Linux
        if grep -q "$cert_subject" /etc/ca-certificates/trust-source/anchors/* 2>/dev/null; then
            return 0
        fi
    fi
    
    return 1
}

# Function to check if cert is installed on Windows (using WSL)
check_cert_windows() {
    # Windows detection is limited when running in WSL
    # This is a simple check that will work in most cases
    if command -v powershell.exe >/dev/null 2>&1; then
        local cert_subject=$(openssl x509 -noout -subject -in "$CERT_PATH" | cut -d= -f2-)
        if powershell.exe -Command "Get-ChildItem -Path Cert:\LocalMachine\Root | Where-Object {\$_.Subject -like '*$cert_subject*'}" | grep -q "ThumbPrint"; then
            return 0
        fi
    fi
    return 1
}

# Install certificate on macOS
install_cert_macos() {
    echo "Installing certificate to macOS trust store..."
    sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERT_PATH"
    echo "Certificate installed successfully!"
}

# Install certificate on Linux
install_cert_linux() {
    echo "Installing certificate to Linux trust store..."
    
    # Install to the appropriate trust store based on distribution
    if [ -d "/etc/pki/ca-trust/source/anchors" ]; then
        # RHEL/CentOS/Fedora
        sudo cp "$CERT_PATH" /etc/pki/ca-trust/source/anchors/
        sudo update-ca-trust
    elif [ -d "/usr/local/share/ca-certificates" ]; then
        # Debian/Ubuntu
        sudo cp "$CERT_PATH" /usr/local/share/ca-certificates/caddy-local-ca.crt
        sudo update-ca-certificates
    elif [ -d "/etc/ca-certificates/trust-source/anchors" ]; then
        # Arch Linux
        sudo cp "$CERT_PATH" /etc/ca-certificates/trust-source/anchors/caddy-local-ca.crt
        sudo trust extract-compat
    else
        echo "Unknown Linux distribution. Please manually install the certificate at $CERT_PATH"
        return 1
    fi
    
    echo "Certificate installed successfully!"
}

# Install certificate on Windows (using WSL)
install_cert_windows() {
    echo "Installing certificate to Windows trust store..."
    
    if command -v powershell.exe >/dev/null 2>&1; then
        # Using PowerShell to add the certificate (requires admin privileges)
        cp "$CERT_PATH" ./root.crt
        powershell.exe -Command "Start-Process -FilePath 'certutil.exe' -ArgumentList '-addstore', 'Root', '$(wslpath -w ./root.crt)' -Verb RunAs"
        rm ./root.crt
        echo "Certificate installation initiated. Please approve the UAC prompt if it appears."
    else
        echo "Cannot detect PowerShell. Please manually install the certificate at $CERT_PATH"
        return 1
    fi
}

# Check and install based on OS
case "$OS" in
    Darwin)
        if check_cert_macos; then
            echo "Certificate is already installed in macOS trust store."
            CERT_INSTALLED=true
        else
            install_cert_macos
            CERT_INSTALLED=true
        fi
        ;;
        
    Linux)
        # Check if running in WSL
        if grep -q Microsoft /proc/version; then
            if check_cert_windows; then
                echo "Certificate is already installed in Windows trust store."
                CERT_INSTALLED=true
            else
                install_cert_windows
                CERT_INSTALLED=true
            fi
        else
            if check_cert_linux; then
                echo "Certificate is already installed in Linux trust store."
                CERT_INSTALLED=true
            else
                install_cert_linux
                CERT_INSTALLED=true
            fi
        fi
        ;;
        
    MINGW*|MSYS*)
        # Native Windows Git Bash
        if check_cert_windows; then
            echo "Certificate is already installed in Windows trust store."
            CERT_INSTALLED=true
        else
            install_cert_windows
            CERT_INSTALLED=true
        fi
        ;;
        
    *)
        echo "Unsupported operating system: $OS"
        echo "Please manually install the certificate at $CERT_PATH"
        ;;
esac

if [ "$CERT_INSTALLED" = true ]; then
    echo "Caddy certificate installation checked."
else
    echo "Please manually install the certificate at $CERT_PATH"
fi 