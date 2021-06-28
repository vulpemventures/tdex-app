#!/bin/bash

set -e

# Build
cd android
chmod +x ./gradlew
./gradlew assemble
cd ..

# Sign
apksigner sign \
  --ks ./tdex-app-release-key.keystore \
  --out ./android/app/build/outputs/apk/release/app-release-signed.apk \
  ./android/app/build/outputs/apk/release/app-release-unsigned.apk
