import * as React from "react"
import BMenu from "react-bulma-components/lib/components/menu"
import { Link } from "gatsby"

interface MenuItem {
  id: string
  path: string
  title: string
}

interface MenuProps {
  items: MenuItem[]
}
const Menu = (props: MenuProps) => {
  return (
    <BMenu>
      <BMenu.List>
        {props.items.map(i => (
          <BMenu.List.Item key={i.id} renderAs="div">
            <Link to={i.path}>{i.title}</Link>
          </BMenu.List.Item>
        ))}
      </BMenu.List>
    </BMenu>
  )
}

export default Menu
