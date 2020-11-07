import { ByGroupOrActor } from '@models/Common/ByGroupOrActor'
import { Impact } from '@models/Common/Impact'
import { BaseFrontmatter } from '@models/Frontmatter'
import { ImageFileNode } from '@models/Image'
import { ProjectFrontmatter } from '@models/Project'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'

export const PROJECT_IMPACT = 'ProjectImpact'

export const ProjectImpact = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal(PROJECT_IMPACT),
    project: ProjectFrontmatter,
    date: DateFromISOString,
    approvedBy: t.array(ByGroupOrActor),
    executedBy: t.array(ByGroupOrActor),
    images: t.array(ImageFileNode),
    impact: Impact,
  },
  PROJECT_IMPACT
)

export type ProjectImpact = t.TypeOf<typeof ProjectImpact>