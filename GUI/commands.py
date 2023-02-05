#!/usr/bin/env python

from tkinter import *
from tkinter import messagebox
from PIL import ImageTk,Image
from db import get_database
import re
from themes import light_theme,dark_theme
from utilities import ButtonLabel,create_checkbox,handle_checkbox
from pymongo.collection import ReturnDocument
import os

dbname = get_database()

# Create a new collection
commands_collection = dbname["commands"]
commands_collection.create_index('name', unique = True)
commands = []
cmds = commands_collection.find()
# testing_change = commands_collection.update_many({}, { "$set": { "onCooldown": False } })
# print(testing_change)

reCmd = r"![\w]{1,13}$"
reResponse = r"[\w\W]*"
reCooldown = r"^[0-9]{1,4}$"

edit_icon = []
delete_icon = []
plus_icon = []
minus_icon = []

def set_resource_location_commands(relative_path, relative_path2, relative_path3, relative_path4):
    global resource_path_edit
    global resource_path_delete
    global resource_path_plus
    global resource_path_minus
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    resource_path_edit,resource_path_delete,resource_path_plus,resource_path_minus = os.path.join(base_path, relative_path),os.path.join(base_path, relative_path2),os.path.join(base_path, relative_path3),os.path.join(base_path, relative_path4)

class Command:
   def __init__(self, id, name, response, cooldown=3000, permission={"Everyone": 1, "Moderators": 1, "Broadcaster": 1}, alias=[]):
      self.id = id
      self.name = name
      self.response = response
      self.cooldown = cooldown
      self.permission = permission
      self.alias = alias

   @classmethod
   def from_document(cls, document):
      return cls(document['_id'], document['name'], document['response'], document['cooldown'], document['permission'], document['alias'])

   def to_document(self):
      return {  
               "name": self.name,
               "response": self.response,
               "cooldown": self.cooldown,
               "permission": self.permission,
               "alias": self.alias
            }

   def __repr__(self):
      return "name: %s\n" \
             "response: %s\n" \
             "cooldown: %s\n" \
             "permission: %s\n" \
             "alias: %s\n" % (self.name, self.response, self.cooldown, self.permission, self.alias)

   def __str__(self):
      return self.name + ': ' + self.response 

def on_return(event, btn_save):
   btn_save.invoke()

def update_button_label(mode, root=None, button=None, button_list=None, new_command=None, response_text=None):
   if mode == 'Update':
      button.name = new_command.name
      button.edit_button.configure(command=lambda c=new_command: edit_command(c, root, button_list))
      button.delete_button.configure(command=lambda c=new_command: delete_command(c, button_list))
      button.label_text.set(f"{new_command.name :<15}" + f"{response_text.strip() :<75}")
   elif mode == 'Delete':
      button.label.destroy()
      button.edit_button.destroy()
      button.delete_button.destroy()
      return

def get_commands():
   for cmd in cmds:
      commands.append(Command(cmd['_id'],
                              cmd['name'],
                              cmd['response'],
                              cmd['cooldown'],
                              cmd['permission'],
                              cmd['alias']))
   
   return commands

