import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Item {
  label: string;
  to?: string;
  icon: React.ElementType;
  children?: Item[];
}

export const SidebarItem = ({ item }: { item: Item }) => {
  const location = useLocation();
  const hasChildren = !!item.children;

  const isChildActive = item.children?.some((c) =>
    location.pathname.startsWith(c.to!)
  );

  const [open, setOpen] = useState(isChildActive);

  if (!hasChildren) {
    return (
      <NavLink
        to={item.to!}
        className={({ isActive }) =>
          `ui-sidebar-item ${
            isActive ? "ui-sidebar-item-active" : "ui-sidebar-item-default"
          }`
        }
      >
        <item.icon className="w-4 h-4" />
        {item.label}
      </NavLink>
    );
  }

  return (
    <div>
      {/* Parent */}
      <button
        onClick={() => setOpen(!open)}
        className={`ui-sidebar-item ui-sidebar-parent ${
          isChildActive ? "ui-sidebar-item-active" : "ui-sidebar-item-default"
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-4 h-4" />
          {item.label}
        </div>

        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Children */}
      {open && (
        <div className="ui-sidebar-children">
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to!}
              className={({ isActive }) =>
                `ui-sidebar-item ${
                  isActive
                    ? "ui-sidebar-item-active"
                    : "ui-sidebar-item-default"
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};
