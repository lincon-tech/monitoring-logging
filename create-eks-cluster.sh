#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Create EKS cluster
eksctl create cluster \
  --name monitoring-logging \
  --version 1.28 \
  --region us-east-1 \                           #CHNAGE TO YOUR PREFERED REGION
  --nodegroup-name workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4