import tkinter as tk
from tkinter import messagebox
from tkinter import ttk
from PIL import ImageTk,Image
from db import get_database
import re
from themes import light_theme,dark_theme
from utilities import Buttons,ButtonLabel
from pymongo.collection import ReturnDocument
from pymongo import ASCENDING
import os
from threading import Timer

dbname = get_database()

queue_collection = dbname["queues"]
status_collection = dbname["status"]
queue_collection.create_index('name', unique = True)
queue = []
test_queue = []
buttons = Buttons()

button_labels = []
delete_icon = []

class Queue:
    def __init__(self, id, name, position):
        self.id = id
        self.name = name
        self.position = position

    @classmethod
    def from_document(cls, document):
        return cls(document['_id'], document['name'], document['position'])

    def to_document(self):
        return {
               "name": self.name,
               "position": self.position
            }

    def __repr__(self):
        return "name: %s\n" \
               "position: %s\n" % (self.name, self.position)

def get_queue(users=None):
    if users is None:
        users = queue_collection.find()
        print('reached find statement')

    for user in users:
        queue.append(Queue(user['_id'],
                         user['name'],
                         user['position']
                    ))
    return queue

def generate_queue_window(root, main_queue_frame, delete_icon, moon_icon, death_icon, dab_icon, boba_icon, hammer_icon, refresh_icon):
    btn_start = tk.Button(main_queue_frame, image=death_icon, text="IT BEGINS...\n(start queue)", compound="left", bg=dark_theme.start_bg, activebackground=dark_theme.start_abg, font=("Consolas", 12, "bold"), padx=5, command=lambda: start_queue(death_icon, boba_icon))
    btn_start.grid(row=0, column=0, padx=(20,20), pady=(10,50), sticky="nw")
    # btn_start.grid(row=0, column=0, padx=(80,20), pady=(10,50), sticky="nw")
    btn_next = tk.Button(main_queue_frame, image=dab_icon, text="DAB ON'EM\n(next)", compound="left", bg="violet", activebackground=dark_theme.abg, font=("Consolas", 12, "bold"), padx=5, command=lambda: next_queue(root, moon_icon))
    btn_next.grid(row=0, column=0, padx=(225,0), pady=10, sticky="nw")
    # btn_next.grid(row=0, column=0, padx=(280,0), pady=10, sticky="nw")
    btn_clear = tk.Button(main_queue_frame, image=hammer_icon, text="PURGE", compound="left", bg="red", activebackground="#FF5C5C", font=("Consolas", 12, "bold"), padx=5, command=lambda: clear_queue())
    # btn_clear.grid(row=0, column=0, padx=(800,0), pady=10, sticky="nw")
    btn_clear.grid(row=0, column=0, padx=(395,0), pady=10, sticky="nw")
    btn_refresh = tk.Button(main_queue_frame, image=refresh_icon, height=250, width=250, bg="#404040", activebackground="#545454", padx=5, command=lambda: refresh(main_queue_frame, moon_icon, delete_icon))
    # btn_refresh.grid(row=0, column=0, padx=(10,20), pady=10, sticky="nw")
    # btn_refresh.grid(row=0, column=0, padx=(870,0), pady=10, sticky="nw")
    btn_refresh.place(x=600,y=300)

    buttons.start_button = btn_start
    buttons.next_button = btn_next
    buttons.clear_button = btn_clear

    row_counter = 1
    for user in queue:
        label_queue_text = tk.StringVar()
        if row_counter == 1:
            label_queue = tk.Label(main_queue_frame, image=moon_icon, textvariable=label_queue_text, compound="left", bg=dark_theme.bg, fg=dark_theme.fg, font=("Consolas", 45, "bold"), padx=15)
            label_queue.grid(row=row_counter, column=0, padx=(15,0), sticky="w")
            label_queue_text.set(f"{user.name}")

            button_labels.append(ButtonLabel(user.name, label_queue, label_queue_text))
        else:
            label_queue = tk.Label(main_queue_frame, textvariable=label_queue_text, bg=dark_theme.bg, fg=dark_theme.fg, font=("Consolas", 20, "bold"), pady=5, relief="ridge")
            label_queue.grid(row=row_counter, column=0, padx=(15,15), pady=(5,10), sticky="w")
            label_queue_text.set(f"{user.position :<3}" + f"{user.name :<26}")

            btn_delete = tk.Button(main_queue_frame, image=delete_icon, bg=dark_theme.btn_bg, activebackground=dark_theme.abg, command=lambda u=user: remove_user(u))
            btn_delete.grid(row=row_counter, column=0, padx=(470,0), sticky="w")

            button_labels.append(ButtonLabel(user.name, label_queue, label_queue_text, delete_button=btn_delete))

        row_counter += 1

