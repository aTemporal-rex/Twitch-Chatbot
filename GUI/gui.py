#!/usr/bin/env python
import tkinter as tk
from PIL import ImageTk,Image
from tkinter import ttk
from commands import get_commands,delete_command,edit_command,add_command,set_resource_location_commands
from queues import generate_queue_window,get_queue
from themes import light_theme,dark_theme
from utilities import ButtonLabel
from db import get_database
import os

root = tk.Tk()
root.title('BunniSenpaiBot')
root.geometry('950x900')

dbname = get_database()
status_collection = dbname["status"]
queue_collection = dbname["queues"]

canvases = []

def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

def on_closing():
    find_queue = { "name": "Queue" }
    turn_off_queue = { "$set": { "isOn": False } }
    
    status_collection.find_one_and_update(find_queue, turn_off_queue)
    root.destroy()

def resize(event, canvas, scrollable_frame):
     w = scrollable_frame.winfo_reqwidth()
     h = scrollable_frame.winfo_reqheight()
     canvas.itemconfigure(1, width=max(w, event.width), height=max(h, event.height))
     return "break"

def add_new_feature(book, name, style):
    # Create Tab Frames
    frame = tk.Frame(book)

    # Put the Tab Frames into notebook
    book.add(frame, text=name, underline=0)

    # Create canvas inside the Tab Frames
    canvas = tk.Canvas(frame, bg=dark_theme.bg, relief="ridge", highlightthickness=0)
    canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=1)

    # Create ScrollBar inside the Tab Frames
    scrollbar = ttk.Scrollbar(frame, orient=tk.VERTICAL, command=canvas.yview)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    # Set scrollbars to each canvas
    canvas.configure(yscrollcommand=scrollbar.set)

    # Creating internal frame for the tabs
    main_frame = tk.Frame(canvas, bg=dark_theme.bg)
    main_frame.bind('<Configure>', lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
    canvas.create_window((0,0), window=main_frame, anchor="nw")
    canvas.bind("<Configure>", lambda e: resize(e, canvas, main_frame))

    # Allows mousewheel scrolling to work anywhere on window
    set_mousewheel(canvas, lambda event: canvas.yview_scroll(int(-1*(event.delta/120)), "units"))

    # Style each tab so it stretches across top of screen
    style.configure('TNotebook.Tab', width=main_frame.winfo_screenwidth(), font=("Consolas", 15, "bold"), background=dark_theme.tab_bg, foreground=dark_theme.fg)

    canvases.append(canvas)

    return main_frame

def set_mousewheel(canvas, command):
    """Activate / deactivate mousewheel scrolling when cursor is over / not over the widget respectively."""
    canvas.bind("<Enter>", lambda _: canvas.bind_all('<MouseWheel>', command))
    canvas.bind("<Leave>", lambda _: canvas.unbind_all('<MouseWheel>'))
    return "break"

# Set image location paths for command module
set_resource_location_commands(
    resource_path("edit_20x.png"), 
    resource_path("delete_20x.png"), 
    resource_path("plus_icon_pink_25x.png"), 
    resource_path("minus_icon_pink_25x.png")
)

# default= makes it so other windows that are created also use this
root.iconbitmap(default=resource_path("BunniSenpaiBot.ico"))

# Get icons
edit_icon = ImageTk.PhotoImage(Image.open(resource_path("edit_20x.png")))
delete_icon = ImageTk.PhotoImage(Image.open(resource_path("delete_20x.png")))
delete_icon_large = ImageTk.PhotoImage(Image.open(resource_path("delete_40x.png")))
add_icon = ImageTk.PhotoImage(Image.open(resource_path("add_blue_circle.png")))
under_construction = ImageTk.PhotoImage(Image.open(resource_path("under_construction_anime.jpg")))
moon_icon = ImageTk.PhotoImage(Image.open(resource_path("moon.png")))
dab_icon = ImageTk.PhotoImage(Image.open(resource_path("dab.png")))
death_icon = ImageTk.PhotoImage(Image.open(resource_path("death.png")))
boba_icon = ImageTk.PhotoImage(Image.open(resource_path("boba.png")))
hammer_icon = ImageTk.PhotoImage(Image.open(resource_path("hammer.png")))
refresh_icon = ImageTk.PhotoImage(Image.open(resource_path("refresh_blue.png")))


# Get list of commands from db and sort alphabetically
commands = get_commands()
commands.sort(key=lambda command: command.name)

# Load queue from db
queue = get_queue()

# List of ButtonLabel for each command
button_list = []

# Create NoteBook
book = ttk.Notebook(root)
book.pack(fill=tk.BOTH, expand=1)
book.focus_set()

style = ttk.Style()
style.theme_use('default')

main_cmd_frame = add_new_feature(book, "Commands", style)
main_timer_frame = add_new_feature(book, "Timers", style)
main_queue_frame = add_new_feature(book, "Queue", style)

# Removes dotted line on tab focus
style.layout("Tab",
[('Notebook.tab', {'sticky': 'nswe', 'children':
    [('Notebook.padding', {'side': 'top', 'sticky': 'nswe', 'children':
        #[('Notebook.focus', {'side': 'top', 'sticky': 'nswe', 'children':
            [('Notebook.label', {'side': 'top', 'sticky': ''})],
        #})],
    })],
})]
)

label_construction = tk.Label(canvases[1], image=under_construction, anchor="center")
label_construction.pack(pady=250)

# Change color to the selected tab
style.map("TNotebook.Tab", background=[("selected", dark_theme.bg)])

# Change color of scrollbar
style.configure("Vertical.TScrollbar", background="violet", troughcolor=dark_theme.scroll_bg, arrowcolor=dark_theme.fg)

btn_add = tk.Button(main_cmd_frame, text="New Command", image=add_icon, bg="#5DF15D", activebackground="#86FF70", font=("Consolas", 12, "bold"), compound= "left", padx=5, command=lambda: add_command(root, button_list, main_cmd_frame)).grid(row=0, column=0, padx=(20,20), pady=(10,10), sticky="w")

row_counter = 1
for command in commands:
    label_text = tk.StringVar()
    # SUNKEN, RAISED, GROOVE, RIDGE, and FLAT
    if len(command.response) > 70:
        response_text = command.response[:70] + "..."
    else:
        response_text = command.response

    label_text.set(f"{command.name :<15}" + f"{response_text.strip() :<75}")
    label_command = tk.Label(main_cmd_frame, bg=dark_theme.bg, fg=dark_theme.fg, textvariable=label_text, font=("Consolas", 12, "bold"), relief="ridge")
    label_command.grid(row=row_counter, column=0, padx=(20,20), pady=(10,10))

    btn_edit = tk.Button(main_cmd_frame, image=edit_icon, bg=dark_theme.btn_bg, activebackground=dark_theme.abg, command=lambda c=command: edit_command(c, root, button_list))
    btn_edit.grid(row=row_counter, column=1, padx=5)

    btn_delete = tk.Button(main_cmd_frame, image=delete_icon, bg=dark_theme.btn_bg, activebackground=dark_theme.abg, command=lambda c=command: delete_command(c, button_list))
    btn_delete.grid(row=row_counter, column=2, padx=(0,15))

    button_list.append(ButtonLabel(command.name, label_command, label_text, btn_edit, btn_delete))

    row_counter = row_counter + 1

generate_queue_window(root, main_queue_frame, delete_icon_large, moon_icon, death_icon, dab_icon, boba_icon, hammer_icon, refresh_icon)

root.protocol("WM_DELETE_WINDOW", on_closing)
root.mainloop()
