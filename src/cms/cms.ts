import CMS from "netlify-cms-app"
import { config } from "./config/index"
import { ActorPreview } from "./previews/ActorPreview"
import { ArticlePreview } from "./previews/ArticlePreview"
import { EventPreview } from "./previews/EventPreview"
import { GroupPreview } from "./previews/GroupPreview"
import { PagePreview } from "./previews/PagePreview"
import { TopicPreview } from "./previews/TopicPreview"
import {UUIDWidgetControl, UUIDWidgetPreview} from './widgets/UUID'
import { withStyletron } from "./withStyletron"

CMS.registerWidget('uuid', UUIDWidgetControl, UUIDWidgetPreview)

// eslint-disable-next-line import/no-webpack-loader-syntax, @typescript-eslint/no-var-requires
const styles = require("!css-loader!sass-loader!../scss/main.scss")
CMS.registerPreviewStyle(styles.toString(), { raw: true })
CMS.registerPreviewTemplate("actors", withStyletron(ActorPreview))
CMS.registerPreviewTemplate("articles", withStyletron(ArticlePreview))
CMS.registerPreviewTemplate("groups", withStyletron(GroupPreview))
CMS.registerPreviewTemplate("pages", withStyletron(PagePreview))
CMS.registerPreviewTemplate("topics", withStyletron(TopicPreview))
CMS.registerPreviewTemplate("events", withStyletron(EventPreview))


CMS.init({
  config,
})
