# Future Module: Virtual Try-On (Clothing/Mannequin)

This project keeps the current hair module lightweight and stable for free-tier deployment.
The clothing/mannequin module is intentionally deferred.

## Candidate Models (Future)

- IDM-VTON
- OOTDiffusion

## Why Not Integrated Now

- They require heavier compute and memory than current free deployment constraints allow.
- Typical pipeline needs:
  - garment segmentation / parsing
  - human parsing
  - pose estimation
  - additional image synthesis stages
- Integrating this now would increase infrastructure complexity and risk production stability.

## Current Priority

The current modular release prioritizes:

- stable local hair simulation fallback
- predictable backend behavior without paid providers
- resilient frontend UX without fatal errors when advanced providers are unavailable

This keeps the system deliverable and defendable while leaving a clear technical path for future try-on expansion.
