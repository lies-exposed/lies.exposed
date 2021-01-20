require("tsconfig-paths").register()

import * as fs from "fs"
import * as path from "path"
import Avatars from "@dicebear/avatars"
import avataaarsSprites from "@dicebear/avatars-avataaars-sprites"
import botttsSprites from "@dicebear/avatars-bottts-sprites"
import { pipe } from "fp-ts/lib/pipeable"
import * as A from "fp-ts/lib/Array"

const options = {
  r: 50,
}
const botAvatars = new Avatars(botttsSprites, options)
const avataaars = new Avatars(avataaarsSprites, options)

pipe(
  A.range(0, 10),
  A.map((n) => {
    const actorName = `actor-${n}`
    fs.writeFileSync(
      path.resolve(
        process.cwd(),
        `src/mock-data/assets/actors/${actorName}.svg`
      ),
      avataaars.create(actorName)
    )

    const groupName = `group-${n}`
    fs.writeFileSync(
      path.resolve(
        process.cwd(),
        `src/mock-data/assets/groups/${groupName}.svg`
      ),
      botAvatars.create(groupName)
    )
  })
)
