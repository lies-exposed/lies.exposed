require("tsconfig-paths").register()

import * as fs from "fs"
import * as path from 'path'
import Avatars from "@dicebear/avatars"
import avataaarsSprites from "@dicebear/avatars-avataaars-sprites"
import botttsSprites from "@dicebear/avatars-bottts-sprites"

const options = {
  r: 50,
}
const botAvatars = new Avatars(botttsSprites, options)
const avataaars = new Avatars(avataaarsSprites, options)

Array.from([]).forEach((username ) => {
  fs.writeFileSync(
    path.resolve(process.cwd(),
    `src/mock-data/assets/actors/${username}.svg`),
    avataaars.create(username)
  )
})

Array.from([]).forEach((name ) =>
  fs.writeFileSync(
    path.resolve(process.cwd(), `../src/mock-data/assets/groups/${name}.svg`),
    botAvatars.create(name)
  )
)
