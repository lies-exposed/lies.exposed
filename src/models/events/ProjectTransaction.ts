import { BaseFrontmatter } from '@models/Frontmatter';
import { markdownRemark } from '@models/Markdown';
import { ProjectFrontmatter } from '@models/Project';
import { TransactionFrontmatter } from '@models/Transaction';
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString';

export const PROJECT_TRANSACTION = "ProjectTransaction"
export const ProjectTransaction = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal("ProjectTransaction"),
    project: ProjectFrontmatter,
    transaction: TransactionFrontmatter,
    date: DateFromISOString,
  },
  PROJECT_TRANSACTION
)


export type ProjectTransaction = t.TypeOf<typeof ProjectTransaction>

export const ProjectTransactionMD = markdownRemark(ProjectTransaction, 'ProjectTransactionMD');
export type ProjectTransactionMD = t.TypeOf<typeof ProjectTransactionMD>