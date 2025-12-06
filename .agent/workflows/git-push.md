---
description: Push changes to GitHub 
---

# Git Push Workflow

// turbo-all

1. Stage all changes:
```
.\git\bin\git.exe add -A
```

2. Commit with message:
```
.\git\bin\git.exe commit -m "YOUR_MESSAGE"
```

3. Push to GitHub:
```
.\git\bin\git.exe push origin main
```

## Notes
- Git is located at `Harbor\git\bin\git.exe`
- If push fails, user may need to authenticate manually
- Use `.\git\bin\git.exe status` to check status
