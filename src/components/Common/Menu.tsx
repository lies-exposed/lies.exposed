import * as React from "react"
import BMenu from "react-bulma-components/lib/components/menu"
import { Link } from "gatsby"

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
const Menu = (props: MenuProps) => {
  return (
    <BMenu>
      {props.sections.map(({ label, items }) => (
        <>
          {label && <p className="menu-label">{label}</p>}
          <BMenu.List>
            {items.map(i => (
              <BMenu.List.Item key={i.id} renderAs="div">
                <Link to={i.path}>{i.title}</Link>
              </BMenu.List.Item>
            ))}
          </BMenu.List>
        </>
      ))}
    </BMenu>
  )
}

export default Menu
