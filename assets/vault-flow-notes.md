# Vault HTML interaction prototype

Media albums support full-viewport photo/video preview (Close or Escape to exit), multi-selection and confirmed removal. Removing an imported item only removes the in-memory Vault preview, never the original device file. Video playback uses native controls. Decoy sample removal remains isolated from private media.

Approved references: vault-intro.png, vault-icons.png, vault-tutorial.png and the existing vault-reference.png. Illustration regions reuse the approved artwork without redrawing. Text, controls and navigation are HTML.

Flow: introduction → optional appearance choice → two-passcode tutorial → required main code and confirmation → optional decoy code and confirmation → private space. All screens retain the Vault heading and selected Vault tab. Back, skip, mismatch feedback, duplicate-code rejection and keyboard entry are supported.

Locking, switching tabs or backgrounding the document returns a configured Vault to the code entry screen. The main code opens settings and private media; the decoy code opens a separate landscape view without settings or private imports. Settings allow changing the main code, creating/replacing a decoy code and selecting an appearance. No calculator functionality is included.

This is an HTML prototype, not encrypted storage. Passcodes and imported media remain in memory only and reset on reload. Imported files are previewed through local object URLs and are not uploaded or removed from the source device. Appearance selection does not change the installed device app icon. Native icon replacement, durable encrypted media storage, secure credential handling, recovery and operating-system integration are not implemented here. Do not use real passwords or confidential media for testing.

Validation: JavaScript syntax check, state-transition tests for confirmation/mismatch/duplicate rejection/main and decoy unlock/change passcode, and browser visual checks for the four onboarding screens.
