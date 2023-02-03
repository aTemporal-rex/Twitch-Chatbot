class Theme:
    def __init__(self, bg, abg, tab_bg, fg="black", btn_bg="pink", entry_bg="white", scroll_bg="#FF92A5", start_bg="#5DF15D", start_abg="#86FF70", cancel_bg="#FF92A5", font=("Consolas", 12, "bold")):
        self.bg = bg
        self.abg = abg
        self.fg = fg
        self.tab_bg = tab_bg
        self.btn_bg = btn_bg
        self.entry_bg = entry_bg
        self.scroll_bg = scroll_bg
        self.start_bg = start_bg
        self.start_abg = start_abg
        self.cancel_bg = cancel_bg
        self.font = font
    
light_theme = Theme("pink", "#FF92A5", "lightgray")
dark_theme = Theme(bg="#282828", abg="#FF92A5", tab_bg="#818181", fg="pink", entry_bg="#484848", scroll_bg="#484848")