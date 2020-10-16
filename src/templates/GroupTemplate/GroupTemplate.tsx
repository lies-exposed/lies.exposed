import { GroupPageContent } from "@components/GroupPageContent"
import { EventMD } from "@models/event"
import { GroupMD } from "@models/group"
import React from "react"

export interface GroupTemplatePageProps {
  events: EventMD[]
  group: GroupMD
}

const GroupTemplate: React.FC<GroupTemplatePageProps> = ({ group, events }) => {
  return (
    <GroupPageContent
      {...group}
      events={events}
      onMemberClick={async (a) => {
        
      }}
    />
  )
}

export default GroupTemplate