def generate_window(mode, command, root, button_list, main_cmd_frame=None):
   # If window is already open then close it before opening new one
   for sapling in root.winfo_children():
        if isinstance(sapling, Toplevel):
            sapling.destroy()

   broadcaster_permission = IntVar()
   moderators_permission = IntVar()
   everyone_permission = IntVar()

   command_name = StringVar()
   command_response = StringVar()
   command_alias = StringVar()
   cooldown_counter = StringVar() # Using StringVar instead of IntVar so able to handle case where entrybox has empty string in it

   window = Toplevel(bg=dark_theme.bg)
   window.title(f"{mode} Command")
   window.geometry("1200x450")
   
   # Create a separate frame to hold the checkboxes
   checkbox_frame = Frame(window, height=100, width=100)

   # Create a separate frame to hold the cooldown
   cooldown_frame = Frame(window, height=50, width=150, bg=dark_theme.bg)

   plus_icon.append(ImageTk.PhotoImage(Image.open(resource_path_plus), master=window)) 
   minus_icon.append(ImageTk.PhotoImage(Image.open(resource_path_minus), master=window)) 

   Label(window, text="Name: ", bg=dark_theme.bg, fg=dark_theme.fg, font=("Consolas", 14, "bold")).grid(row=0, column=0, padx=(25,10), pady=20, sticky="w")
   entry_name = Entry(window, textvariable=command_name, bg=dark_theme.entry_bg, fg=dark_theme.fg, font=("Consolas", 12, "bold"))
   entry_name.focus_set()
   entry_name.grid(row=0, column=1, sticky="w")

   Label(window, text="Message: ", bg=dark_theme.bg, fg=dark_theme.fg, font=("Consolas", 14, "bold")).grid(row=1, column=0, padx=(25,10), pady=20, sticky="w")
   entry_response = Entry(window, textvariable=command_response, width=100, bg=dark_theme.entry_bg, fg=dark_theme.fg, font=("Consolas", 12, "bold"))
   entry_response.grid(row=1, column=1, sticky="w")

   Label(window, text="Cooldown(seconds): ", bg=dark_theme.bg, fg=dark_theme.fg, font=("Consolas", 14, "bold")).grid(row=2, column=0, padx=(25,10), pady=20, sticky="w")
   cooldown_frame.grid(row=2, column=1, sticky="w")
   entry_cooldown = Entry(cooldown_frame, textvariable=cooldown_counter, justify='center', width=5, bg=dark_theme.entry_bg, fg=dark_theme.fg, font=("Consolas", 18, "bold"))
   btn_minus = Button(cooldown_frame, image=minus_icon[0], justify="center", borderwidth=0, bg=dark_theme.bg, activebackground=dark_theme.bg, font=("Consolas", 18, "bold"), padx=10, command=lambda: minus(cooldown_counter, window))
   btn_plus = Button(cooldown_frame, image=plus_icon[0], justify="center", borderwidth=0, bg=dark_theme.bg, activebackground=dark_theme.bg, font=("Consolas", 18, "bold"), padx=10, command=lambda: plus(cooldown_counter))
   btn_minus.pack(side="left", anchor="center", fill="both")
   entry_cooldown.pack(side="left", anchor="center", fill="both", padx=10, pady=5)
   btn_plus.pack(side="left", anchor="center", fill="both")

   Label(window, text="Permissions: ", bg=dark_theme.bg, fg=dark_theme.fg, font=("Consolas", 14, "bold")).grid(row=3, column=0, padx=(25,10), pady=20, sticky="w")
   checkbox_frame.grid(row=3, column=1, sticky="nw")
   checkbox_broadcaster = create_checkbox(checkbox_frame, text=f"{'Broadcaster' :<11}", variable=broadcaster_permission, command=None)
   checkbox_moderators = create_checkbox(checkbox_frame, text=f"{'Moderators' :<11}", variable=moderators_permission, command=None)
   checkbox_everyone = create_checkbox(checkbox_frame, text=f"{'Everyone' :<11}", variable=everyone_permission, command=lambda: handle_checkbox(checkbox_broadcaster, checkbox_moderators, broadcaster_permission, moderators_permission, everyone_permission))

   Label(window, text="Alias: ", bg=dark_theme.bg, fg=dark_theme.fg, font=("Consolas", 14, "bold")).grid(row=4, column=0, padx=(25,10), pady=(20,0), sticky="w")
   entry_alias = Entry(window, textvariable=command_alias, bg=dark_theme.entry_bg, fg=dark_theme.fg, font=("Consolas", 12, "bold"))
   entry_alias.grid(row=4, column=1, pady=(20,0), sticky="w")
   
   if mode == "Add":
      cooldown_counter.set(3)
      btn_save = Button(window, text="Save", bg="#5DF15D", height=2, width=25, activebackground="#86FF70", font=("Consolas", 12, "bold"), command=lambda: update_command('Add', None, root, window, button_list, command_name.get(), command_response.get(), cooldown_counter.get(), { "Broadcaster": broadcaster_permission.get(), "Moderators": moderators_permission.get(), "Everyone": everyone_permission.get() }, command_alias.get(), main_cmd_frame))

   elif mode == "Edit":
      entry_name.insert(0, command.name)
      entry_response.insert(0, command.response)
      cooldown_counter.set(f"{command.cooldown/1000:.0f}")

      broadcaster_permission.set(command.permission["Broadcaster"])
      moderators_permission.set(command.permission["Moderators"])
      everyone_permission.set(command.permission["Everyone"])
      if everyone_permission.get():
         broadcaster_permission.set(1)
         moderators_permission.set(1)
         checkbox_broadcaster.config(state="disabled")
         checkbox_moderators.config(state="disabled")     

      Label(window, text=command.alias, bg=dark_theme.bg, fg="gray", font=("Consolas", 12, "bold")).grid(row=5, column=1, sticky="w")
      btn_save = Button(window, text="Save", bg="#5DF15D", height=2, width=25, activebackground="#86FF70", font=("Consolas", 12, "bold"), command=lambda: update_command('Edit', command, root, window, button_list, command_name.get(), command_response.get(), cooldown_counter.get(), { "Broadcaster": broadcaster_permission.get(), "Moderators": moderators_permission.get(), "Everyone": everyone_permission.get() }, command_alias.get()))    
   
   btn_save.grid(row=6, column=0, padx=(300,15), pady=20, columnspan=2, sticky="w")
   btn_cancel = Button(window, text="Cancel", bg="#FF92A5", height=2, width=25, activebackground="pink", font=("Consolas", 12, "bold"), command=lambda: window.destroy()).grid(row=6, column=1, padx=(380,15), pady=20, columnspan=2, sticky="w")

   # Allow for enter key to confirm data entry
   window.bind('<Return>', lambda event, arg=btn_save: on_return(event, arg))

