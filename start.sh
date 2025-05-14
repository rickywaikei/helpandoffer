#!/bin/bash

# Start script for Help and Offer Platform
# This script suppresses Node.js warnings during startup

# Suppress Node.js warnings
NODE_OPTIONS="--no-warnings" node app.js
