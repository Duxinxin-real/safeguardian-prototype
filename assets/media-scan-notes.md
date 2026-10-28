# Sensitive Media prototype

Granting photo access starts an automatic scan animation (48 simulated photos), followed by four predetermined review items. The included landscape and generated UI images are harmless fixtures, not actual sensitive-content classifications.

Review supports blur/reveal, selection, hide/unhide, deletion confirmation, and a separate passcode-protected backup flow with create/confirm/unlock states. Backup keeps originals. Deleting review items retains backup copies. Leaving the feature or backgrounding locks backup access.

All changes are session-only simulation. No system photo library is read or modified; no real AI classifier, encrypted storage, native Hidden album integration, or durable backup is implemented. The passcode is held in memory for interaction testing only. Do not use real private photos or a real password. Reload resets all state.
