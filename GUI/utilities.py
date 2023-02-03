import tkinter as tk
from themes import dark_theme,light_theme

# Buttons that are unassociated with another label
class Buttons:
    def __init__(self, start_button=None, next_button=None, clear_button=None):
        self.start_button = start_button
        self.next_button = next_button
        self.clear_button = clear_button

    def __repr__(self) -> str:
        return "start_button: %s\n" \
               "next_button: %s\n"  % (self.start_button, self.next_button)
        
# Associates a button with a particular label
class ButtonLabel:
    def __init__(self, name, label, label_text, edit_button=None, delete_button=None):
        self.name = name
        self.label = label
        self.label_text = label_text
        self.edit_button = edit_button
        self.delete_button = delete_button

    def __repr__(self) -> str:
        return "name: %s\n" \
               "label: %s \n" \
               "label_text: %s\n" \
               "btn_edit: %s\n" \
               "btn_delete: %s\n"  % (self.name, self.label, self.label_text, self.edit_button, self.delete_button)

def create_checkbox(frame, text, variable, command, bg=dark_theme.bg, fg=dark_theme.fg, activebackground=dark_theme.bg, activeforeground=dark_theme.fg, selectcolor=dark_theme.entry_bg, height=1, width=10, font=("Consolas", 11, "bold"), side="top", anchor="w"):
    checkbox = tk.Checkbutton(frame, text=text, variable=variable, command=command, bg=bg, fg=fg, activebackground=activebackground, activeforeground=activeforeground, selectcolor=selectcolor, height=height, width=width, font=font)
    checkbox.pack(side=side, anchor=anchor)
    return checkbox

def handle_checkbox(chk_broadcaster, chk_moderators, broadcaster_permission, moderators_permission, everyone_permission):
    if everyone_permission.get():
        print("reached everyone_perm")
        broadcaster_permission.set(1)
        moderators_permission.set(1)
        chk_broadcaster.config(state='disabled')
        chk_moderators.config(state='disabled')
    else:
        print("Reached else statement")
        broadcaster_permission.set(0)
        moderators_permission.set(0)
        chk_broadcaster.config(state='normal')
        chk_moderators.config(state='normal')