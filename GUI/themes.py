class Theme:
    def __init__(self, bg, abg, tab_bg, fg="black", btn_bg="pink", entry_bg="white", scroll_bg="#FF92A5", font=("Consolas", 12, "bold")):
        self.bg = bg
        self.abg = abg
        self.fg = fg
        self.tab_bg = tab_bg
        self.btn_bg = btn_bg
        self.entry_bg = entry_bg
        self.scroll_bg = scroll_bg
        self.font = font
    
light_theme = Theme("pink", "#FF92A5", "lightgray")
dark_theme = Theme("#282828", "#FF92A5", "#818181", "pink", entry_bg="#484848", scroll_bg="#484848")