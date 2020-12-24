import { ListItem, ListItemLabel } from "baseui/list"
import { Link } from "gatsby"
import * as React from "react"

interface MenuItem {
  id: string
  path: string
  title: string
}

interface Section {
  label?: string
  items: MenuItem[]
}

interface MenuProps {
  sections: Section[]
}

const Menu: React.FC<MenuProps> = props => {
  const [open, setOpen] = React.useState(false)
  return (
    <ul onClick={() => setOpen(!open)}>
      {props.sections.map(({ label, items }, i) => (
        <>
          {label !== undefined ? <p className="menu-label">{label}</p> : null}
          <ul key={i}>
            {items.map(i => (
              <ListItem key={i.id}>
                <ListItemLabel>
                  <Link to={i.path}>{i.title}</Link>
                </ListItemLabel>
              </ListItem>
            ))}
          </ul>
        </>
      ))}
    </ul>
  )
}

export default Menu
