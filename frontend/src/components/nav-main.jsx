import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({ items, currentPage, onNavigate }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-orange-600/80 font-semibold">Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const pageKey = item.url.slice(1)
          const isActive = currentPage === pageKey
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    asChild
                    className={isActive ? "bg-gradient-to-r from-orange-500/10 to-orange-400/5 text-orange-700 border-l-2 border-orange-500 group-data-[collapsible=icon]:justify-center" : "hover:bg-orange-50/50 hover:text-orange-600 group-data-[collapsible=icon]:justify-center"}
                  >
                    <a
                      href={item.url}
                      onClick={(e) => onNavigate?.(e, item.url)}
                      className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                    >
                      {item.icon && (
                        <item.icon 
                          className={`transition-all duration-200 ${
                            isActive 
                              ? "text-orange-600" 
                              : "text-muted-foreground group-hover/collapsible:text-orange-600"
                          } size-4 group-data-[collapsible=icon]:size-5`} 
                        />
                      )}
                      <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-200">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent />
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
