# 🏦 Precious Metals Vault

A privacy-first mobile application for tracking physical precious metal holdings.

Precious Metals Vault allows users to securely record and manage their gold, silver, and other physical commodity holdings while maintaining ownership and control of their own data.

Unlike traditional portfolio trackers that rely on centralized cloud databases and third-party custody of financial information, Precious Metals Vault is designed around a **self-hosted, privacy-focused architecture** where users control their own data.

---

## 🔐 Privacy First Design

Physical precious metals are often chosen because they provide financial sovereignty outside of traditional banking systems.

The goal of Precious Metals Vault is to extend that philosophy into digital record keeping.

Your holdings data should not need to live on:

- ❌ Corporate cloud servers
- ❌ Centralized financial platforms
- ❌ Third-party analytics systems
- ❌ Accounts tied to your identity

Instead, your data is stored on infrastructure you control.

---

# 🏗️ Architecture

Precious Metals Vault uses a self-hosted backend model:

                Mobile App
                    |
                    |
              Tailscale VPN
                    |
                    |
          Self Hosted Backend
                    |
                    |
          Encrypted SQLite Database
                    |
                    |
          User Owned Hardware


The user runs the backend on their own device:

- Raspberry Pi
- Home server
- Linux mini PC
- Other low-cost computing hardware

The mobile application communicates with the backend securely through a private Tailscale network.

---

# 📱 Frontend

This repository contains the mobile application frontend.

Built with:

- React Native
- Expo
- React Navigation
- AsyncStorage
- Native mobile components

The application provides:

- Precious metal inventory tracking
- Portfolio valuation
- Spot price tracking
- Purchase history
- Metal weight calculations
- Privacy-focused account management
- Secure authentication

---

# 🪙 Supported Assets

The app is designed around physical holdings including:

- Gold
- Silver
- Platinum
- Palladium
- Other physical commodities

Users can track:

- Product type
- Quantity
- Weight
- Purity
- Purchase cost
- Current estimated value
- Portfolio performance

---

# 🔒 Authentication

Current authentication includes:

- Username/password authentication
- Password hashing
- JWT authentication
- Two-factor authentication (TOTP)

Future authentication plans include:

- Sign-In With Ethereum (SIWE)
- Wallet-based identity
- Hardware wallet integration
- Decentralized identity options

The goal is to allow users to optionally associate their vault with a crypto wallet while maintaining control of their private data.

---

# 🌐 Networking

The application uses:

## Tailscale VPN

The backend is accessed through a private encrypted network using:

https://tailscale.com

Benefits:

- No public server exposure
- No port forwarding
- Encrypted device-to-device communication
- Works across home networks and mobile connections

Example:




iPhone
|
|
Tailscale Network
|
|
Raspberry Pi
|
|
Local Vault Database



---

# 🖥️ Backend

The backend repository is separate from this frontend.

The backend provides:

- API services
- Authentication
- Database management
- Price retrieval
- Portfolio calculations

The backend uses:

- Node.js
- Express
- SQLite
- Encrypted local storage

The database is designed to remain under the user's control.

---

# 🚀 Self Hosting

The long-term goal is to make installation simple for non-technical users.

Planned deployment options:

## Option 1: Docker

A user could run:

```bash
docker run precious-metals-vault

and have their private vault backend deployed automatically.

Option 2: Installation Script

A guided Linux installer:

curl install-vault.sh | bash

would configure:

Database
Backend service
Authentication
Tailscale connection

🛣️ Roadmap
Completed

✅ Mobile application frontend
✅ Self-hosted backend architecture
✅ Local SQLite database
✅ Tailscale private networking
✅ JWT authentication
✅ Two-factor authentication
✅ Portfolio calculations
✅ Spot price integration

Planned

🔲 Docker deployment
🔲 Automated Linux installation
🔲 Hardware wallet integration
🔲 SIWE authentication
🔲 Multi-user vault support
🔲 Encrypted backups
🔲 Offline mode
🔲 Additional commodity support
🔲 Transaction import/export

🎯 Project Philosophy

Precious Metals Vault is built around a simple idea:

Your financial records should belong to you.

Physical assets provide financial independence. The software used to track those assets should provide the same level of independence.

This project explores what a modern self-sovereign financial tracking system can look like:

User-owned infrastructure
Privacy by design
Open source software
Minimal dependence on centralized services
🤝 Contributing

Contributions, ideas, and security reviews are welcome.

Areas of interest:

Security improvements
Self-hosting improvements
Mobile UX
Cryptographic identity systems
Hardware integrations
⚠️ Disclaimer

This software is for personal asset tracking and informational purposes only.

It does not provide financial advice, custody services, or investment recommendations.

Users are responsible for securing their own hardware, credentials, and backups.
