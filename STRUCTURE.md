# Project Structure

```
/workspace/
├── README.md                 # Main project documentation
├── CONTRIBUTING.md          # Contribution guidelines
├── LICENSE                  # License information
├── Makefile                 # Build automation
├── docs/                    # Documentation directory
│   ├── index.md            # Main documentation
│   └── packages/           # Individual package docs
│       ├── bun.md
│       ├── fnm.md
│       ├── kkfileview.md
│       ├── libreoffice-nogui.md
│       ├── nvm.md
│       └── subversion.md
├── packages/               # Container image definitions
│   ├── bun/               # Bun JavaScript runtime
│   │   ├── Dockerfile
│   │   ├── tags.yml
│   │   ├── update.task.js
│   │   └── rootfs/
│   ├── fnm/               # Fast Node Manager
│   │   ├── Dockerfile
│   │   ├── tags.yml
│   │   ├── update.task.js
│   │   └── README.md
│   ├── kkfileview/         # File preview solution
│   │   ├── Dockerfile
│   │   ├── tags.yml
│   │   ├── update.task.js
│   │   └── README.md
│   ├── libreoffice-nogui/  # Headless LibreOffice
│   │   ├── Dockerfile
│   │   ├── tags.yml
│   │   ├── update.task.js
│   │   └── README.md
│   ├── nvm/               # Node Version Manager
│   │   ├── Dockerfile
│   │   ├── tags.yml
│   │   ├── update.task.js
│   │   └── README.md
│   └── subversion/         # Subversion client
│       ├── Dockerfile
│       ├── tags.yml
│       ├── update.task.js
│       └── README.md
├── archives/              # Archived packages
│   ├── cnpmcore/
│   └── matlab-runtime/
├── .github/               # GitHub configuration
│   ├── workflows/         # CI/CD workflows
│   └── scripts/           # Automation scripts
└── .git/                  # Git metadata
```