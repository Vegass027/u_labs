"use client"

import { useState } from "react"
import { MenuBar } from "@/components/MenuBar"
import { FileText, LogOut, User } from "lucide-react"

export default function ClientMenuBar() {
  const [activeItem, setActiveItem] = useState<string>("Заявки")

  const menuItems = [
    {
      icon: FileText,
      label: "Заявки",
      href: "/client",
      gradient:
        "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      iconColor: "text-blue-500",
    },
    {
      icon: User,
      label: "Профиль",
      href: "#",
      gradient:
        "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
      iconColor: "text-red-500",
    },
    {
      icon: LogOut,
      label: "Выйти",
      href: "#",
      gradient:
        "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
      iconColor: "text-green-500",
    },
  ]

  const handleItemClick = async (label: string) => {
    setActiveItem(label)
    const item = menuItems.find((i) => i.label === label)

    if (item?.label === "Выйти") {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      })
      if (response.ok) {
        window.location.href = "/login"
      }
    } else if (item?.href && item.href !== "#") {
      window.location.href = item.href
    }
  }

  return (
    <MenuBar
      items={menuItems}
      activeItem={activeItem}
      onItemClick={handleItemClick}
    />
  )
}