def add_command(root, button_list, main_cmd_frame):
   generate_window("Add", None, root, button_list, main_cmd_frame)
   
def get_new_command(command):
   global command_update
   command_update = command

def minus(counter, window):
   try:
      if int(counter.get()) < 1:
         messagebox.showerror("Invalid Cooldown", "Error: Cooldown cannot be negative", parent=window)
         return
      counter.set(int(counter.get())-1)
   except Exception as ve:
      counter.set(0)
      print(ve)

def plus(counter):
   try:
      counter.set(int(counter.get())+1)
   except Exception as ve:
      counter.set(1)
      print(ve)

def update_command(mode, old_command, root, window, button_list, new_name, new_response, new_cooldown, new_permission, new_alias, main_cmd_frame=None):
   cmd_match = re.match(reCmd, new_name, re.IGNORECASE)
   alias_match = re.match(reCmd, new_alias, re.IGNORECASE)
   cooldown_match = re.match(reCooldown, new_cooldown)

   edit_icon.append(ImageTk.PhotoImage(Image.open(resource_path_edit), master=window)) 
   delete_icon.append(ImageTk.PhotoImage(Image.open(resource_path_delete), master=window)) 

   # Adding new command
   if mode == "Add":      
      if cooldown_match:
         new_cooldown = int(new_cooldown)*1000
      else:
         messagebox.showerror('Invalid Command', 'Error: Please enter a valid cooldown', parent=window)
         return
      
      if (cmd_match):
         new_command = Command(None, new_name, new_response, new_cooldown, new_permission)

         if (alias_match):
            new_command.alias = [new_alias]
         elif len(new_alias) > 13:
            messagebox.showerror('Invalid Command', 'Error: Please keep alias 13 or less characters', parent=window)
            return
         elif new_alias != "":
            messagebox.showerror('Invalid Command', 'Error: Alias must start with !', parent=window)
            return

         document = new_command.to_document()
         result = commands_collection.insert_one(document)

         if result.inserted_id:
            label_text = StringVar()
            new_command.id = result.inserted_id

            # Get row to place new label and buttons
            row = main_cmd_frame.grid_size()[1]+1

            if len(new_command.response) > 70:
               response_text = new_command.response[:70] + "..."
            else:
               response_text = new_command.response

            label_text.set(f"{new_command.name :<15}" + f"{response_text.strip() :<75}")
            label_command = Label(main_cmd_frame, bg=dark_theme.bg, fg=dark_theme.fg, textvariable=label_text, font=("Consolas", 12, "bold"), relief='ridge')
            label_command.grid(row=row, column=0, padx=(20,20), pady=(10,10))

            btn_edit = Button(main_cmd_frame, image=edit_icon[0], bg=dark_theme.btn_bg, activebackground=dark_theme.abg, command=lambda c=new_command: edit_command(c, root, button_list))
            btn_edit.grid(row=row, column=1, padx=5)

            btn_delete = Button(main_cmd_frame, image=delete_icon[0], bg=dark_theme.btn_bg, activebackground=dark_theme.abg, command=lambda c=new_command: delete_command(c, button_list))
            btn_delete.grid(row=row, column=2)

            button_list.append(ButtonLabel(new_command.name, label_command, label_text, btn_edit, btn_delete))

            window.destroy()
            return

      elif len(new_name) > 13:
         messagebox.showerror('Invalid Command', 'Error: Please keep command name 13 or less characters', parent=window)
      else:
         messagebox.showerror('Invalid Command', 'Error: Please enter a command name of the format !command', parent=window)
         return

   # Editing currently existing command
   elif mode == "Edit":
      query_find = { "name": old_command.name }
      query_check = {
         "name": new_name,
         "_id": { "$ne": old_command.id }
      }

      if cooldown_match:
         new_cooldown = int(new_cooldown)*1000
      elif new_cooldown == "":
         new_cooldown = old_command.cooldown
      
      if (cmd_match):
         # Check for other commands with the same name as the new command being added
         command_exists = commands_collection.count_documents(query_check, limit = 1)
         if command_exists:
            messagebox.showerror('Invalid Command', 'Error: Command already exists!', parent=window)
            return
         
         if (alias_match):
            update_values = { "$set": { "name": new_name, "response": new_response, "cooldown": new_cooldown, "permission": new_permission }, "$addToSet": {"alias": new_alias }  }
         elif len(new_alias) > 13:
            messagebox.showerror('Invalid Command', 'Error: Please keep alias 13 or less characters', parent=window)
            return
         else:
            update_values = { "$set": { "name": new_name, "response": new_response, "cooldown": new_cooldown, "permission": new_permission } }
         
         updated_command = commands_collection.find_one_and_update(query_find, update_values, return_document=ReturnDocument.AFTER)      
         if updated_command:
            new_command = Command.from_document(updated_command)
            if len(new_command.response) > 70:
               response_text = new_command.response[:70] + "..."
            else:
               response_text = new_command.response

            for button in button_list:
               if button.name == old_command.name: 
                  update_button_label('Update', root, button, button_list, new_command, response_text)

            window.destroy()
            return
      elif len(new_name) > 13:
         messagebox.showerror('Invalid Command', 'Error: Please keep command name 13 or less characters', parent=window)
      else:
         messagebox.showerror('Invalid Command', 'Error: Please enter a command name of the format !word', parent=window)

   else:
      messagebox.showerror('Invalid Command Format', 'Error: Please ensure command name starts with !', parent=window)
      return

def edit_command(command, root, button_list):
   generate_window('Edit', command, root, button_list)

def delete_command(command, button_list):
   query_find = { "name": command.name }
   
   result = messagebox.askyesno("Delete Command", f"Are you sure you want to permanently delete {command.name}")
   if result:
      deleted_command = commands_collection.find_one_and_delete(query_find)
      if deleted_command:
         for button in button_list:
            if button.name == command.name: 
               update_button_label('Delete', button=button)
      else:
         print("Didn't find deleted_command")
         messagebox.showerror("Delete Command", "There was a problem deleting the command. Please message the godgamer epic legend")
         return
   else:
      return