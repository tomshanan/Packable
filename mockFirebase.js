const fs = require("fs")

const path = "./src/app/app.component.ts"
const contentBefore = fs.readFileSync(path).toString()
const newContent = contentBefore.replace(
  "import { firebaseSettings } from './user/firebase-settings.object';",
  "const firebaseSettings = {}"
)
fs.writeFileSync(path, newContent) 