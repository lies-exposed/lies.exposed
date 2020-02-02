import { Link } from "gatsby"
import * as React from "react"
import BMenu from "react-bulma-components/lib/components/menu"

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
  return (
    <BMenu>
      {props.sections.map(({ label, items }, i) => (
        <div key={i}>
          {label !== undefined ? <p className="menu-label">{label}</p> : null}
          <BMenu.List>
            {items.map(i => (
              <BMenu.List.Item key={i.id} renderAs="div">
                <Link to={i.path}>{i.title}</Link>
              </BMenu.List.Item>
            ))}
          </BMenu.List>
        </div>
      ))}
    </BMenu>
  )
}

export default Menu