def next_queue(root, moon_icon):
    if len(button_labels) == 0:
        return

    current_user = button_labels[0].name
    user_removed = queue_collection.find_one_and_delete({ "name": current_user })
    if user_removed:
        button_labels[0].label.destroy()
        del button_labels[0]

        if len(button_labels) == 0:
            return

        for button_label in button_labels:
            new_position = int(button_label.label_text.get().split()[0]) - 1
            button_label.label_text.set(f"{new_position :<3}" + f"{button_label.name :<26}")

        update_positions = queue_collection.update_many({}, { "$inc": { "position": -1 } })
        button_labels[0].delete_button.destroy()
        button_labels[0].label_text.set(button_labels[0].name)
        button_labels[0].label.config(image=moon_icon, compound="left", font=("Consolas", 45, "bold"), padx=15, relief="flat")

        # Disable next button temporarily to prevent accidental double clicks
        buttons.next_button.config(state="disabled")
        delay_enable = Timer(0.3, enable_button, [buttons.next_button])
        delay_enable.start()

    else:
        print("Didn't find user_removed")
        messagebox.showerror("Remove User", "There was a problem removing the user. Please message the godgamer epic legend")
        return

    # Copy name of person currently up to clipboard
    root.clipboard_clear()
    root.clipboard_append(button_labels[0].name)
    root.update()
    return

def start_queue(death_icon, boba_icon):
    query_status = { "name": "Queue"}
    update_status = [ { "$set": { "isOn": { "$not": "$isOn" } } } ] # Toggles queue on and off
    
    updated_status = status_collection.find_one_and_update(query_status, update_status, return_document=ReturnDocument.AFTER)      
    if updated_status['isOn'] == True:
        buttons.start_button.config(image=boba_icon, text="snack time!!!\n(stop queue)", background=dark_theme.cancel_bg, activebackground=dark_theme.abg)
    elif updated_status['isOn'] == False:
        buttons.start_button.config(image=death_icon, text="IT BEGINS...\n(start queue)", bg=dark_theme.start_bg, activebackground=dark_theme.start_abg)
    else:
        messagebox.showerror("Queue", "There was a problem with the queue. Please message the godgamer epic legend")
    return

def clear_queue():
    if len(button_labels) == 0:
        return

    if messagebox.askyesno("Clear Queue", f"Are you sure you want to bop the queue? Bops hurt, you know!"):
        deleted_users = queue_collection.delete_many({})
        print(deleted_users)
        if deleted_users:
            button_labels[0].label.destroy()
            for user in button_labels[1:]:
                user.label.destroy()
                user.delete_button.destroy()
            button_labels.clear()
            queue.clear()
        return

def refresh(main_queue_frame, moon_icon, delete_icon):
    last_position = len(queue) + 1
    new_users = queue_collection.find({"position": { "$gte": last_position }}).sort("position", ASCENDING)
    get_queue(new_users)
    
    row_counter = last_position
    for user in queue[last_position-1:]:
        print(user)
        label_queue_text = tk.StringVar()
        if row_counter == 1:
            label_queue = tk.Label(main_queue_frame, image=moon_icon, textvariable=label_queue_text, compound="left", bg=dark_theme.bg, fg=dark_theme.fg, font=("Consolas", 45, "bold"), padx=15)
            label_queue.grid(row=row_counter, column=0, padx=(15,0), sticky="w")
            label_queue_text.set(f"{user.name}")

            button_labels.append(ButtonLabel(user.name, label_queue, label_queue_text))
        else:
            label_queue = tk.Label(main_queue_frame, textvariable=label_queue_text, bg=dark_theme.bg, fg=dark_theme.fg, font=("Consolas", 20, "bold"), pady=5, relief="ridge")
            label_queue.grid(row=row_counter, column=0, padx=(15,15), pady=(5,10), sticky="w")
            label_queue_text.set(f"{user.position :<3}" + f"{user.name :<26}")

            btn_delete = tk.Button(main_queue_frame, image=delete_icon, bg=dark_theme.btn_bg, activebackground=dark_theme.abg, command=lambda u=user: remove_user(u))
            btn_delete.grid(row=row_counter, column=0, padx=(470,0), sticky="w")

            button_labels.append(ButtonLabel(user.name, label_queue, label_queue_text, delete_button=btn_delete))

        row_counter += 1


    return

def remove_user(user):
    query_find = { "name": user.name }
    position = user.position
   
    if messagebox.askyesno("Remove User", f"Are you sure you want to remove {user.name} from queue?"):
      user_removed = queue_collection.find_one_and_delete(query_find)
      if user_removed:
         for button in button_labels:
            if button.name == user.name: 
                button.label.destroy()
                button.delete_button.destroy()
                index = button_labels.index(button)
                button_labels.remove(button)
                break
      else:
         print("Didn't find user_removed")
         messagebox.showerror("Remove User", "There was a problem removing the user. Please message the godgamer epic legend")
         return
    else:
        return

    print(button_labels[index:])
    # Decrement rest of position values on labels
    for button_label in button_labels[index:]:
        new_position = int(button_label.label_text.get().split()[0]) - 1
        button_label.label_text.set(f"{new_position :<3}" + f"{button_label.name :<26}")

    # Decrement local queue positions
    for u in queue:
        if u.position > position:
            u.position -= 1
            
    update_positions = queue_collection.update_many({"position": { "$gt": position }}, { "$inc": { "position": -1 } })


def enable_button(*button):
    print(button)
    button[0].config(state="normal")
    return